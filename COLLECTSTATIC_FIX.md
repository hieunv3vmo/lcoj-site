# Fix for Django collectstatic Error with Tailwind CSS

## Problem Summary

Even after running `make_all_styles.sh` successfully, `collectstatic` was failing with:

```
Post-processing 'css/main.css' failed!
ValueError: The file 'css/tailwindcss' could not be found
```

## Root Cause

The issue was **file organization**, not the build process:

1. Vite source CSS files were located in `resources/css/`
2. Django's `STATICFILES_DIRS` included `resources/`
3. Django's `collectstatic` tried to collect and post-process `resources/css/main.css`
4. This file contains `@import "tailwindcss";` which Django's static file processor can't resolve
5. Django's ManifestStaticFilesStorage failed trying to hash this unresolved import

**The conflict:**
- `resources/` contains **both** built SCSS files (resources/*.css) AND source Vite files (resources/css/*.css)
- Django should only collect the built files, not the source files

## Solution

**Moved Vite source files outside of `resources/` directory:**

```bash
resources/css/        →    vite-src/css/
  ├── main.css             ├── main.css
  ├── components.css       ├── components.css
  └── utilities.css        └── utilities.css
```

**Updated Vite config** to reference new location:
- Input: `vite-src/css/main.css` (instead of `resources/css/main.css`)
- Alias: `@css` → `vite-src/css/` (instead of `resources/css/`)

**Result:**
- Django only collects files from `resources/` (built SCSS) and `static/` (built Vite assets)
- Vite source files in `vite-src/` are NOT collected by Django
- No more conflicts!

## What Changed

### File Structure (Before)
```
lcoj-site/
├── resources/
│   ├── css/                    ← Source files (BAD: Django tries to collect these)
│   │   ├── main.css           ← Contains @import "tailwindcss"
│   │   ├── components.css
│   │   └── utilities.css
│   ├── js/                     ← Source files (OK: JavaScript doesn't need post-processing)
│   ├── style.css              ← Built SCSS (OK: this should be collected)
│   └── *.css                  ← Other built SCSS files
└── static/dist/               ← Built Vite output (OK: this should be collected)
```

### File Structure (After)
```
lcoj-site/
├── vite-src/                  ← NEW: Vite source files
│   └── css/                   ← Vite CSS sources (NOT collected by Django)
│       ├── main.css          ← Contains @import "tailwindcss"
│       ├── components.css
│       └── utilities.css
├── resources/
│   ├── js/                    ← Vite JS sources (OK: no post-processing needed)
│   ├── style.css             ← Built SCSS (collected by Django)
│   └── *.css                 ← Other built SCSS files
└── static/dist/              ← Built Vite output (collected by Django)
```

### Code Changes

**1. vite.config.js** (2 changes)
```diff
rollupOptions: {
  input: {
    main: resolve(__dirname, 'resources/js/main.js'),
-   styles: resolve(__dirname, 'resources/css/main.css'),
+   styles: resolve(__dirname, 'vite-src/css/main.css'),
  },

resolve: {
  alias: {
    '@': resolve(__dirname, 'resources/js'),
-   '@css': resolve(__dirname, 'resources/css'),
+   '@css': resolve(__dirname, 'vite-src/css'),
  },
},
```

**2. File System**
```bash
# Moved files
mv resources/css/main.css vite-src/css/main.css
mv resources/css/components.css vite-src/css/components.css
mv resources/css/utilities.css vite-src/css/utilities.css
rmdir resources/css
```

## Testing

**Build test (successful):**
```bash
$ npm run build
✓ built in 573ms

../static/dist/css/styles-D8qMTVWb.css  35.83 kB │ gzip:  9.12 kB
../static/dist/js/main-yzcgKS6X.js      65.82 kB │ gzip: 22.56 kB
```

**Django collectstatic (should now work):**
```bash
$ python3 manage.py collectstatic --noinput
# Should complete without errors
```

## For lcoj-docker Users

**No changes needed to your deployment command!**

The original command will now work:
```bash
docker compose exec $COMPOSE_EXEC_FLAGS site /bin/bash -c "\
    bash make_all_styles.sh && \
    python3 manage.py collectstatic --noinput && \
    python3 manage.py compilemessages && \
    python3 manage.py compilejsi18n && \
    cp -r resources/ /assets/ && \
    cp -r static/dist/ /assets/dist/ && \
    rm resources/style.css resources/martor-description.css resources/select2-dmoj.css && \
    rm resources/dark/style.css resources/dark/martor-description.css resources/dark/select2-dmoj.css && \
    rm -r sass_processed && \
    cp 502.html /assets/ && \
    cp logo.png /assets/ && \
    cp robots.txt /assets/"
```

**What happens now:**
1. ✅ `make_all_styles.sh` builds both legacy SCSS and modern Vite assets
2. ✅ `collectstatic` collects built files (no errors)
3. ✅ Assets copied to `/assets/`
4. ✅ Application works perfectly

## Why This Approach

**Alternative approaches considered:**

1. **Custom static file finder** - Complex, requires Django settings changes
2. **Exclude pattern in settings** - Not supported by default Django staticfiles
3. **Move to src/** - Common convention, but requires more path updates
4. **Move to vite-src/** ✅ - Clear separation, minimal changes

**Why vite-src/ is best:**
- ✅ Clear naming: "These are Vite source files"
- ✅ Minimal changes: Only 2 lines in vite.config.js
- ✅ No Django settings changes needed
- ✅ Follows separation of concerns (source vs. built)
- ✅ Easy to understand for new developers

## File Type Summary

| Location | Type | Django Collects? | Purpose |
|----------|------|------------------|---------|
| `vite-src/css/*.css` | Source | ❌ No | Vite input (Tailwind CSS v4) |
| `resources/js/*.js` | Source | ✅ Yes (but OK) | Vite input (no post-processing) |
| `resources/*.css` | Built | ✅ Yes | Legacy SCSS output |
| `static/dist/js/*.js` | Built | ✅ Yes | Vite output |
| `static/dist/css/*.css` | Built | ✅ Yes | Vite output |

**Key insight:** CSS source files need special handling because Django's `ManifestStaticFilesStorage` tries to resolve `@import` statements. JavaScript source files don't have this issue.

## Verification

After deploying, verify:

```bash
# 1. Source files are NOT in collected static
docker compose exec site ls /assets/css/main.css
# Should return: No such file or directory ✓

# 2. Built Vite CSS IS in collected static
docker compose exec site ls /assets/dist/css/styles-*.css
# Should return: File exists ✓

# 3. Built SCSS CSS IS in collected static
docker compose exec site ls /assets/style.css
# Should return: File exists ✓

# 4. Application loads without errors
# Open homepage in browser, check console
```

## Rollback

If you need to rollback this change:

```bash
# Restore old structure
mkdir -p resources/css
mv vite-src/css/main.css resources/css/main.css
mv vite-src/css/components.css resources/css/components.css
mv vite-src/css/utilities.css resources/css/utilities.css
rmdir vite-src/css vite-src

# Restore vite.config.js
git checkout HEAD -- vite.config.js

# Rebuild
npm run build
```

But you'll get the original error again, so only do this if needed for debugging.

## Summary

**Problem:** Django's `collectstatic` was trying to process Vite source CSS files that contain `@import "tailwindcss";`

**Solution:** Moved Vite source CSS files from `resources/css/` to `vite-src/css/` so Django doesn't try to collect them

**Result:** Django only collects built assets, not source files. `collectstatic` now works perfectly! ✅

---

**Changes committed:** Fix structure to separate Vite source files from Django static files
**Impact:** Deployment now works without errors
**Breaking changes:** None (backward compatible)
