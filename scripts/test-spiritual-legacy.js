#!/usr/bin/env node

/**
 * Test Spiritual Legacy Page
 * Verifies that the spiritual-legacy page and its assets are accessible
 */

const https = require('https');
const http = require('http');

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://marmathewkavukatt.org';

console.log('\n🧪 TESTING SPIRITUAL LEGACY PAGE\n');
console.log('=' .repeat(60));
console.log(`Site: ${SITE_URL}\n`);

const tests = [
  {
    name: 'Spiritual Legacy Page',
    url: `${SITE_URL}/spiritual-legacy`,
    expectedStatus: 200,
    expectedContentType: 'text/html'
  },
  {
    name: 'Home Page',
    url: `${SITE_URL}/`,
    expectedStatus: 200,
    expectedContentType: 'text/html'
  },
  {
    name: 'About Page',
    url: `${SITE_URL}/about`,
    expectedStatus: 200,
    expectedContentType: 'text/html'
  }
];

let passedTests = 0;
let failedTests = 0;

function testUrl(test) {
  return new Promise((resolve) => {
    const protocol = test.url.startsWith('https') ? https : http;
    
    const req = protocol.get(test.url, (res) => {
      const statusOk = res.statusCode === test.expectedStatus;
      const contentType = res.headers['content-type'] || '';
      const contentTypeOk = contentType.includes(test.expectedContentType);
      
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        const result = {
          name: test.name,
          url: test.url,
          status: res.statusCode,
          contentType: contentType,
          statusOk,
          contentTypeOk,
          passed: statusOk && contentTypeOk,
          bodyLength: body.length
        };
        
        resolve(result);
      });
    });
    
    req.on('error', (error) => {
      resolve({
        name: test.name,
        url: test.url,
        error: error.message,
        passed: false
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        name: test.name,
        url: test.url,
        error: 'Timeout',
        passed: false
      });
    });
  });
}

async function runTests() {
  console.log('Running tests...\n');
  
  for (const test of tests) {
    const result = await testUrl(test);
    
    if (result.passed) {
      console.log(`✅ ${result.name}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Content-Type: ${result.contentType}`);
      console.log(`   Body Length: ${result.bodyLength} bytes`);
      passedTests++;
    } else {
      console.log(`❌ ${result.name}`);
      console.log(`   URL: ${result.url}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      } else {
        console.log(`   Status: ${result.status} (expected ${test.expectedStatus})`);
        console.log(`   Content-Type: ${result.contentType} (expected ${test.expectedContentType})`);
      }
      failedTests++;
    }
    console.log('');
  }
  
  // Summary
  console.log('=' .repeat(60));
  console.log('\n📊 TEST SUMMARY\n');
  console.log(`Total Tests: ${tests.length}`);
  console.log(`Passed: ${passedTests} ✅`);
  console.log(`Failed: ${failedTests} ❌`);
  
  if (failedTests === 0) {
    console.log('\n🎉 ALL TESTS PASSED!\n');
    console.log('Your site is working correctly.');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED\n');
    console.log('Possible issues:');
    console.log('1. Server is not running');
    console.log('2. .next folder is missing or incomplete');
    console.log('3. Application needs to be restarted');
    console.log('4. Network/DNS issues');
    console.log('\n🔧 Try:');
    console.log('1. Verify .next folder exists on server');
    console.log('2. Restart Node.js application');
    console.log('3. Check server logs for errors');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n💡 MANUAL TESTING:\n');
  console.log('1. Open browser in Incognito mode');
  console.log('2. Visit: ' + SITE_URL + '/spiritual-legacy');
  console.log('3. Press F12 to open DevTools');
  console.log('4. Check Console tab for errors');
  console.log('5. Check Network tab for 404 errors');
  console.log('\n');
  
  process.exit(failedTests > 0 ? 1 : 0);
}

runTests().catch((error) => {
  console.error('\n❌ Test runner failed:', error.message);
  process.exit(1);
});
