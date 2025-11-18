# IDE Feature Deployment Guide

This guide explains how to deploy the Online IDE feature with full judge integration for executing code with custom stdin.

## Overview

The IDE feature now supports **actual code execution** through the judge system using a special `__ide__` problem and custom grader that reads stdin from the submission's meta field.

## Architecture

### Components

1. **LCOJ Site** (`/home/user/lcoj-site/`)
   - IDE views for creating and polling submissions
   - Migrations for `__ide__` problem and submission meta field
   - Frontend with result polling

2. **Judge Server** (`judge-problems/__ide__/`)
   - Special IDE problem configuration
   - Custom grader that reads stdin from meta
   - Returns stdout/stderr without grading

### Data Flow

```
User types code + input
    ↓
Frontend sends to /ide/execute
    ↓
Backend creates Submission with meta={'stdin': input_data}
    ↓
Submission sent to judge-server via judge_request
    ↓
Judge loads __ide__ problem with custom grader
    ↓
Grader reads stdin from submission.meta['stdin']
    ↓
Code executes with that stdin
    ↓
Results returned to site
    ↓
Frontend polls /ide/status/<submission_id>
    ↓
User sees stdout, stderr, time, memory
```

## Installation Steps

### Step 1: Deploy IDE Problem to Judge Server

Copy the `__ide__` problem directory to your judge server's problem directory:

```bash
# On the LCOJ site server
scp -r /home/user/lcoj-site/judge-problems/__ide__ judge-server:/path/to/judge/problems/

# OR if you have direct access to the judge server
cp -r /home/user/lcoj-site/judge-problems/__ide__ /path/to/judge/problems/
```

**Important**: Ensure the judge server has read access to the files:

```bash
# On the judge server
cd /path/to/judge/problems/__ide__
chmod 644 init.yml grader.py
```

### Step 2: Restart Judge Server

The judge server needs to reload the problem list to recognize `__ide__`:

```bash
# On the judge server
sudo systemctl restart judge
# OR
sudo service judge restart
# OR if running manually
kill -SIGUSR2 $(pgrep -f dmoj-cli)  # Reload problems without restart
```

Verify the problem is loaded:

```bash
# Check judge logs for "__ide__" in problem list
tail -f /var/log/judge/judge.log | grep -i ide
```

You should see something like:

```
[INFO] Loaded problem: __ide__
```

### Step 3: Run Database Migrations

On the LCOJ site server:

```bash
cd /home/user/lcoj-site

# Run migrations to:
# - Create __ide__ problem in database
# - Add meta field to Submission model
python manage.py migrate judge

# Verify migrations
python manage.py showmigrations judge | grep -E "(0214|0215)"
```

Expected output:
```
 [X] 0214_create_ide_problem
 [X] 0215_add_submission_meta
```

### Step 4: Verify IDE Problem Exists

Check that the `__ide__` problem was created:

```bash
python manage.py shell
```

```python
from judge.models import Problem
ide_problem = Problem.objects.get(code='__ide__')
print(f"IDE Problem: {ide_problem.name}")
print(f"Time Limit: {ide_problem.time_limit}s")
print(f"Memory Limit: {ide_problem.memory_limit} KB")
# Should output:
# IDE Problem: Online IDE
# Time Limit: 15.0s
# Memory Limit: 262144 KB
```

### Step 5: Configure Settings (Optional)

Add to `dmoj/local_settings.py`:

```python
# IDE Configuration (optional, defaults shown)
IDE_REQUIRE_LOGIN = False  # Set to True to require login for IDE access
```

### Step 6: Test the IDE

1. **Navigate to IDE**: Go to `https://your-site.com/ide/`

2. **Write test code**:
   ```python
   name = input("Enter your name: ")
   print(f"Hello, {name}!")
   ```

3. **Add stdin**:
   ```
   World
   ```

4. **Click "Run Code"**

5. **Expected output**:
   ```
   Hello, World!
   ```

### Step 7: Frontend Integration

The frontend in `templates/ide/ide.html` already has polling logic, but here's how it works:

1. User clicks "Run Code"
2. JavaScript sends code + stdin to `/ide/execute`
3. Server returns `{submission_id: 123}`
4. JavaScript polls `/ide/status/123` every second
5. When status is "D" (Done), display results

Example AJAX implementation:

```javascript
function runCode() {
    var code = editor.getValue();
    var language = $('#id_language').val();
    var stdin = $('#stdin-input').val();

    $.ajax({
        url: '/ide/execute',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            language: language,
            source: code,
            stdin: stdin
        }),
        success: function(response) {
            if (response.status === 'success') {
                pollSubmissionStatus(response.submission_id);
            } else {
                showError(response.error || 'Unknown error');
            }
        },
        error: function(xhr) {
            showError(xhr.responseJSON?.error || 'Failed to execute code');
        }
    });
}

function pollSubmissionStatus(submissionId) {
    var pollInterval = setInterval(function() {
        $.ajax({
            url: '/ide/status/' + submissionId,
            method: 'GET',
            success: function(response) {
                if (response.status === 'D') {  // Done
                    clearInterval(pollInterval);
                    displayResults(response);
                } else if (response.status === 'CE' || response.status === 'IE') {
                    clearInterval(pollInterval);
                    displayError(response);
                }
                // Otherwise keep polling
            },
            error: function(xhr) {
                clearInterval(pollInterval);
                showError('Failed to get submission status');
            }
        });
    }, 1000);  // Poll every second
}

function displayResults(response) {
    $('#output-stdout').text(response.stdout || '(no output)');
    $('#output-stderr').text(response.stderr || '');
    $('#output-time').text((response.time || 0).toFixed(3) + 's');
    $('#output-memory').text((response.memory || 0).toFixed(2) + ' MB');
}
```

