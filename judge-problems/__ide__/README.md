# IDE Problem for Judge Server

This directory contains the special `__ide__` problem configuration for the DMOJ judge server. This problem is used exclusively for Online IDE code execution (not grading).

## Deployment

Copy this entire `__ide__` directory to your judge server's problem directory.

### Method 1: Direct Copy

```bash
# On the judge server
cp -r /path/to/lcoj-site/judge-problems/__ide__ /path/to/judge/problems/
```

### Method 2: Using DMOJ's Problem Management

If you're using DMOJ's problem management system:

1. Package this directory as a ZIP file (optional)
2. Place it in the judge server's problem root directory
3. Ensure the judge server has read access to the files

## File Structure

```
__ide__/
├── init.yml      # Problem configuration (custom_judge, no test cases)
├── grader.py     # Custom grader that reads stdin from meta field
└── README.md     # This file
```

## How It Works

1. **No Test Cases**: Unlike regular problems, `__ide__` has no test case files
2. **Custom Grader**: Uses `grader.py` to handle execution
3. **Stdin from Meta**: Reads stdin data from `submission.meta['stdin']`
4. **Always AC**: Returns Accepted (AC) status since we're executing, not grading
5. **Output Capture**: Captures both stdout and stderr for display

## Configuration

The `init.yml` specifies:
- No archive or test cases
- Custom grader (`grader.py`)
- Unbuffered output for real-time results
- 24 MB output limit

## Security Notes

- IDE submissions should have lower time limits (recommended: 15s)
- Memory limits should be reasonable (recommended: 256MB)
- Consider rate limiting IDE submissions
- Monitor judge server load

## Testing

After deployment, test with a simple submission:

```python
# Python
name = input("Enter your name: ")
print(f"Hello, {name}!")
```

With `meta['stdin'] = "World"`, output should be "Hello, World!"

## Troubleshooting

### Problem Not Found
- Ensure `__ide__` directory is in the judge server's problem path
- Restart the judge server to reload problems
- Check judge server logs for errors

### Grader Errors
- Verify `grader.py` syntax is correct
- Check that all imports are available on the judge server
- Review judge server logs for Python exceptions

### No Output
- Check that `meta['stdin']` is being passed correctly
- Verify submission is using `problem_id='__ide__'`
- Check output limits in `init.yml`

## Support

For issues or questions:
1. Check judge server logs: `/var/log/judge/judge.log` (or configured location)
2. Test with simple code first (e.g., `print("test")`)
3. Verify problem is loaded: Check judge server handshake includes `__ide__`
