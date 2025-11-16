# Docker Deployment Guide for LCOJ UI Modernization

This guide explains how to deploy the modernized LCOJ UI with lcoj-docker.

---

## Overview

The LCOJ UI has been modernized with:
- **Legacy Build**: SCSS styles (for backward compatibility)
- **Modern Build**: Vite + Alpine.js + Tailwind CSS v4

Both builds must complete successfully for full functionality.

---

## Quick Fix for Current Error

The error you're seeing:
```
ValueError: The file 'css/tailwindcss' could not be found
```

This happens because the deployment script runs `make_style.sh` (legacy SCSS only) but not the modern Vite build.

### Solution: Update Deployment Command

Replace this in your lcoj-docker deployment:

**OLD (causes error):**
```bash
docker compose exec $COMPOSE_EXEC_FLAGS site /bin/bash -c "\
    bash make_style.sh && \
    python3 manage.py collectstatic --noinput && \
    ..."
```

**NEW (fixed):**
```bash
docker compose exec $COMPOSE_EXEC_FLAGS site /bin/bash -c "\
    bash make_all_styles.sh && \
    python3 manage.py collectstatic --noinput && \
    python3 manage.py compilemessages && \
    python3 manage.py compilejsi18n && \
    cp -r resources/ /assets/ && \
    rm resources/style.css resources/martor-description.css resources/select2-dmoj.css && \
    rm resources/dark/style.css resources/dark/martor-description.css resources/dark/select2-dmoj.css && \
    rm -r sass_processed && \
    cp 502.html /assets/ && \
    cp logo.png /assets/ && \
    cp robots.txt /assets/"
```

**Key Change**: `make_style.sh` → `make_all_styles.sh`

---

## Detailed Integration Steps

### 1. Prerequisites

Ensure your Docker container has:
- **Node.js 18+** (for building modern UI)
- **npm** (comes with Node.js)
- **Python 3.8+** (for Django)
- **Bash** (for build scripts)

**Check in your Dockerfile:**
```dockerfile
FROM python:3.11-slim

# Install Node.js (if not already installed)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Verify installations
RUN node --version && npm --version
```

### 2. Build Process Overview

The `make_all_styles.sh` script performs these steps:

1. **Build Legacy SCSS Styles**
   - Runs `make_style.sh`
   - Outputs to `resources/*.css`
   - Required for legacy templates

2. **Check Node.js Environment**
   - Verifies Node.js and npm are installed
   - Checks versions

3. **Install npm Dependencies**
   - Runs `npm ci` if `node_modules/` doesn't exist
   - Installs Alpine.js, Vite, Tailwind CSS, etc.

4. **Build Modern UI with Vite**
   - Runs `npm run build`
   - Outputs to `static/dist/js/*.js` and `static/dist/css/*.css`
   - Creates `static/dist/.vite/manifest.json`

### 3. Static Files Configuration

Ensure your Django settings include Vite output:

**dmoj/settings.py** (already configured in this branch):
```python
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'resources'),  # Legacy SCSS
    os.path.join(BASE_DIR, 'static'),     # Modern Vite (includes dist/)
]

# Vite configuration
VITE_DEV_MODE = DEBUG
VITE_DEV_SERVER_URL = 'http://localhost:5173'
VITE_MANIFEST_PATH = os.path.join(BASE_DIR, 'static', 'dist', '.vite', 'manifest.json')

# Load Vite manifest in production
VITE_MANIFEST = {}
if not VITE_DEV_MODE and os.path.exists(VITE_MANIFEST_PATH):
    import json
    with open(VITE_MANIFEST_PATH, 'r') as f:
        VITE_MANIFEST = json.load(f)
```

### 4. Updated Deployment Script

**Full deployment command for lcoj-docker:**

