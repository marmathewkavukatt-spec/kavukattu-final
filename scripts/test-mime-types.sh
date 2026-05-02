#!/bin/bash

# Test MIME Types on Deployed Site
# Usage: bash scripts/test-mime-types.sh

SITE_URL="https://marmathewkavukatt.org"

echo "=========================================="
echo "🧪 Testing MIME Types"
echo "=========================================="
echo ""
echo "Site: $SITE_URL"
echo ""

# Test CSS file
echo "📄 Testing CSS file..."
CSS_RESPONSE=$(curl -sI "$SITE_URL/_next/static/css/app/layout.css" 2>/dev/null | grep -i "content-type")
if [[ $CSS_RESPONSE == *"text/css"* ]]; then
  echo "✅ CSS MIME type: CORRECT"
  echo "   $CSS_RESPONSE"
else
  echo "❌ CSS MIME type: WRONG"
  echo "   $CSS_RESPONSE"
  echo "   Expected: Content-Type: text/css"
fi
echo ""

# Test JavaScript file
echo "📄 Testing JavaScript file..."
JS_RESPONSE=$(curl -sI "$SITE_URL/_next/static/chunks/main.js" 2>/dev/null | grep -i "content-type")
if [[ $JS_RESPONSE == *"javascript"* ]]; then
  echo "✅ JavaScript MIME type: CORRECT"
  echo "   $JS_RESPONSE"
else
  echo "❌ JavaScript MIME type: WRONG"
  echo "   $JS_RESPONSE"
  echo "   Expected: Content-Type: application/javascript"
fi
echo ""

# Test WebP image
echo "📄 Testing WebP image..."
WEBP_RESPONSE=$(curl -sI "$SITE_URL/uploads/1776663504526-OBCN3698-26707737.webp" 2>/dev/null | grep -i "content-type")
if [[ $WEBP_RESPONSE == *"image/webp"* ]]; then
  echo "✅ WebP MIME type: CORRECT"
  echo "   $WEBP_RESPONSE"
else
  echo "⚠️  WebP MIME type: CHECK"
  echo "   $WEBP_RESPONSE"
  echo "   Expected: Content-Type: image/webp"
fi
echo ""

# Test main page
echo "📄 Testing main page..."
HTML_STATUS=$(curl -sI "$SITE_URL/" 2>/dev/null | grep -i "HTTP" | head -n 1)
if [[ $HTML_STATUS == *"200"* ]]; then
  echo "✅ Homepage: ACCESSIBLE"
  echo "   $HTML_STATUS"
else
  echo "❌ Homepage: ERROR"
  echo "   $HTML_STATUS"
fi
echo ""

# Test spiritual-legacy page
echo "📄 Testing spiritual-legacy page..."
LEGACY_STATUS=$(curl -sI "$SITE_URL/spiritual-legacy" 2>/dev/null | grep -i "HTTP" | head -n 1)
if [[ $LEGACY_STATUS == *"200"* ]]; then
  echo "✅ Spiritual Legacy: ACCESSIBLE"
  echo "   $LEGACY_STATUS"
else
  echo "❌ Spiritual Legacy: ERROR"
  echo "   $LEGACY_STATUS"
fi
echo ""

echo "=========================================="
echo "✅ MIME Type Test Complete"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. If MIME types are wrong, check .htaccess files"
echo "2. If pages return errors, check PM2 status"
echo "3. Open browser DevTools to see detailed errors"
echo ""
