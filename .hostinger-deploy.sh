#!/bin/bash

# Hostinger Post-Deployment Script
# This script should run after Git pulls the latest code

set -e  # Exit on any error

echo "=========================================="
echo "🚀 Hostinger Deployment Script"
echo "=========================================="
echo ""

# Get current directory
PROJECT_DIR=$(pwd)
echo "📁 Project directory: $PROJECT_DIR"
echo ""

# Check Node version
echo "🔍 Checking Node.js version..."
node --version
npm --version
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production=false
echo "✅ Dependencies installed"
echo ""

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate
echo "✅ Prisma client generated"
echo ""

# Preserve old static assets before rebuilding.
# Browsers can keep HTML that points at the previous build for a short time; keeping
# old hashed chunks available prevents refreshes from receiving HTML for JS/CSS.
STATIC_BACKUP=".next-static-backup"
rm -rf "$STATIC_BACKUP"
if [ -d ".next/static" ]; then
  echo "💾 Backing up existing static assets..."
  mkdir -p "$STATIC_BACKUP"
  cp -a .next/static/. "$STATIC_BACKUP"/
  echo "✅ Existing static assets backed up"
  echo ""
fi

# Verify .htaccess files exist
echo "🔍 Checking .htaccess files..."
if [ ! -f ".htaccess" ]; then
  echo "⚠️  Warning: .htaccess file not found in root"
else
  echo "✅ Root .htaccess found"
fi

if [ ! -f "public/.htaccess" ]; then
  echo "⚠️  Warning: .htaccess file not found in public/"
else
  echo "✅ Public .htaccess found"
fi
echo ""

# Build Next.js application
echo "🏗️  Building Next.js application..."
echo "⏳ This may take a few minutes..."
npm run build

# Restore previous hashed static assets alongside the new build.
# Do not overwrite new files; this only fills in old chunk/css URLs that a browser
# may still request immediately after deployment.
if [ -d "$STATIC_BACKUP" ] && [ -d ".next/static" ]; then
  echo ""
  echo "🔁 Restoring previous static assets for refresh compatibility..."
  cp -an "$STATIC_BACKUP"/. .next/static/ 2>/dev/null || true
  rm -rf "$STATIC_BACKUP"
  echo "✅ Previous static assets retained"
fi

# Verify build succeeded
if [ -d ".next" ]; then
  echo ""
  echo "✅ Build successful!"
  echo "📊 Build info:"
  ls -lh .next/ | head -n 10
  
  # Check BUILD_ID
  if [ -f ".next/BUILD_ID" ]; then
    BUILD_ID=$(cat .next/BUILD_ID)
    echo "🆔 Build ID: $BUILD_ID"
  fi
  
  # Check static files
  if [ -d ".next/static" ]; then
    CHUNK_COUNT=$(find .next/static/chunks -type f 2>/dev/null | wc -l)
    echo "📦 Chunk files: $CHUNK_COUNT"
  fi
else
  echo ""
  echo "❌ Build failed - .next folder not found"
  echo "Check build logs above for errors"
  exit 1
fi

echo ""
echo "🔄 Restarting application..."

# Try different restart methods
if command -v pm2 &> /dev/null; then
  echo "Using PM2..."
  pm2 restart all || pm2 start npm --name "nextjs" -- start
  echo "✅ Application restarted with PM2"
elif [ -f "ecosystem.config.js" ]; then
  echo "Using PM2 with ecosystem config..."
  pm2 restart ecosystem.config.js
  echo "✅ Application restarted with PM2"
else
  echo "⚠️  PM2 not found, application needs manual restart"
  echo "Run: npm start"
fi

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "🧪 Test your site:"
echo "   https://marmathewkavukatt.org"
echo "   https://marmathewkavukatt.org/spiritual-legacy"
echo ""
echo "🔍 Verify:"
echo "   - Open browser DevTools (F12)"
echo "   - Check Console for errors"
echo "   - Check Network tab for 404s"
echo ""