```bash
#!/bin/bash
# deploy-lcoj.sh

set -e  # Exit on error

echo "Deploying LCOJ with modern UI..."

# Build all styles (legacy + modern)
docker compose exec $COMPOSE_EXEC_FLAGS site /bin/bash -c "bash make_all_styles.sh"

# Collect static files
docker compose exec $COMPOSE_EXEC_FLAGS site /bin/bash -c "
    python3 manage.py collectstatic --noinput && \
    python3 manage.py compilemessages && \
    python3 manage.py compilejsi18n
"

# Copy assets
docker compose exec $COMPOSE_EXEC_FLAGS site /bin/bash -c "
    cp -r resources/ /assets/ && \
    cp -r static/dist/ /assets/dist/ && \
    cp 502.html /assets/ && \
    cp logo.png /assets/ && \
    cp robots.txt /assets/
"

# Cleanup temporary files
docker compose exec $COMPOSE_EXEC_FLAGS site /bin/bash -c "
    rm -f resources/style.css resources/martor-description.css resources/select2-dmoj.css && \
    rm -f resources/dark/style.css resources/dark/martor-description.css resources/dark/select2-dmoj.css && \
    rm -rf sass_processed
"

echo "✓ Deployment complete!"
```

### 5. Dockerfile Updates (if needed)

If your Dockerfile doesn't have Node.js, add it:

**Option 1: Debian/Ubuntu-based image**
```dockerfile
FROM python:3.11-slim

# Install Node.js 18.x
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get update && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Verify installations
RUN node --version && npm --version
```

**Option 2: Alpine-based image**
```dockerfile
FROM python:3.11-alpine

# Install Node.js and npm
RUN apk add --no-cache nodejs npm

# Verify installations
RUN node --version && npm --version
```

**Option 3: Multi-stage build (recommended for smaller image)**
```dockerfile
# Build stage
FROM node:18 AS node-builder
WORKDIR /build
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit
COPY . .
RUN npm run build

# Runtime stage
FROM python:3.11-slim
WORKDIR /app

# Copy built assets from builder
COPY --from=node-builder /build/static/dist /app/static/dist

# Install Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy application
COPY . .

# Build legacy SCSS (Node.js needed only for this)
RUN apt-get update && \
    apt-get install -y nodejs npm && \
    bash make_style.sh && \
    apt-get remove -y nodejs npm && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*
```

### 6. docker-compose.yml Updates

**Ensure volume mounts include static/dist:**

```yaml
services:
  site:
    build: ./site
    volumes:
      - ./site:/site  # Source code
      - assets:/assets  # Static assets
    environment:
      - STATIC_ROOT=/assets
```

---

## Troubleshooting

### Error: "Node.js is not installed"

**Cause**: Docker container doesn't have Node.js

**Solution**: Update your Dockerfile to include Node.js (see section 5 above)

### Error: "The file 'css/tailwindcss' could not be found"

**Cause**: Vite build didn't run, so raw CSS with `@import "tailwindcss"` was copied

**Solution**: Use `make_all_styles.sh` instead of `make_style.sh`

### Error: "npm ci failed"

**Cause**: Corrupted `node_modules/` or `package-lock.json`

**Solution**: Clean and reinstall
```bash
docker compose exec site /bin/bash -c "rm -rf node_modules package-lock.json && npm install"
```

### Error: "Vite build failed"

**Cause**: Missing dependencies or Node.js version too old

**Solution**: Check Node.js version (must be 18+)
```bash
docker compose exec site node --version
```

### Build succeeds but modern UI doesn't load

**Cause**: Static files not collected or Vite manifest not found

**Solution**: Verify files exist
```bash
docker compose exec site /bin/bash -c "
    ls -la static/dist/js/ && \
    ls -la static/dist/css/ && \
    cat static/dist/.vite/manifest.json
"
```

---

## File Structure After Build

After successful build, you should see:

```
lcoj-site/
├── resources/              # Legacy SCSS output
│   ├── style.css          ✓ Built by make_style.sh
│   ├── ace-dmoj.css       ✓ Built by make_style.sh
│   ├── martor-description.css ✓ Built by make_style.sh
│   └── dark/              ✓ Dark theme variants
│       ├── style.css
│       └── ...
├── static/dist/           # Modern Vite output
│   ├── js/
│   │   └── main-{hash}.js ✓ Built by Vite
│   ├── css/
│   │   └── styles-{hash}.css ✓ Built by Vite
│   └── .vite/
│       └── manifest.json  ✓ Asset manifest
├── sass_processed/        # Temporary SCSS output (can be deleted)
└── node_modules/          # npm dependencies (can be cached)
```

