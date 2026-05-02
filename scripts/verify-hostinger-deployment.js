#!/usr/bin/env node

/**
 * Hostinger Deployment Verification Script
 * Checks if the deployment is properly configured and identifies issues
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://marmathewkavukatt.org';
const CRITICAL_PAGES = [
  '/',
  '/spiritual-legacy',
  '/about',
  '/gallery',
  '/announcements',
];

console.log('========================================');
console.log('🔍 Hostinger Deployment Verification');
console.log('========================================\n');

// Check local files
console.log('📁 Checking local files...\n');

const checks = [
  { file: '.htaccess', required: true, description: 'Root .htaccess (MIME types)' },
  { file: 'public/.htaccess', required: true, description: 'Public .htaccess' },
  { file: '.next/BUILD_ID', required: true, description: 'Build ID' },
  { file: '.next/static', required: true, description: 'Static assets' },
  { file: 'package.json', required: true, description: 'Package config' },
  { file: '.env', required: true, description: 'Environment variables' },
];

let allFilesExist = true;

checks.forEach(check => {
  const exists = fs.existsSync(check.file);
  const icon = exists ? '✅' : '❌';
  console.log(`${icon} ${check.description}: ${check.file}`);
  
  if (!exists && check.required) {
    allFilesExist = false;
  }
});

console.log('');

if (!allFilesExist) {
  console.log('❌ Some required files are missing!');
  console.log('Run: npm run build\n');
  process.exit(1);
}

// Check BUILD_ID
if (fs.existsSync('.next/BUILD_ID')) {
  const buildId = fs.readFileSync('.next/BUILD_ID', 'utf8').trim();
  console.log(`🆔 Build ID: ${buildId}\n`);
}

// Check .htaccess content
console.log('📄 Checking .htaccess configuration...\n');

if (fs.existsSync('.htaccess')) {
  const htaccess = fs.readFileSync('.htaccess', 'utf8');
  
  const requiredRules = [
    { pattern: /AddType application\/javascript/, name: 'JavaScript MIME type' },
    { pattern: /AddType text\/css/, name: 'CSS MIME type' },
    { pattern: /AddType image\/webp/, name: 'WebP MIME type' },
    { pattern: /RewriteEngine On/, name: 'Rewrite engine' },
    { pattern: /X-Content-Type-Options/, name: 'Security headers' },
  ];
  
  requiredRules.forEach(rule => {
    const exists = rule.pattern.test(htaccess);
    const icon = exists ? '✅' : '⚠️ ';
    console.log(`${icon} ${rule.name}`);
  });
  
  console.log('');
}

// Check static files
console.log('📦 Checking static assets...\n');

const staticDir = '.next/static';
if (fs.existsSync(staticDir)) {
  const chunks = path.join(staticDir, 'chunks');
  if (fs.existsSync(chunks)) {
    const chunkFiles = fs.readdirSync(chunks).filter(f => f.endsWith('.js'));
    console.log(`✅ Found ${chunkFiles.length} chunk files`);
  }
  
  const css = path.join(staticDir, 'css');
  if (fs.existsSync(css)) {
    const cssFiles = fs.readdirSync(css).filter(f => f.endsWith('.css'));
    console.log(`✅ Found ${cssFiles.length} CSS files`);
  }
  
  console.log('');
}

// Test remote URLs
console.log('🌐 Testing remote deployment...\n');
console.log(`Site: ${SITE_URL}\n`);

function testUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { timeout: 10000 }, (res) => {
      const { statusCode, headers } = res;
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          statusCode,
          contentType: headers['content-type'],
          cacheControl: headers['cache-control'],
          contentLength: headers['content-length'],
          body: data,
        });
      });
    }).on('error', (err) => {
      resolve({
        url,
        error: err.message,
      });
    });
  });
}

async function verifyDeployment() {
  console.log('Testing critical pages...\n');
  
  for (const page of CRITICAL_PAGES) {
    const url = `${SITE_URL}${page}`;
    const result = await testUrl(url);
    
    if (result.error) {
      console.log(`❌ ${page}`);
      console.log(`   Error: ${result.error}\n`);
      continue;
    }
    
    const statusIcon = result.statusCode === 200 ? '✅' : '❌';
    console.log(`${statusIcon} ${page} (${result.statusCode})`);
    
    if (result.contentType) {
      console.log(`   Content-Type: ${result.contentType}`);
    }
    
    // Check for chunk errors in HTML
    if (result.body && result.body.includes('ChunkLoadError')) {
      console.log(`   ⚠️  Warning: ChunkLoadError detected in page`);
    }
    
    console.log('');
  }
  
  // Test a static asset
  console.log('Testing static assets...\n');
  
  const testAssets = [
    '/_next/static/css/app/layout.css',
    '/_next/static/chunks/main.js',
  ];
  
  for (const asset of testAssets) {
    const url = `${SITE_URL}${asset}`;
    const result = await testUrl(url);
    
    if (result.error) {
      console.log(`⚠️  ${asset}`);
      console.log(`   Error: ${result.error}\n`);
      continue;
    }
    
    const statusIcon = result.statusCode === 200 ? '✅' : '❌';
    console.log(`${statusIcon} ${asset}`);
    console.log(`   Status: ${result.statusCode}`);
    console.log(`   Content-Type: ${result.contentType || 'NOT SET'}`);
    
    // Check MIME type
    if (asset.endsWith('.css') && !result.contentType?.includes('text/css')) {
      console.log(`   ❌ WRONG MIME TYPE! Should be text/css`);
    } else if (asset.endsWith('.js') && !result.contentType?.includes('javascript')) {
      console.log(`   ❌ WRONG MIME TYPE! Should be application/javascript`);
    }
    
    console.log('');
  }
  
  console.log('========================================');
  console.log('✅ Verification Complete');
  console.log('========================================\n');
  
  console.log('📋 Next Steps:\n');
  console.log('1. If MIME types are wrong:');
  console.log('   - Upload .htaccess to server root');
  console.log('   - Upload public/.htaccess to public directory');
  console.log('   - Restart Apache/web server\n');
  
  console.log('2. If pages return 404:');
  console.log('   - Check if .next folder is uploaded');
  console.log('   - Verify Node.js is running (pm2 list)');
  console.log('   - Check server logs\n');
  
  console.log('3. If chunk errors persist:');
  console.log('   - Clear browser cache (Ctrl+Shift+Delete)');
  console.log('   - Clear CDN cache (if using Cloudflare)');
  console.log('   - Force rebuild: rm -rf .next && npm run build\n');
}

verifyDeployment().catch(console.error);
