# Online IDE Feature

## Overview

This document describes the new Online IDE feature that allows users to write, compile, and execute code in multiple programming languages directly from the browser, similar to Ideone.com.

## Features

### Core Features
- **Multi-language Support**: Support for 60+ programming languages through the existing judge system
- **ACE Code Editor**: Full-featured code editor with syntax highlighting, auto-completion, and themes
- **Code Execution**: Execute code and see output in real-time
- **Standard Input**: Provide input data for programs that read from stdin
- **Session Management**: Save and load code sessions (for logged-in users)
- **Local Storage**: Auto-save code to browser's localStorage

### User Interface
- **Split-pane Layout**: Code editor on the left, input/output on the right
- **Language Selector**: Dropdown with all available languages
- **Run Button**: Execute code with one click
- **Save Session**: Save current code and input (requires login)
- **Recent Sessions**: Quick access to previously saved sessions

## Implementation Details

### Files Created/Modified

#### Models
- **`judge/models/ide.py`**: New IDESession model for saving user sessions
  - Stores: user, language, source code, stdin data, timestamps
  - Supports both authenticated and anonymous users (with session keys)

#### Views
- **`judge/views/ide.py`**: IDE views and API endpoints
  - `OnlineIDEView`: Main IDE page view
  - `IDEExecuteView`: API endpoint for code execution
  - `IDESaveSessionView`: API endpoint to save sessions
  - `IDELoadSessionView`: API endpoint to load sessions

#### Templates
- **`templates/ide/ide.html`**: IDE user interface
  - ACE editor integration
  - AJAX-based code execution
  - Session management UI
  - Responsive design

#### URLs
- `/ide/` - Main IDE page
- `/ide/execute` - Execute code (POST)
- `/ide/save` - Save session (POST)
- `/ide/load/<session_id>` - Load session (GET)

#### Modified Files
- **`judge/models/__init__.py`**: Added IDESession import
- **`dmoj/urls.py`**: Added IDE URL patterns

## Configuration

### Settings

Add to `dmoj/settings.py`:

```python
# IDE Configuration
IDE_REQUIRE_LOGIN = False  # Set to True to require login for IDE access
```

### Database Migration

Run migrations to create the IDESession table:

```bash
python manage.py makemigrations
python manage.py migrate
```

### Navigation Menu

To add the IDE to the navigation menu:

1. Log in to Django admin
2. Go to "Navigation bars"
3. Add a new navigation item:
   - **Label**: "IDE" or "Online IDE"
   - **Key**: "ide"
   - **Path**: "/ide/"
   - **Order**: (your preferred position)

## Usage

### For Users

1. **Access the IDE**:
   - Navigate to `/ide/` on your site
   - Example: `https://yourdomain.com/ide/`

2. **Write Code**:
   - Select your programming language from the dropdown
   - Write or paste your code in the editor
   - (Optional) Provide input data in the "Standard Input" section

3. **Run Code**:
   - Click the "Run Code" button
   - View output in the "Output" section

4. **Save Session** (logged-in users only):
   - Click "Save Session" to save your current code
   - Access recent sessions from the sidebar
   - Click on a session to load it

5. **Keyboard Shortcuts**:
   - `Ctrl+S` (Windows/Linux) or `Cmd+S` (Mac): Save code to browser storage

### For Administrators

1. **Enable/Disable Login Requirement**:
   - Set `IDE_REQUIRE_LOGIN = True` in settings to require login
   - Set `IDE_REQUIRE_LOGIN = False` to allow anonymous access

2. **Monitor Usage**:
   - IDE sessions are stored in the database
   - Use Django admin to view/manage sessions

## Technical Architecture

### Code Execution Flow

Currently, the IDE has a placeholder for code execution. To enable full execution:

1. **Option 1: Extend Judge System** (Recommended)
   - Modify judge to support "IDE mode" submissions
   - Create lightweight submission type for IDE
   - Return stdout/stderr directly without full test case processing

2. **Option 2: Direct Execution** (Simpler but less secure)
   - Use subprocess to execute code directly
   - Implement sandboxing and resource limits
   - Only suitable for trusted environments

### Current Implementation

The `IDEExecuteView` currently returns a placeholder response:
```python
return JsonResponse({
    'status': 'queued',
    'message': 'Code execution has been queued. Judge integration coming soon.',
})
```

To implement full execution, you'll need to:
1. Create a special submission type for IDE
2. Modify the judge protocol to support stdin/stdout mode
3. Return execution results without test case grading

## Security Considerations

1. **Rate Limiting**: Consider implementing rate limiting for code execution
2. **Resource Limits**: Ensure judge system enforces time/memory limits
3. **Input Validation**: Validate source code size (max 65536 characters)
4. **Anonymous Access**: If allowing anonymous access, implement stricter rate limits

## Future Enhancements

Potential improvements:
- [ ] Full judge integration for code execution
- [ ] Multiple file support
- [ ] Code sharing (share IDE sessions via URL)
- [ ] Collaborative editing (real-time collaboration)
- [ ] Code templates per language
- [ ] Export code as file
- [ ] Execution history
- [ ] Syntax error highlighting
- [ ] Auto-formatting
- [ ] Dark/light theme toggle
- [ ] Custom test cases
- [ ] Performance metrics (execution time, memory usage)

## Troubleshooting

### IDE page not found (404)
- Ensure migrations have been run
- Check that URLs are properly configured
- Verify `judge.views.ide` is imported in `dmoj/urls.py`

### Code execution not working
- This is expected - judge integration needs to be implemented
- See "Code Execution Flow" section above

### Sessions not saving
- Ensure user is logged in
- Check database migration was successful
- Verify CSRF token is present

### ACE editor not loading
- Check that `ACE_URL` setting is correct
- Ensure static files are properly served
- Check browser console for JavaScript errors

## Browser Compatibility

Tested and supported:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

This feature follows the same license as the main LCOJ site.

## Contributors

- Built for LCOJ site
- Based on existing submission system architecture
- UI inspired by Ideone.com

---

For questions or issues, please contact the development team or open an issue on GitHub.
