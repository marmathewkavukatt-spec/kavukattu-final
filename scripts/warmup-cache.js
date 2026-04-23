#!/usr/bin/env node

/**
 * Cache Warmup Script
 * Pre-loads frequently accessed data into cache on server start
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function warmupEndpoint(name, url) {
  try {
    const start = Date.now();
    const response = await fetch(`${BASE_URL}${url}`);
    const duration = Date.now() - start;
    
    if (response.ok) {
      console.log(`✅ ${name.padEnd(30)} ${duration}ms`);
      return true;
    } else {
      console.log(`⚠️  ${name.padEnd(30)} ${duration}ms (${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name.padEnd(30)} ERROR: ${error.message}`);
    return false;
  }
}

async function warmupCache() {
  console.log('\n🔥 Warming up cache...\n');
  
  const endpoints = [
    ['Sliders', '/api/slider'],
    ['Announcements', '/api/announcements'],
    ['Gallery', '/api/gallery'],
    ['Gallery Categories', '/api/gallery/categories'],
    ['Testimonies', '/api/testimonies'],
    ['Resources', '/api/resources'],
    ['Timings', '/api/timings'],
    ['Timeline', '/api/timeline'],
    ['About', '/api/about'],
    ['Visit Info', '/api/visit-info'],
  ];

  let successful = 0;
  
  for (const [name, url] of endpoints) {
    const success = await warmupEndpoint(name, url);
    if (success) successful++;
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n✨ Cache warmup complete! ${successful}/${endpoints.length} endpoints ready.\n`);
}

// Run warmup
warmupCache().catch(console.error);
