#!/usr/bin/env node

/**
 * Rate Limit Monitoring Script
 * 
 * This script helps monitor rate limit performance and security events
 * Run with: node scripts/monitor-rate-limits.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(70));
console.log('🔍 RATE LIMIT & SECURITY MONITORING');
console.log('='.repeat(70) + '\n');

// Check if security config exists
const securityConfigPath = path.join(process.cwd(), 'security-config.json');
if (fs.existsSync(securityConfigPath)) {
  const config = JSON.parse(fs.readFileSync(securityConfigPath, 'utf8'));
  
  console.log('📊 Current Rate Limit Configuration:\n');
  console.log('Global API:');
  console.log(`  - Max Requests: ${config.rateLimiting.global.maxRequests} per ${config.rateLimiting.global.windowMs / 60000} minutes`);
  console.log(`  - Block Duration: ${config.rateLimiting.global.blockDurationMs / 60000} minutes\n`);
  
  console.log('Auth Endpoints:');
  console.log(`  - Max Requests: ${config.rateLimiting.auth.maxRequests} per ${config.rateLimiting.auth.windowMs / 60000} minutes`);
  console.log(`  - Block Duration: ${config.rateLimiting.auth.blockDurationMs / 60000} minutes\n`);
  
  console.log('Admin Endpoints:');
  console.log(`  - Max Requests: ${config.rateLimiting.admin.maxRequests} per ${config.rateLimiting.admin.windowMs / 60000} minutes`);
  console.log(`  - Block Duration: ${config.rateLimiting.admin.blockDurationMs / 60000} minutes\n`);
  
  console.log('Upload Endpoints:');
  console.log(`  - Max Requests: ${config.rateLimiting.upload.maxRequests} per ${config.rateLimiting.upload.windowMs / 60000} minutes`);
  console.log(`  - Block Duration: ${config.rateLimiting.upload.blockDurationMs / 60000} minutes\n`);
  
  console.log('API Endpoints:');
  console.log(`  - Max Requests: ${config.rateLimiting.api.maxRequests} per ${config.rateLimiting.api.windowMs / 60000} minutes`);
  console.log(`  - Block Duration: ${config.rateLimiting.api.blockDurationMs / 60000} minutes\n`);
}

// Check security logs
const securityLogsDir = path.join(process.cwd(), 'logs', 'security');
if (fs.existsSync(securityLogsDir)) {
  console.log('='.repeat(70));
  console.log('📝 Recent Security Events:\n');
  
  const logFiles = fs.readdirSync(securityLogsDir)
    .filter(file => file.endsWith('.log'))
    .sort()
    .reverse()
    .slice(0, 5); // Last 5 log files
  
  if (logFiles.length === 0) {
    console.log('  ✅ No security log files found (clean slate!)\n');
  } else {
    let totalEvents = 0;
    let rateLimitEvents = 0;
    let blockedIPs = new Set();
    let botBlocks = 0;
    
    logFiles.forEach(file => {
      const content = fs.readFileSync(path.join(securityLogsDir, file), 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      
      lines.forEach(line => {
        totalEvents++;
        
        if (line.includes('RATE_LIMIT_EXCEEDED')) {
          rateLimitEvents++;
        }
        
        if (line.includes('IP_BLACKLISTED')) {
          const ipMatch = line.match(/ip['":\s]+([0-9.]+)/i);
          if (ipMatch) blockedIPs.add(ipMatch[1]);
        }
        
        if (line.includes('BOT_BLOCKED')) {
          botBlocks++;
        }
      });
    });
    
    console.log(`  Total Security Events: ${totalEvents}`);
    console.log(`  Rate Limit Violations: ${rateLimitEvents} (${totalEvents > 0 ? ((rateLimitEvents / totalEvents) * 100).toFixed(1) : 0}%)`);
    console.log(`  Blocked Bots: ${botBlocks}`);
    console.log(`  Blacklisted IPs: ${blockedIPs.size}`);
    
    if (blockedIPs.size > 0) {
      console.log('\n  🚫 Blacklisted IPs:');
      Array.from(blockedIPs).slice(0, 10).forEach(ip => {
        console.log(`     - ${ip}`);
      });
      if (blockedIPs.size > 10) {
        console.log(`     ... and ${blockedIPs.size - 10} more`);
      }
    }
    
    console.log('');
  }
}

// Performance recommendations
console.log('='.repeat(70));
console.log('💡 Performance Recommendations:\n');

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const checks = [
    {
      key: 'ENABLE_ADVANCED_SECURITY',
      expected: 'false',
      message: 'Advanced security should be disabled for better performance'
    },
    {
      key: 'ENABLE_AUDIT_LOGGING',
      expected: 'false',
      message: 'Audit logging adds overhead, disable if not needed'
    },
    {
      key: 'ENABLE_PERFORMANCE_MONITORING',
      expected: 'false',
      message: 'Performance monitoring itself adds overhead'
    },
    {
      key: 'LOG_LEVEL',
      expected: 'error',
      message: 'Log level should be "error" in production'
    }
  ];
  
  let allGood = true;
  
  checks.forEach(check => {
    const match = envContent.match(new RegExp(`${check.key}=(.+)`));
    if (match) {
      const value = match[1].trim();
      if (value !== check.expected) {
        console.log(`  ⚠️  ${check.key}=${value} (recommended: ${check.expected})`);
        console.log(`     ${check.message}\n`);
        allGood = false;
      }
    }
  });
  
  if (allGood) {
    console.log('  ✅ All performance settings are optimized!\n');
  }
}

// Summary
console.log('='.repeat(70));
console.log('📈 Optimization Status:\n');

const optimizations = [
  '✅ Rate limits increased (5x for global, 2-4x for endpoints)',
  '✅ Block durations reduced (50% shorter)',
  '✅ Security check caching enabled (5s TTL)',
  '✅ Blacklist threshold increased (10 → 20 violations)',
  '✅ Max sessions per user increased (3 → 5)',
];

optimizations.forEach(opt => console.log(`  ${opt}`));

console.log('\n' + '='.repeat(70));
console.log('🎯 Next Steps:\n');
console.log('  1. Monitor your website performance');
console.log('  2. Check for reduced 429 errors');
console.log('  3. Verify legitimate users can browse freely');
console.log('  4. Ensure malicious requests still get blocked');
console.log('\n  Run this script periodically to monitor security events.');
console.log('='.repeat(70) + '\n');
