# Quick Fix for Tailwind CSS Deployment Error

## The Problem

You're seeing this error:
```
ValueError: The file 'css/tailwindcss' could not be found with <django.contrib.staticfiles.storage.ManifestStaticFilesStorage>
```

## The Cause

The old deployment script only builds legacy SCSS styles, not the new Vite + Tailwind CSS v4 assets.

## The Solution (1 Minute Fix)

**Change this line in your lcoj-docker deployment:**

```bash
# OLD (causes error):
bash make_style.sh

# NEW (fixed):
bash make_all_styles.sh
```

## Full Deployment Command

Replace your entire deployment command with:

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

**Key changes:**
1. `make_style.sh` → `make_all_styles.sh`
2. Added: `cp -r static/dist/ /assets/dist/` (copy Vite assets)

## What make_all_styles.sh Does

1. ✅ Builds legacy SCSS styles (backward compatible)
2. ✅ Checks Node.js is installed
3. ✅ Installs npm dependencies (if needed)
4. ✅ Builds modern Vite + Tailwind CSS v4 assets

## Prerequisites

Your Docker container must have **Node.js 18+** installed.

**Check if you have Node.js:**
```bash
docker compose exec site node --version
```

**If not installed, update your Dockerfile:**
```dockerfile
FROM python:3.11-slim

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Verify
RUN node --version && npm --version
```

Then rebuild:
```bash
docker compose build --no-cache
```

## Verification

After deployment, check these files exist:

```bash
# Legacy SCSS (for old templates)
docker compose exec site ls -la resources/*.css

# Modern Vite (for new templates)
docker compose exec site ls -la static/dist/js/*.js
docker compose exec site ls -la static/dist/css/*.css
docker compose exec site ls -la static/dist/.vite/manifest.json
```

All should exist with no errors.

## Still Having Issues?

See **DOCKER_DEPLOYMENT.md** for:
- Detailed troubleshooting
- Docker configuration examples
- Rollback instructions
- Support information

## Test Locally First

Before deploying to production, test the build script:

```bash
docker compose exec site bash make_all_styles.sh
```

Should output:
```
=========================================
Building LCOJ Styles (Legacy + Modern)
=========================================
...
✓ All styles built successfully!
```

---

**That's it!** Replace `make_style.sh` with `make_all_styles.sh` and you're done. 🎉
