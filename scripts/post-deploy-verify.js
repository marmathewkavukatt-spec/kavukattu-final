#!/usr/bin/env node

/**
 * Post-Deployment Verification Script
 * 
 * Verifies that the deployment is working correctly and provides
 * troubleshooting steps if issues are detected.
 */

const https = require('https');
const http = require('http');

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://marmathewkavukatt.org';

console.log('🔍 Post-Deployment Verification\n');
console.log(`Checking: ${SITE_URL}\n`);

// Parse URL
const url = new URL(SITE_URL);
const protocol = url.protocol === 'https:' ? https : http;

// Check if site is accessible
console.log('1️⃣ Checking site accessibility...');
protocol.get(SITE_URL, (res) => {
  console.log(`   Status: ${res.statusCode}`);
  console.log(`   Headers:`, res.headers);
  
  if (res.statusCode === 200) {
    console.log('   ✅ Site is accessible\n');
  } else {
    console.log('   ⚠️  Unexpected status code\n');
  }

  // Check for chunk files
  console.log('2️⃣ Checking static assets...');
  const chunkUrl = `${SITE_URL}/_next/static/chunks/main.js`;
  
  protocol.get(chunkUrl, (chunkRes) => {
    if (chunkRes.statusCode === 200) {
      console.log('   ✅ Static chunks are accessible\n');
    } else {
      console.log('   ❌ Static chunks are NOT accessible');
      console.log('   This may cause chunk loading errors!\n');
    }

    printTroubleshootingSteps();
  }).on('error', (err) => {
    console.log('   ❌ Error accessing static chunks:', err.message);
    printTroubleshootingSteps();
  });

}).on('error', (err) => {
  console.log('   ❌ Site is NOT accessible:', err.message);
  printTroubleshootingSteps();
});

function printTroubleshootingSteps() {
  console.log('\n📋 Troubleshooting Steps:\n');
  
  console.log('If you see chunk loading errors:');
  console.log('1. Ensure .next directory is fully uploaded to server');
  console.log('2. Check that .next/static/* files are accessible');
  console.log('3. Verify server has restarted after deployment');
  console.log('4. Check server logs for any errors');
  console.log('5. Ensure proper file permissions on server\n');

  console.log('Server Configuration:');
  console.log('- Ensure /_next/static/* is served correctly');
  console.log('- Check that gzip/brotli compression is enabled');
  console.log('- Verify cache headers are set correctly\n');

  console.log('For users experiencing issues:');
  console.log('- The app will auto-reload once on chunk errors');
  console.log('- Users can hard refresh: Ctrl+Shift+R');
  console.log('- Users can clear browser cache\n');

  console.log('✨ The application includes built-in recovery:');
  console.log('- ChunkErrorHandler: Auto-reloads on chunk errors');
  console.log('- ServiceWorkerManager: Clears old caches');
  console.log('- Error boundaries: User-friendly error pages\n');
}
