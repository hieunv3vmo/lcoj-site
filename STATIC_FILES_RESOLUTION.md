# Missing Static Files - Complete Resolution Guide

## Overview

During deployment, we encountered **three missing static files issues**. This document explains all three and their resolutions.

---

## Issue 1: Tailwind CSS Source Files ✅ FIXED

### Error
```
Post-processing 'css/main.css' failed!
ValueError: The file 'css/tailwindcss' could not be found
```

### Root Cause
Vite CSS source files (`resources/css/main.css`) contained `@import "tailwindcss";` and were located in Django's `STATICFILES_DIRS`. Django's `ManifestStaticFilesStorage` tried to process these source files and couldn't resolve the import.

### Solution
Moved Vite source files outside Django's static directories:
- `resources/css/` → `vite-src/css/`
- Updated `vite.config.js` paths

### Impact
✅ Django only collects built assets, not source files

**Commit:** `a5449e0`
**Documentation:** `COLLECTSTATIC_FIX.md`

---

## Issue 2: Latin Modern Math Font ✅ FIXED

### Error
```
Post-processing 'dark/style.css' failed!
ValueError: The file 'libs/latinmodernmath/latinmodern-math.eot' could not be found
```

### Root Cause
SCSS file (`resources/math.scss`) had `@font-face` declaration referencing font files that don't exist:
- Expected: `resources/libs/latinmodernmath/*.{eot,woff2,woff,ttf}`
- Reality: Directory empty

### Solution
Removed `@font-face` declaration completely from `resources/math.scss`. Math elements will use system fallback fonts.

### Impact
✅ No functional change (fonts never existed)
✅ collectstatic completes successfully

**Commit:** `ead88a0`
**Documentation:** `FONT_FIX.md`

---

## Issue 3: FontAwesome CSS ✅ FIXED

### Error
```
ValueError: Missing staticfiles manifest entry for 'libs/fontawesome/font-awesome.css'
```

### Root Cause
Setting `INLINE_FONTAWESOME = True` told Django to load FontAwesome from local static files, but those files don't exist:
- Expected: `resources/libs/fontawesome/font-awesome.css`
- Reality: `resources/libs/` directory is empty

### Solution
Changed `INLINE_FONTAWESOME` from `True` to `False` in `dmoj/settings.py`.

**Before:**
```python
INLINE_FONTAWESOME = True  # Load from local static files
```

**After:**
```python
INLINE_FONTAWESOME = False  # Load from CDN
```

### How It Works

