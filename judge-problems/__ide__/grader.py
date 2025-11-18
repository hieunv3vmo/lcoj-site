"""
Custom grader for Online IDE execution.

This grader reads stdin data from the submission's meta field and executes
the code with that input, returning stdout and stderr without grading.
"""

from dmoj.checkers import CheckerResult
from dmoj.graders.standard import StandardGrader
from dmoj.problem import BaseTestCase
from dmoj.result import Result
from dmoj.config import ConfigNode
from dmoj.cptbox.utils import MemoryIO


class IDETestCase(BaseTestCase):
    """
    A test case that uses stdin from meta instead of files.
    This allows IDE to execute code with arbitrary input.
    """

    def __init__(self, problem, stdin_data):
        self.problem = problem
        self.config = ConfigNode({
            'in': None,  # No input file
            'out': None,  # No output file
            'points': 1,
            'output_prefix_length': 128,
            'output_limit_length': 25165824,  # 24 MB
            'binary_data': False,
            'wall_time_factor': 3,
            'file_io': None,
            'symlinks': {},
        })
        self.points = 1
        self.position = 0
        self.batch = 0
        self.output_prefix_length = 128
        self.has_binary_data = False

        # Store stdin data
        if isinstance(stdin_data, str):
            self._stdin_data = stdin_data.encode('utf-8')
        elif stdin_data is None:
            self._stdin_data = b''
        else:
            self._stdin_data = stdin_data

    def input_data(self):
        """Return stdin data as bytes."""
        return self._stdin_data

    def input_data_io(self):
        """Return stdin data as a file-like object."""
        io = MemoryIO()
        io.write(self._stdin_data)
        io.seal()
        return io

    def output_data(self):
        """No expected output for IDE mode."""
        return b''

    def checker(self):
        """
        Always return True (full points) - we're not grading, just executing.
        """
        def always_pass(*args, **kwargs):
            return CheckerResult(True, 1.0)
        return always_pass

    def free_data(self):
        """Clean up resources."""
        pass


class IDEGrader(StandardGrader):
    """
    Custom grader for IDE execution.
    Executes code and returns stdout/stderr without grading.
    """

    def grade(self, case):
        """
        Execute code and capture output.
        Always returns AC (Accepted) since we're executing, not grading.
        """
        result = Result(case)

        # Get stdin data from the test case
        stdin_io = case.input_data_io()

        # Launch the process with stdin
        self._launch_process(case, stdin_io)

        # Capture output and errors
        error = self._interact_with_process(case, result)

        # Populate result with execution metrics
        process = self._current_proc
        assert process is not None
        self.populate_result(error, result, process)

        # For IDE, we always give full points - we're executing, not grading
        result.result_flag = Result.AC
        result.points = case.points

        # Store stderr in feedback field so the site can display it
        if error:
            stderr_text = error.decode('utf-8', errors='replace')
            # Only include stderr if it's not empty
            if stderr_text.strip():
                result.feedback = stderr_text

        case.free_data()
        return result


def grade(judge, problem, language, source):
    """
    Entry point for the custom grader.

    Args:
        judge: JudgeWorker instance
        problem: Problem instance
        language: Language key (e.g., 'PY3', 'CPP17')
        source: Source code as bytes

    Returns:
        Result object with execution details
    """
    # Get stdin from meta field
    stdin_data = problem.meta.get('stdin', '')

    # Create a single test case with the custom stdin
    test_case = IDETestCase(problem, stdin_data)

    # Create grader instance and compile the code
    grader = IDEGrader(judge, problem, language, source)

    # Execute and return result
    return [grader.grade(test_case)]
