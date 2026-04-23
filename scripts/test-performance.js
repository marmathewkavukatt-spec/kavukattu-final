#!/usr/bin/env node

/**
 * Performance Testing Script
 * Tests API endpoint response times
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testEndpoint(name, url, options = {}) {
  const start = Date.now();
  try {
    const response = await fetch(`${BASE_URL}${url}`, options);
    const duration = Date.now() - start;
    const status = response.status;
    const statusIcon = status < 400 ? '✅' : '❌';
    
    console.log(`${statusIcon} ${name.padEnd(35)} ${duration}ms (${status})`);
    return { name, duration, status, success: status < 400 };
  } catch (error) {
    const duration = Date.now() - start;
    console.log(`❌ ${name.padEnd(35)} ${duration}ms (ERROR: ${error.message})`);
    return { name, duration, status: 0, success: false, error: error.message };
  }
}

async function runTests() {
  console.log('\n🚀 Performance Testing Started\n');
  console.log('Endpoint'.padEnd(37) + 'Response Time\n' + '='.repeat(60));

  const results = [];

  // Public endpoints
  results.push(await testEndpoint('GET /api/slider', '/api/slider'));
  results.push(await testEndpoint('GET /api/announcements', '/api/announcements'));
  results.push(await testEndpoint('GET /api/gallery', '/api/gallery'));
  results.push(await testEndpoint('GET /api/gallery/categories', '/api/gallery/categories'));
  results.push(await testEndpoint('GET /api/testimonies', '/api/testimonies'));
  results.push(await testEndpoint('GET /api/resources', '/api/resources'));
  results.push(await testEndpoint('GET /api/timings', '/api/timings'));
  results.push(await testEndpoint('GET /api/timeline', '/api/timeline'));
  results.push(await testEndpoint('GET /api/about', '/api/about'));
  results.push(await testEndpoint('GET /api/visit-info', '/api/visit-info'));
  results.push(await testEndpoint('GET /api/contributions', '/api/contributions'));
  results.push(await testEndpoint('GET /api/contributions (paginated)', '/api/contributions?page=1&limit=10'));

  // Calculate statistics
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const avgTime = successful.length > 0 
    ? Math.round(successful.reduce((sum, r) => sum + r.duration, 0) / successful.length)
    : 0;
  const maxTime = successful.length > 0 
    ? Math.max(...successful.map(r => r.duration))
    : 0;
  const minTime = successful.length > 0 
    ? Math.min(...successful.map(r => r.duration))
    : 0;

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Performance Summary\n');
  console.log(`Total Tests:        ${results.length}`);
  console.log(`Successful:         ${successful.length} ✅`);
  console.log(`Failed:             ${failed.length} ${failed.length > 0 ? '❌' : '✅'}`);
  console.log(`Average Time:       ${avgTime}ms`);
  console.log(`Fastest:            ${minTime}ms`);
  console.log(`Slowest:            ${maxTime}ms`);
  
  console.log('\n🎯 Performance Rating:');
  if (avgTime < 100) {
    console.log('   ⚡ EXCELLENT - Lightning fast!');
  } else if (avgTime < 200) {
    console.log('   ✅ GOOD - Fast and responsive');
  } else if (avgTime < 400) {
    console.log('   ⚠️  ACCEPTABLE - Could be optimized');
  } else {
    console.log('   ❌ SLOW - Needs optimization');
  }

  if (failed.length > 0) {
    console.log('\n❌ Failed Endpoints:');
    failed.forEach(r => {
      console.log(`   - ${r.name}: ${r.error || `Status ${r.status}`}`);
    });
  }

  console.log('\n✨ Testing Complete!\n');
}

// Run tests
runTests().catch(console.error);
