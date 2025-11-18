# Judge Server Analysis for IDE Feature

## Overview

This document analyzes the judge-server capabilities and provides a solution for implementing IDE code execution with custom stdin input.

## Judge Server Architecture

### Current Design

The judge-server (https://github.com/luyencode/judge-server) is designed for **problem-based grading** with the following architecture:

1. **Submission Request Packet** (`dmoj/packet.py:255-271`)
   ```python
   {
       'name': 'submission-request',
       'submission-id': int,
       'problem-id': str,
       'language': str,
       'source': str,
       'time-limit': float,
       'memory-limit': int,
       'short-circuit': bool,
       'meta': dict,
       'storage-namespace': str (optional)
   }
   ```

2. **Problem Structure** (`dmoj/problem.py`)
   - Each problem requires a directory with `init.yml` config file
   - Test cases are stored as `.in` (input) and `.out` (output) files
   - Usually packaged in a ZIP archive
   - Test case input comes from **FILES**, not from the submission request

3. **Grading Flow** (`dmoj/judge.py` and `dmoj/graders/standard.py`)
   - Problem loads test cases from files
   - StandardGrader reads input from `case.input_data_io()` (a file)
   - Executes code with that input
   - Compares output against expected output file
   - Returns grading results

### Key Finding: Meta Field

**IMPORTANT**: The submission request includes a `meta` dictionary that:
- Is passed through to the Problem constructor (`dmoj/judge.py:455`)
- Is accessible in graders (`dmoj/graders/standard.py:118`)
- Can contain arbitrary data

This is our solution for passing custom stdin!

## Solution: Special IDE Problem with Custom Grader

### Approach

Create a special problem called `__ide__` that uses the `meta` field to pass custom stdin data. This approach:
- ✅ Requires minimal changes (only to judge-server)
- ✅ Reuses existing submission infrastructure
- ✅ Works with current protocol
- ✅ No changes needed to LCOJ site code (just configuration)

### Implementation Steps

#### Step 1: Create IDE Problem on Judge Server

Create directory `/path/to/problems/__ide__/` with the following structure:

```
__ide__/
├── init.yml          # Problem configuration
└── grader.py         # Custom grader for IDE execution
```

**`init.yml`:**
```yaml
# IDE problem configuration
archive: null
test_cases: []
unbuffered: true
custom_judge: grader.py
```

**`grader.py`:**
```python
from dmoj.checkers import CheckerOutput, CheckerResult
from dmoj.graders.standard import StandardGrader
from dmoj.problem import TestCase, BaseTestCase
from dmoj.result import Result
from dmoj.config import ConfigNode
from dmoj.cptbox.utils import MemoryIO
import subprocess

class IDETestCase(BaseTestCase):
    """A test case that uses stdin from meta instead of files."""

    def __init__(self, problem, stdin_data):
        self.problem = problem
        self.config = ConfigNode({
            'in': None,
            'out': None,
            'points': 1,
            'output_prefix_length': 128,
            'output_limit_length': 25165824,
            'binary_data': False,
            'wall_time_factor': 3,
            'file_io': None,
            'symlinks': {},
        })
        self.points = 1
        self.position = 0
        self.batch = 0
        self.has_binary_data = False
        self._stdin_data = stdin_data.encode('utf-8') if isinstance(stdin_data, str) else stdin_data

    def input_data(self):
        return self._stdin_data

    def input_data_io(self):
        io = MemoryIO()
        io.write(self._stdin_data)
        io.seal()
        return io

    def output_data(self):
        # No expected output for IDE mode
        return b''

    def checker(self):
        # Always return True (full points) - we're not grading, just executing
        def always_pass(*args, **kwargs):
            return CheckerResult(True, 1.0)
        return always_pass

    def free_data(self):
        pass


class Grader(StandardGrader):
    """Custom grader for IDE execution."""

    def grade(self, case):
        """Override to capture and return stdout/stderr."""
        result = Result(case)

        # Get stdin data from meta
        stdin_io = case.input_data_io()

        # Launch the process
        self._launch_process(case, stdin_io)

        # Capture output
        error = self._interact_with_process(case, result)

        process = self._current_proc
        assert process is not None
        self.populate_result(error, result, process)

        # For IDE, we always give full points - we're executing, not grading
        result.result_flag = Result.AC
        result.points = case.points

        # Store both stdout and stderr in feedback
        # The site can parse this to show to the user
        if error:
            result.feedback = f"STDERR:\n{error.decode('utf-8', errors='replace')}"

        case.free_data()
        return result


def grade(judge, problem, language, source):
    """Entry point for custom grader."""
    # Get stdin from meta
    stdin_data = problem.meta.get('stdin', '')

    # Create a single test case with the custom stdin
    test_case = IDETestCase(problem, stdin_data)

    # Create grader instance
    grader = Grader(judge, problem, language, source)

    # Grade the single test case
    return grader.grade(test_case)
```

#### Step 2: Modify LCOJ Site's IDE Execution View

Update `judge/views/ide.py` in the LCOJ site to use the `__ide__` problem and pass stdin via meta:

```python
def post(self, request):
    # ... existing validation code ...

    # Create IDE submission
    from judge.models import Submission, SubmissionSource

    submission = Submission(
        user=request.user.profile if request.user.is_authenticated else None,
        problem_id='__ide__',  # Special IDE problem
        language=language,
        source=SubmissionSource(source=source_code),
        time_limit=15.0,  # 15 seconds for IDE
        memory_limit=262144,  # 256 MB
        meta={
            'stdin': stdin_data,  # Pass stdin through meta field!
            'ide_mode': True,
        }
    )
    submission.save()

    # Submit to judge
    from judge.judgeapi import judge_request
    response = judge_request({
        'name': 'submission-request',
        'submission-id': submission.id,
        'problem-id': '__ide__',
        'language': language.key,
        'source': source_code,
        'time-limit': 15.0,
        'memory-limit': 262144,
        'short-circuit': False,
        'meta': {
            'stdin': stdin_data,
            'ide_mode': True,
        },
    })

    return JsonResponse({
        'status': 'queued',
        'submission_id': submission.id,
    })
```

#### Step 3: Handle IDE Results

Update the submission result handler to detect IDE submissions and return stdout/stderr:

```python
# In the submission status/result endpoint
if submission.problem_id == '__ide__':
    # IDE execution result
    return JsonResponse({
        'status': 'done',
        'result': submission.result,
        'stdout': submission.case_results[0].output if submission.case_results else '',
        'stderr': submission.case_results[0].feedback if submission.case_results else '',
        'time': submission.time,
        'memory': submission.memory,
        'exit_code': 0 if submission.result == 'AC' else 1,
    })
```

## Alternative: Simpler Approach Without Custom Grader

If modifying judge-server is not possible, we can create a dummy problem with a single test case:

1. Create `__ide__` problem with:
   - `init.yml` with standard grading
   - Single test case: `1.in` (empty), `1.out` (empty)
   - Standard checker that accepts any output

2. Ignore the stdin from test case and inject it via process stdin manually

However, this is less clean and doesn't provide the flexibility of custom stdin.

## Recommendation

**Use Option 1 (Custom Grader)** because:

1. ✅ Clean separation between IDE and problem grading
2. ✅ Full control over stdin/stdout/stderr handling
3. ✅ Can customize time limits for IDE (e.g., 15s instead of problem limits)
4. ✅ Easy to extend with additional features (e.g., multiple files, arguments)
5. ✅ Reuses existing judge infrastructure

## Next Steps

1. Create the `__ide__` problem directory on the judge server
2. Add `init.yml` and `grader.py` as specified above
3. Update `judge/views/ide.py` to submit to `__ide__` problem with stdin in meta
4. Test with various languages and stdin inputs
5. Handle results in the frontend

## Security Considerations

- IDE submissions should have lower time limits (e.g., 15s) to prevent abuse
- Consider rate limiting IDE submissions per user
- Memory limits should be reasonable (e.g., 256MB)
- Monitor judge server load from IDE submissions

## Testing Plan

1. Test basic execution: Python print("Hello World")
2. Test with stdin: Python program that reads input()
3. Test with multiple lines of stdin
4. Test with compilation (C++, Java)
5. Test with errors (compile errors, runtime errors)
6. Test with various languages (Python, C++, Java, Ruby, Go, etc.)
7. Test timeout scenarios
8. Test memory limit scenarios
