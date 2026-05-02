#!/usr/bin/env node

/**
 * Fix Chunk Loading Errors Script
 * 
 * This script helps diagnose and fix common chunk loading errors in Next.js:
 * - Clears .next build directory
 * - Clears node_modules/.cache
 * - Provides instructions for clearing browser cache
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Chunk Loading Errors...\n');

// Function to remove directory recursively
function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✅ Removed: ${dirPath}`);
    return true;
  }
  console.log(`⚠️  Not found: ${dirPath}`);
  return false;
}

// 1. Clear .next directory
console.log('1️⃣  Clearing .next build directory...');
removeDir(path.join(process.cwd(), '.next'));

// 2. Clear node_modules cache
console.log('\n2️⃣  Clearing node_modules cache...');
removeDir(path.join(process.cwd(), 'node_modules', '.cache'));

// 3. Instructions for browser cache
console.log('\n3️⃣  Browser Cache Instructions:');
console.log('   📱 Mobile (Chrome/Safari):');
console.log('      - Open browser settings');
console.log('      - Clear browsing data');
console.log('      - Select "Cached images and files"');
console.log('      - Clear data\n');
console.log('   💻 Desktop:');
console.log('      - Chrome: Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)');
console.log('      - Firefox: Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)');
console.log('      - Safari: Cmd+Option+E\n');

// 4. Next steps
console.log('4️⃣  Next Steps:');
console.log('   1. Run: npm run build');
console.log('   2. Run: npm start');
console.log('   3. Clear browser cache on mobile');
console.log('   4. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)\n');

console.log('✨ Done! Follow the steps above to complete the fix.\n');
