#!/bin/bash
# Combined build script for both legacy SCSS styles and modern Vite build
# This script is compatible with lcoj-docker deployment

set -e  # Exit on error

cd "$(dirname "$0")" || exit

echo "========================================="
echo "Building LCOJ Styles (Legacy + Modern)"
echo "========================================="

# 1. Build legacy SCSS styles (for backward compatibility)
echo ""
echo "[1/3] Building legacy SCSS styles..."
echo "-------------------------------------"
if [ -f "make_style.sh" ]; then
    bash make_style.sh
    echo "✓ Legacy SCSS styles built successfully"
else
    echo "⚠ make_style.sh not found, skipping legacy build"
fi

# 2. Check if Node.js and npm are available
echo ""
echo "[2/3] Checking Node.js environment..."
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

# 3. Install npm dependencies if needed
echo ""
echo "[3/3] Installing npm dependencies..."
echo "-------------------------------------"
if [ ! -d "node_modules" ]; then
    echo "Installing npm packages (this may take a while)..."
    npm ci --prefer-offline --no-audit
    echo "✓ npm dependencies installed"
else
    echo "✓ node_modules exists, skipping installation"
    echo "  (run 'rm -rf node_modules' to force reinstall)"
fi

# 4. Build modern Vite assets
echo ""
echo "[4/4] Building modern UI with Vite..."
echo "-------------------------------------"
npm run build

echo ""
echo "========================================="
echo "✓ All styles built successfully!"
echo "========================================="
echo ""
echo "Built assets:"
echo "  - Legacy SCSS: resources/*.css"
echo "  - Modern Vite: static/dist/js/*.js"
echo "  - Modern Vite: static/dist/css/*.css"
echo ""
