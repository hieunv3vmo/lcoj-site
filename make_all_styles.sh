#!/bin/bash
# Modern Vite build script for LCOJ UI
# Builds Tailwind CSS v4 + Alpine.js assets

set -e  # Exit on error

cd "$(dirname "$0")" || exit

echo "========================================="
echo "Building LCOJ Modern UI with Vite"
echo "========================================="

# 1. Check if Node.js and npm are available
echo ""
echo "[1/3] Checking Node.js environment..."
echo "-------------------------------------"
if ! command -v node &> /dev/null; then
    echo "✗ Error: Node.js is not installed"
    echo "  Please install Node.js 18+ to build modern UI"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "✗ Error: npm is not installed"
    echo "  Please install npm to build modern UI"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo "✓ npm version: $(npm --version)"

# 2. Install npm dependencies if needed
echo ""
echo "[2/3] Installing npm dependencies..."
echo "-------------------------------------"
if [ ! -d "node_modules" ]; then
    echo "Installing npm packages (this may take a while)..."
    npm ci --prefer-offline --no-audit
    echo "✓ npm dependencies installed"
else
    echo "✓ node_modules exists, skipping installation"
    echo "  (run 'rm -rf node_modules' to force reinstall)"
fi

# 3. Build modern Vite assets
echo ""
echo "[3/3] Building modern UI with Vite..."
echo "-------------------------------------"
npm run build

echo ""
echo "========================================="
echo "✓ Modern UI built successfully!"
echo "========================================="
echo ""
echo "Built assets:"
echo "  - JavaScript: static/dist/js/main-*.js"
echo "  - CSS: static/dist/css/styles-*.css"
echo "  - Vite manifest: static/dist/.vite/manifest.json"
echo ""
echo "Next steps:"
echo "  1. Run: python manage.py collectstatic --noinput"
echo "  2. Restart your server"
echo ""