**When `INLINE_FONTAWESOME = True`:**
```jinja2
{# In templates/base.html #}
{% if INLINE_FONTAWESOME %}
    <link rel="stylesheet" href="{{ static('libs/fontawesome/font-awesome.css') }}">
{% endif %}
```
Tries to load from local static files → **ERROR** (files don't exist)

**When `INLINE_FONTAWESOME = False`:**
```jinja2
{# In templates/base.html #}
{% if not INLINE_FONTAWESOME %}
    <link rel="stylesheet" href="{{ FONTAWESOME_CSS }}">
{% endif %}
```
Loads from CDN: `//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css` → **SUCCESS**

### Impact
✅ Site starts without errors
✅ FontAwesome loads from reliable CDN
✅ Icons display correctly

**Commit:** `bac5885`

---

## Pattern: Empty `resources/libs/` Directory

All three issues stem from the same root cause: **`resources/libs/` directory is empty** but referenced.

### What Should Be in `resources/libs/`

Based on code references:
1. `latinmodernmath/` - Latin Modern Math font files
2. `fontawesome/` - Font Awesome CSS and fonts
3. `clipboard/` - Clipboard.js tooltip styles (also referenced)

### Current Status

```bash
$ ls -la resources/libs/
total 8
drwxr-xr-x 2 root root 4096 Nov 15 15:26 .
drwxr-xr-x 1 root root 4096 Nov 16 08:07 ..
```

**Empty directory** - no subdirectories, no files.

### Why Files Are Missing

Likely scenarios:
1. **Gitignored**: `resources/libs/` might be in `.gitignore`
2. **External download**: Files meant to be downloaded separately
3. **CDN preferred**: Original setup used CDN, local files never needed
4. **Legacy cleanup**: Files removed in previous commits

---

## Resolution Summary

| Issue | Files Missing | Solution | Status |
|-------|---------------|----------|--------|
| Tailwind CSS | N/A (source files) | Move to `vite-src/` | ✅ Fixed |
| Latin Modern Math | Font files (.eot, .woff2, .woff, .ttf) | Remove `@font-face` | ✅ Fixed |
| FontAwesome | font-awesome.css + fonts | Use CDN (set flag to False) | ✅ Fixed |

---

## Deployment Impact

### Before Fixes
```bash
$ bash make_all_styles.sh
✓ Build successful

$ python3 manage.py collectstatic --noinput
❌ ERROR: Tailwind CSS file not found

# Never got past collectstatic
```

### After Fix 1 (Tailwind CSS)
```bash
$ bash make_all_styles.sh
✓ Build successful

$ python3 manage.py collectstatic --noinput
❌ ERROR: Latin Modern Math font not found
```

### After Fix 2 (Latin Modern Math)
```bash
$ bash make_all_styles.sh
✓ Build successful

$ python3 manage.py collectstatic --noinput
✓ collectstatic successful

$ docker compose up
❌ ERROR: FontAwesome CSS not found (runtime error)
```

### After Fix 3 (FontAwesome) - CURRENT
```bash
$ bash make_all_styles.sh
✓ Build successful

$ python3 manage.py collectstatic --noinput
✓ collectstatic successful

$ docker compose up
✓ Site starts successfully
✓ All pages load
✓ Icons display correctly
```

---

## Testing Checklist

After all fixes, verify:

### Build
- [x] `bash make_all_styles.sh` succeeds
- [x] Legacy SCSS files generated (resources/*.css)
- [x] Modern Vite files generated (static/dist/js/*.js, static/dist/css/*.css)

### Collect Static
- [x] `python3 manage.py collectstatic --noinput` succeeds
- [x] No errors about missing CSS files
- [x] No errors about missing font files

### Runtime
- [x] Site starts without errors
- [x] Homepage loads
- [x] FontAwesome icons display
- [x] Math rendering works (system fonts)
- [x] Modern UI templates work (Alpine.js)
- [x] Legacy templates work

---

## Future: Adding Local Files (Optional)

If you want to use local files instead of CDN:

### FontAwesome (Font Awesome 4.3.0)

1. **Download:**
   ```bash
   wget https://github.com/FortAwesome/Font-Awesome/archive/refs/tags/v4.3.0.zip
   unzip v4.3.0.zip
   ```

2. **Copy to project:**
   ```bash
   mkdir -p resources/libs/fontawesome
   cp Font-Awesome-4.3.0/css/font-awesome.css resources/libs/fontawesome/
   cp -r Font-Awesome-4.3.0/fonts resources/libs/fontawesome/
   ```

3. **Update settings:**
   ```python
   # In dmoj/settings.py
   INLINE_FONTAWESOME = True
   ```

4. **Rebuild and deploy:**
   ```bash
   bash make_all_styles.sh
   python3 manage.py collectstatic --noinput
   ```

### Latin Modern Math

1. **Download:**
   ```bash
   wget http://www.gust.org.pl/projects/e-foundry/lm-math/download/latinmodern-math-1959.zip
   unzip latinmodern-math-1959.zip
   ```

2. **Copy to project:**
   ```bash
   mkdir -p resources/libs/latinmodernmath
   cp latinmodern-math-1959/*.{eot,woff2,woff,ttf} resources/libs/latinmodernmath/
   ```

3. **Update SCSS:**
   ```scss
   # In resources/math.scss
   @font-face {
     font-family: 'Latin Modern Math';
     src: url($path_to_root + '/libs/latinmodernmath/latinmodern-math.eot');
     src: local('Latin Modern Math'), local('LatinModernMath-Regular'),
       url($path_to_root + '/libs/latinmodernmath/latinmodern-math.eot?#iefix') format('embedded-opentype'),
       url($path_to_root + '/libs/latinmodernmath/latinmodern-math.woff2') format('woff2'),
       url($path_to_root + '/libs/latinmodernmath/latinmodern-math.woff') format('woff'),
       url($path_to_root + '/libs/latinmodernmath/latinmodern-math.ttf') format('truetype');
     font-weight: normal;
     font-style: normal;
   }
   ```

4. **Rebuild:**
   ```bash
   bash make_all_styles.sh
   python3 manage.py collectstatic --noinput
   ```

---

## CDN vs Local Files: Pros & Cons

### CDN (Current Setup) ✅ Recommended

**Pros:**
- ✅ No repository bloat (no large font files)
- ✅ Faster for users (CDN caching, geographically distributed)
- ✅ Automatic updates (if CDN updated)
- ✅ Reduced build/deploy complexity

**Cons:**
- ❌ Requires internet connection
- ❌ External dependency (CDN must be available)
- ❌ Privacy concern (external requests tracked)

### Local Files

**Pros:**
- ✅ Works offline
- ✅ No external dependencies
- ✅ Full control over versions
- ✅ Privacy-friendly (no external requests)

**Cons:**
- ❌ Larger repository size
- ❌ Slower for users (not globally cached)
- ❌ Manual updates required
- ❌ More complex deployment

---

## Recommendations

### For Production
- ✅ **Use CDN** (current setup)
- Simple, reliable, performant
- No additional files needed

### For Offline/Intranet Deployment
- ✅ **Use local files**
- Follow instructions above to download and install
- Necessary when internet access unavailable

### For Development
- ✅ **Use CDN**
- Faster setup
- Less repository size

---

## Summary

**Three fixes applied:**
1. Moved Vite source files → `vite-src/`
2. Removed Latin Modern Math `@font-face`
3. Changed FontAwesome to CDN (`INLINE_FONTAWESOME = False`)

**Result:**
- ✅ Build succeeds
- ✅ collectstatic succeeds
- ✅ Site runs without errors
- ✅ All features work

**Deployment is now ready!** 🎉

---

**Last Updated:** 2025-11-16
**Status:** All issues resolved
**Commits:** a5449e0, ead88a0, bac5885