---

## Optimizations for Production

### 1. Cache node_modules in Docker

**docker-compose.yml:**
```yaml
services:
  site:
    volumes:
      - ./site:/site
      - node_modules:/site/node_modules  # Cache npm packages
volumes:
  node_modules:
```

### 2. Use npm ci instead of npm install

The `make_all_styles.sh` script uses `npm ci` which:
- Is faster than `npm install`
- Uses `package-lock.json` for reproducible builds
- Cleans node_modules before installing

### 3. Multi-stage Docker build

See section 5, Option 3 for a multi-stage Dockerfile that:
- Builds assets in a Node.js stage
- Copies only built assets to runtime stage
- Results in smaller final image

---

## Verification Checklist

After deployment, verify:

- [ ] Legacy SCSS files exist: `ls resources/*.css`
- [ ] Modern Vite files exist: `ls static/dist/js/*.js static/dist/css/*.css`
- [ ] Vite manifest exists: `cat static/dist/.vite/manifest.json`
- [ ] Static files collected: `ls /assets/dist/js/*.js` (or your STATIC_ROOT)
- [ ] No errors in `python manage.py check`
- [ ] Homepage loads without console errors
- [ ] Modern templates use Alpine.js (check browser DevTools)
- [ ] Legacy templates still work (backward compatibility)

---

## Development vs Production

### Development

**Use Vite dev server** (hot reload):
```bash
# Terminal 1: Vite dev server
npm run dev

# Terminal 2: Django dev server
python manage.py runserver
```

Settings:
- `DEBUG = True`
- `VITE_DEV_MODE = True`
- Templates load from `http://localhost:5173`

### Production

**Use built assets**:
```bash
# Build once
bash make_all_styles.sh

# Collect static
python manage.py collectstatic --noinput
```

Settings:
- `DEBUG = False`
- `VITE_DEV_MODE = False`
- Templates load from `/static/dist/`

---

## Migration from Old Deployment

If you're migrating from old lcoj-docker deployment:

### Step 1: Update lcoj-site branch
```bash
cd lcoj-docker/site
git fetch origin
git checkout claude/lcoj-ui-modernization-01PnQzoHuQCuCvJbfV2fwRMu
```

### Step 2: Update Dockerfile
Add Node.js installation (see section 5)

### Step 3: Update deployment script
Replace `make_style.sh` with `make_all_styles.sh`

### Step 4: Rebuild containers
```bash
docker compose build --no-cache
```

### Step 5: Deploy
```bash
bash make_all_styles.sh && \
python manage.py collectstatic --noinput
```

### Step 6: Verify
- Check homepage loads
- Check browser console (no errors)
- Check modern templates (problem list, submissions, etc.)

---

## Rollback Plan

If issues occur:

### Option 1: Quick rollback to old UI
```bash
git checkout main  # or your previous stable branch
docker compose build
bash make_style.sh
python manage.py collectstatic --noinput
```

### Option 2: Use legacy templates only
Keep the code but switch templates:
- Rename `base-modern.html` → `base-modern.html.bak`
- Copy `base.html` → `base-modern.html` (or adjust template inheritance)

---

## Support

For issues or questions:
1. Check this documentation
2. Review error logs in `docker compose logs site`
3. Check build output from `make_all_styles.sh`
4. Verify static files configuration in Django settings
5. Open an issue on GitHub with error details

---

## Summary

**To deploy LCOJ with modern UI in lcoj-docker:**

1. Ensure Dockerfile has Node.js 18+
2. Use `make_all_styles.sh` instead of `make_style.sh`
3. Run `npm ci && npm run build` before `collectstatic`
4. Verify `static/dist/` is included in STATICFILES_DIRS
5. Deploy and verify modern templates load correctly

**The key change**: `make_style.sh` → `make_all_styles.sh`

This ensures both legacy SCSS and modern Vite assets are built.

---

**Last Updated**: 2025-11-16
**Branch**: claude/lcoj-ui-modernization-01PnQzoHuQCuCvJbfV2fwRMu
