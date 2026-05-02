#!/usr/bin/env node

/**
 * Post-Deployment Verification Script
 * 
 * Verifies the deployment is working correctly.
 * Run this after deploying to production.
 */

const https = require('https');
const http = require('http');

// Configuration
const SITE_URL = process.env.SITE_URL || 'https://marmathewkavukatt.org';
const TIMEOUT = 10000; // 10 seconds

console.log('🔍 Post-Deployment Verification\n');
console.log('='.repeat(60));
console.log(`Testing: ${SITE_URL}\n`);

const tests = [];
let passedTests = 0;
let failedTests = 0;

// Helper function to make HTTP request
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, { timeout: TIMEOUT }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Test 1: Homepage loads
tests.push({
  name: 'Homepage loads',
  test: async () => {
    const response = await makeRequest(SITE_URL);
    if (response.statusCode === 200) {
      return { pass: true, message: 'Homepage loaded successfully' };
    }
    return { pass: false, message: `Status code: ${response.statusCode}` };
  },
});

// Test 2: Check cache headers
tests.push({
  name: 'Cache headers configured',
  test: async () => {
    const response = await makeRequest(SITE_URL);
    const cacheControl = response.headers['cache-control'];
    
    if (cacheControl && (cacheControl.includes('no-cache') || cacheControl.includes('must-revalidate'))) {
      return { pass: true, message: `Cache-Control: ${cacheControl}` };
    }
    return { pass: false, message: `Cache-Control: ${cacheControl || 'not set'}` };
  },
});

// Test 3: Spiritual Legacy page loads
tests.push({
  name: 'Spiritual Legacy page loads',
  test: async () => {
    const response = await makeRequest(`${SITE_URL}/spiritual-legacy`);
    if (response.statusCode === 200) {
      return { pass: true, message: 'Page loaded successfully' };
    }
    return { pass: false, message: `Status code: ${response.statusCode}` };
  },
});

// Test 4: Check for Next.js chunks
tests.push({
  name: 'Next.js chunks present',
  test: async () => {
    const response = await makeRequest(SITE_URL);
    if (response.body.includes('/_next/static/')) {
      return { pass: true, message: 'Next.js chunks found in HTML' };
    }
    return { pass: false, message: 'Next.js chunks not found' };
  },
});

// Test 5: Check for error messages
tests.push({
  name: 'No error messages in HTML',
  test: async () => {
    const response = await makeRequest(SITE_URL);
    const hasError = response.body.toLowerCase().includes('error') || 
                     response.body.includes('404') ||
                     response.body.includes('500');
    
    if (!hasError) {
      return { pass: true, message: 'No error messages found' };
    }
    return { pass: false, message: 'Error messages detected in HTML' };
  },
});

// Test 6: Robots.txt exists
tests.push({
  name: 'Robots.txt accessible',
  test: async () => {
    const response = await makeRequest(`${SITE_URL}/robots.txt`);
    if (response.statusCode === 200) {
      return { pass: true, message: 'Robots.txt found' };
    }
    return { pass: false, message: `Status code: ${response.statusCode}` };
  },
});

// Test 7: Sitemap exists
tests.push({
  name: 'Sitemap accessible',
  test: async () => {
    const response = await makeRequest(`${SITE_URL}/sitemap.xml`);
    if (response.statusCode === 200) {
      return { pass: true, message: 'Sitemap found' };
    }
    return { pass: false, message: `Status code: ${response.statusCode}` };
  },
});

// Run all tests
async function runTests() {
  console.log('Running tests...\n');
  
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    process.stdout.write(`${i + 1}. ${test.name}... `);
    
    try {
      const result = await test.test();
      
      if (result.pass) {
        console.log(`✅ PASS - ${result.message}`);
        passedTests++;
      } else {
        console.log(`❌ FAIL - ${result.message}`);
        failedTests++;
      }
    } catch (error) {
      console.log(`❌ ERROR - ${error.message}`);
      failedTests++;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passedTests}/${tests.length}`);
  console.log(`❌ Failed: ${failedTests}/${tests.length}`);
  
  if (failedTests === 0) {
    console.log('\n🎉 All tests passed! Deployment verified successfully.\n');
  } else {
    console.log('\n⚠️  Some tests failed. Please investigate the issues above.\n');
  }
  
  // Recommendations
  console.log('📋 POST-DEPLOYMENT CHECKLIST:');
  console.log('□ Test on mobile devices (Chrome & Safari)');
  console.log('□ Clear CDN cache if using a CDN');
  console.log('□ Check browser console for errors');
  console.log('□ Test page navigation and refreshes');
  console.log('□ Monitor server logs for 404 errors');
  console.log('□ Verify images load correctly');
  console.log('□ Test in incognito/private mode\n');
  
  console.log('='.repeat(60));
  
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error('\n❌ Test suite failed:', error.message);
  process.exit(1);
});