## Troubleshooting

### Problem: "IDE problem not configured"

**Cause**: Migrations not run or __ide__ problem not created

**Solution**:
```bash
python manage.py migrate judge
python manage.py shell
>>> from judge.models import Problem
>>> Problem.objects.filter(code='__ide__').exists()  # Should be True
```

### Problem: "No online judge available"

**Cause**: Judge server not running or not connected

**Solution**:
```bash
# Check judge status
sudo systemctl status judge
# Check bridge connection
tail -f /var/log/site/site.log | grep judge
```

### Problem: "Submission stuck in QU status"

**Cause**: Judge server hasn't loaded __ide__ problem

**Solution**:
```bash
# On judge server, check logs
tail -f /var/log/judge/judge.log

# Look for errors about "__ide__" problem
# Restart judge to reload problems
sudo systemctl restart judge
```

### Problem: Execution returns "Internal Error"

**Cause**: Custom grader has errors

**Solution**:
```bash
# Check judge server logs for Python tracebacks
tail -f /var/log/judge/judge.log | grep -A 20 "grader.py"

# Common issues:
# 1. Syntax error in grader.py - fix and restart judge
# 2. Import errors - ensure dmoj packages are available
# 3. Permission errors - chmod 644 on grader.py
```

### Problem: No stdin data received by program

**Cause**: Meta field not being passed or custom grader not reading it

**Solution**:
1. Check submission was created with meta:
   ```python
   from judge.models import Submission
   sub = Submission.objects.get(id=SUBMISSION_ID)
   print(sub.meta)  # Should show {'stdin': '...', 'ide_mode': True}
   ```

2. Check judge-server logs for meta field:
   ```bash
   tail -f /var/log/judge/judge.log | grep meta
   ```

3. Verify custom grader is being used:
   ```bash
   # In judge-server problem directory
   cat /path/to/problems/__ide__/init.yml | grep custom_judge
   # Should show: custom_judge: grader.py
   ```

### Problem: Frontend not showing results

**Cause**: Polling not working or incorrect URL

**Solution**:
1. Check browser console for JavaScript errors
2. Verify submission status URL is correct: `/ide/status/<id>`
3. Test API directly in browser: `https://your-site.com/ide/status/123`

## Testing Checklist

- [ ] Simple output: `print("Hello World")` → See output
- [ ] With stdin: `print(input())` with "test" → See "test" output
- [ ] Multiple inputs: `print(input() + input())` with "A\nB" → See "AB"
- [ ] Compilation (C++):
  ```cpp
  #include <iostream>
  using namespace std;
  int main() {
      string name;
      cin >> name;
      cout << "Hello, " << name << endl;
      return 0;
  }
  ```
- [ ] Compile error: `print(` → See compile error message
- [ ] Runtime error: `1/0` → See runtime error
- [ ] Time limit: Infinite loop → See TLE
- [ ] Memory limit: Large array allocation → See MLE

## Security Considerations

1. **Rate Limiting**: Consider adding rate limits to `/ide/execute`
   ```python
   from django.views.decorators.ratelimit import ratelimit

   @ratelimit(key='ip', rate='10/m')  # 10 requests per minute
   def post(self, request):
       ...
   ```

2. **Resource Limits**: Configured in `__ide__` problem:
   - Time: 15 seconds (vs 1-5s for problems)
   - Memory: 256 MB
   - These limits are enforced by judge-server

3. **Anonymous Access**: Currently allows anonymous execution
   - Change `IDE_REQUIRE_LOGIN = True` to require login
   - Or create rate limits per IP for anonymous users

4. **Submission Visibility**: IDE submissions are private
   - Only the user who created it can view results
   - Or staff/admin users

## Performance Considerations

- **Judge Load**: IDE submissions use the same judge queue as problem submissions
  - Monitor judge server load
  - Consider dedicating a judge server for IDE if load is high
  - Can use `banned-judges` to route IDE submissions differently

- **Database**: IDE creates Submission and SubmissionSource records
  - Consider periodic cleanup of old IDE submissions
  - Example cleanup script:
    ```python
    from django.utils import timezone
    from datetime import timedelta
    from judge.models import Submission

    # Delete IDE submissions older than 7 days
    cutoff = timezone.now() - timedelta(days=7)
    Submission.objects.filter(
        problem__code='__ide__',
        date__lt=cutoff
    ).delete()
    ```

## Next Steps

1. **Add IDE to navigation menu**:
   - Admin → Navigation bars
   - Add item: Label="IDE", Path="/ide/"

2. **Customize time/memory limits** per language (optional):
   - Edit `/path/to/problems/__ide__/init.yml`
   - Add language-specific limits

3. **Add code templates** (optional):
   - Modify frontend to provide starting code per language

4. **Add syntax checking** (optional):
   - Use  ACE editor's built-in syntax checking

5. **Add sharing** (optional):
   - Create shareable links to IDE sessions

## Support

For issues or questions:
- Check judge server logs: `/var/log/judge/judge.log`
- Check site logs: `/var/log/site/site.log`
- Review JUDGE_SERVER_ANALYSIS.md for technical details
- Test with simple code first to isolate issues

## Summary

The IDE feature is now fully integrated with the judge system and can execute code with custom stdin. The key components are:

1. `__ide__` problem on judge-server with custom grader
2. Submission.meta field for passing stdin
3. Modified judgeapi to include meta in requests
4. Status polling endpoint for results

All components are in place and ready for testing!
