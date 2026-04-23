#!/usr/bin/env node

/**
 * Apply Performance Optimizations Script
 * Analyzes and reports on performance optimizations needed
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Performance Optimization Analysis\n');

// Check if performance config exists
const perfConfigPath = path.join(process.cwd(), 'performance.config.js');
if (fs.existsSync(perfConfigPath)) {
  console.log('✅ performance.config.js found');
} else {
  console.log('❌ performance.config.js not found');
}

// Check database connection pooling
const dbPath = path.join(process.cwd(), 'src/lib/db.ts');
if (fs.existsSync(dbPath)) {
  const dbContent = fs.readFileSync(dbPath, 'utf8');
  if (dbContent.includes('connection_limit')) {
    console.log('✅ Database connection pooling configured');
  } else {
    console.log('❌ Database connection pooling not configured');
  }
}

// Check API optimizer
const apiOptimizerPath = path.join(process.cwd(), 'src/lib/api-optimizer.ts');
if (fs.existsSync(apiOptimizerPath)) {
  console.log('✅ API optimizer module created');
} else {
  console.log('❌ API optimizer module not found');
}

// Check response cache
const responseCachePath = path.join(process.cwd(), 'src/lib/response-cache.ts');
if (fs.existsSync(responseCachePath)) {
  console.log('✅ Response cache module created');
} else {
  console.log('❌ Response cache module not found');
}

// Analyze API routes
console.log('\n📊 API Routes Analysis:\n');

const apiDir = path.join(process.cwd(), 'src/app/api');
let totalRoutes = 0;
let optimizedRoutes = 0;
let unoptimizedRoutes = [];

function analyzeRoutes(dir) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      analyzeRoutes(filePath);
    } else if (file === 'route.ts' || file === 'route.js') {
      totalRoutes++;
      const content = fs.readFileSync(filePath, 'utf8');
      
      const hasCache = content.includes('cachedQuery') || 
                      content.includes('withCache') ||
                      content.includes('optimizeRoute');
      
      const hasSelect = content.includes('select:');
      const hasPagination = content.includes('skip') && content.includes('take');
      
      const routePath = filePath.replace(apiDir, '').replace(/\\/g, '/').replace('/route.ts', '');
      
      if (hasCache && hasSelect) {
        optimizedRoutes++;
        console.log(`✅ ${routePath} - Optimized (cache: ${hasCache}, select: ${hasSelect})`);
      } else {
        unoptimizedRoutes.push({
          path: routePath,
          hasCache,
          hasSelect,
          hasPagination
        });
        console.log(`⚠️  ${routePath} - Needs optimization (cache: ${hasCache}, select: ${hasSelect})`);
      }
    }
  }
}

analyzeRoutes(apiDir);

console.log(`\n📈 Summary:`);
console.log(`   Total routes: ${totalRoutes}`);
console.log(`   Optimized: ${optimizedRoutes}`);
console.log(`   Need optimization: ${unoptimizedRoutes.length}`);

if (unoptimizedRoutes.length > 0) {
  console.log('\n🔧 Routes needing optimization:');
  unoptimizedRoutes.forEach(route => {
    console.log(`   ${route.path}`);
    if (!route.hasCache) console.log(`      - Add caching with cachedQuery()`);
    if (!route.hasSelect) console.log(`      - Add select clause to limit fields`);
    if (!route.hasPagination && route.path.includes('all')) {
      console.log(`      - Add pagination (skip/take)`);
    }
  });
}

// Environment recommendations
console.log('\n⚙️  Environment Variable Recommendations:\n');

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const checks = [
    { key: 'LOG_LEVEL', recommended: 'error', desc: 'Reduce logging overhead' },
    { key: 'RATE_LIMIT_ENABLED', recommended: 'true', desc: 'Enable rate limiting' },
    { key: 'ENABLE_SECURITY_MONITORING', recommended: 'false', desc: 'Disable heavy monitoring' },
    { key: 'ENABLE_AUDIT_LOGGING', recommended: 'false', desc: 'Disable audit logging' },
    { key: 'ENABLE_PERFORMANCE_MONITORING', recommended: 'false', desc: 'Disable perf monitoring' },
  ];
  
  checks.forEach(check => {
    const regex = new RegExp(`${check.key}=(.+)`, 'i');
    const match = envContent.match(regex);
    
    if (match) {
      const value = match[1].trim();
      if (value === check.recommended) {
        console.log(`✅ ${check.key}=${value} - ${check.desc}`);
      } else {
        console.log(`⚠️  ${check.key}=${value} - Recommend: ${check.recommended} (${check.desc})`);
      }
    } else {
      console.log(`❌ ${check.key} not set - Recommend: ${check.recommended} (${check.desc})`);
    }
  });
}

// Performance tips
console.log('\n💡 Performance Tips:\n');
console.log('1. Enable HTTP/2 on your hosting provider');
console.log('2. Use a CDN for static assets (Cloudflare, etc.)');
console.log('3. Enable gzip/brotli compression at server level');
console.log('4. Monitor database connection pool usage');
console.log('5. Consider Redis for distributed caching');
console.log('6. Use database read replicas for read-heavy workloads');
console.log('7. Implement database query result caching');
console.log('8. Optimize images (WebP, AVIF formats)');
console.log('9. Use lazy loading for images and components');
console.log('10. Monitor and optimize slow database queries');

console.log('\n✨ Done!\n');
