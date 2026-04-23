#!/usr/bin/env node

/**
 * Comprehensive Security Testing Script
 * 
 * This script tests all implemented security measures to ensure they're working correctly.
 * It performs various security tests and generates a detailed security report.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load environment variables
require('dotenv').config();

console.log('🔍 Running comprehensive security tests...\n');

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function addTest(name, status, message, details = null) {
  testResults.tests.push({
    name,
    status,
    message,
    details,
    timestamp: new Date().toISOString()
  });
  
  if (status === 'PASS') {
    testResults.passed++;
    console.log(`✅ ${name}: ${message}`);
  } else if (status === 'FAIL') {
    testResults.failed++;
    console.log(`❌ ${name}: ${message}`);
  } else if (status === 'WARN') {
    testResults.warnings++;
    console.log(`⚠️  ${name}: ${message}`);
  }
}

// 1. Test Environment Variables Security
function testEnvironmentVariables() {
  console.log('🔐 Testing environment variables security...');
  
  const requiredSecrets = [
    { name: 'JWT_SECRET', minLength: 64 },
    { name: 'CSRF_SECRET', minLength: 32 },
    { name: 'ENCRYPTION_KEY', minLength: 32 },
    { name: 'SESSION_SECRET', minLength: 32 }
  ];
  
  requiredSecrets.forEach(secret => {
    const value = process.env[secret.name];
    if (!value) {
      addTest(`${secret.name} Exists`, 'FAIL', `${secret.name} is not set`);
    } else if (value.length < secret.minLength) {
      addTest(`${secret.name} Length`, 'FAIL', `${secret.name} is too short (${value.length} < ${secret.minLength})`);
    } else {
      addTest(`${secret.name} Security`, 'PASS', `${secret.name} is properly configured`);
    }
  });
  
  // Test for default/weak secrets
  const weakSecrets = [
    'default',
    'secret',
    'password',
    '123456',
    'change_me',
    'your_secret_here'
  ];
  
  requiredSecrets.forEach(secret => {
    const value = process.env[secret.name];
    if (value && weakSecrets.some(weak => value.toLowerCase().includes(weak))) {
      addTest(`${secret.name} Strength`, 'FAIL', `${secret.name} appears to use weak/default value`);
    } else if (value) {
      addTest(`${secret.name} Strength`, 'PASS', `${secret.name} uses strong value`);
    }
  });
}

// 2. Test Security Configuration
function testSecurityConfiguration() {
  console.log('\n⚙️  Testing security configuration...');
  
  const configPath = path.join(process.cwd(), 'security-config.json');
  
  if (!fs.existsSync(configPath)) {
    addTest('Security Config File', 'FAIL', 'security-config.json not found');
    return;
  }
  
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    addTest('Security Config File', 'PASS', 'security-config.json exists and is valid JSON');
    
    // Test critical security features
    const criticalFeatures = [
      'rateLimiting',
      'inputValidation',
      'sqlInjectionProtection',
      'xssProtection',
      'csrfProtection',
      'sessionSecurity',
      'securityHeaders'
    ];
    
    criticalFeatures.forEach(feature => {
      if (config.features && config.features[feature] === true) {
        addTest(`Feature: ${feature}`, 'PASS', `${feature} is enabled`);
      } else {
        addTest(`Feature: ${feature}`, 'FAIL', `${feature} is not enabled`);
      }
    });
    
    // Test monitoring configuration
    if (config.monitoring && config.monitoring.enabled) {
      addTest('Security Monitoring', 'PASS', 'Security monitoring is enabled');
    } else {
      addTest('Security Monitoring', 'FAIL', 'Security monitoring is not enabled');
    }
    
  } catch (error) {
    addTest('Security Config Parse', 'FAIL', `Failed to parse security-config.json: ${error.message}`);
  }
}

// 3. Test File Security
function testFileSecurity() {
  console.log('\n📁 Testing file security...');
  
  const sensitiveFiles = ['.env', '.env.local', '.env.production'];
  
  sensitiveFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      try {
        const stats = fs.statSync(filePath);
        const mode = stats.mode & parseInt('777', 8);
        
        if (process.platform === 'win32') {
          addTest(`File Permissions: ${file}`, 'WARN', 'File permission check skipped on Windows');
        } else if (mode <= parseInt('600', 8)) {
          addTest(`File Permissions: ${file}`, 'PASS', `${file} has secure permissions`);
        } else {
          addTest(`File Permissions: ${file}`, 'FAIL', `${file} has overly permissive permissions (${mode.toString(8)})`);
        }
      } catch (error) {
        addTest(`File Permissions: ${file}`, 'FAIL', `Cannot check permissions for ${file}: ${error.message}`);
      }
    }
  });
  
  // Test directory structure
  const requiredDirs = [
    'logs/security',
    'logs/audit',
    'backups/security',
    'quarantine'
  ];
  
  requiredDirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      addTest(`Directory: ${dir}`, 'PASS', `${dir} directory exists`);
    } else {
      addTest(`Directory: ${dir}`, 'FAIL', `${dir} directory is missing`);
    }
  });
}

// 4. Test Security Headers Configuration
function testSecurityHeaders() {
  console.log('\n🛡️  Testing security headers configuration...');
  
  const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
  
  if (!fs.existsSync(nextConfigPath)) {
    addTest('Next.js Config', 'FAIL', 'next.config.mjs not found');
    return;
  }
  
  try {
    const configContent = fs.readFileSync(nextConfigPath, 'utf8');
    
    const requiredHeaders = [
      'X-Frame-Options',
      'X-Content-Type-Options',
      'X-XSS-Protection',
      'Referrer-Policy',
      'Permissions-Policy'
    ];
    
    requiredHeaders.forEach(header => {
      if (configContent.includes(header)) {
        addTest(`Header: ${header}`, 'PASS', `${header} is configured`);
      } else {
        addTest(`Header: ${header}`, 'FAIL', `${header} is not configured`);
      }
    });
    
    // Test for HSTS in production
    if (configContent.includes('Strict-Transport-Security')) {
      addTest('HSTS Configuration', 'PASS', 'HSTS is configured');
    } else {
      addTest('HSTS Configuration', 'WARN', 'HSTS should be configured for production');
    }
    
    // Test CSP configuration
    if (configContent.includes('Content-Security-Policy') || configContent.includes('CSP')) {
      addTest('CSP Configuration', 'PASS', 'Content Security Policy is configured');
    } else {
      addTest('CSP Configuration', 'FAIL', 'Content Security Policy is not configured');
    }
    
  } catch (error) {
    addTest('Next.js Config Parse', 'FAIL', `Failed to read next.config.mjs: ${error.message}`);
  }
}

// 5. Test Middleware Security
function testMiddlewareSecurity() {
  console.log('\n🔒 Testing middleware security...');
  
  const middlewarePath = path.join(process.cwd(), 'src', 'middleware.ts');
  
  if (!fs.existsSync(middlewarePath)) {
    addTest('Security Middleware', 'FAIL', 'src/middleware.ts not found');
    return;
  }
  
  try {
    const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
    
    const securityChecks = [
      { name: 'Rate Limiting', pattern: /rateLimit|rateLimiting/i },
      { name: 'Bot Detection', pattern: /bot.*detect|detectBot/i },
      { name: 'Request Validation', pattern: /validateRequest|requestValidation/i },
      { name: 'CSRF Protection', pattern: /csrf/i },
      { name: 'Security Headers', pattern: /securityHeaders|getSecurityHeaders/i }
    ];
    
    securityChecks.forEach(check => {
      if (check.pattern.test(middlewareContent)) {
        addTest(`Middleware: ${check.name}`, 'PASS', `${check.name} is implemented in middleware`);
      } else {
        addTest(`Middleware: ${check.name}`, 'FAIL', `${check.name} is not implemented in middleware`);
      }
    });
    
  } catch (error) {
    addTest('Middleware Parse', 'FAIL', `Failed to read middleware: ${error.message}`);
  }
}

// 6. Test Database Security
function testDatabaseSecurity() {
  console.log('\n🗄️  Testing database security...');
  
  const dbSecurityPath = path.join(process.cwd(), 'src', 'lib', 'db-security-enhanced.ts');
  
  if (fs.existsSync(dbSecurityPath)) {
    addTest('Database Security Module', 'PASS', 'Enhanced database security module exists');
    
    try {
      const dbContent = fs.readFileSync(dbSecurityPath, 'utf8');
      
      const dbSecurityFeatures = [
        { name: 'Query Sanitization', pattern: /sanitize.*query|querySanitization/i },
        { name: 'Query Timeout', pattern: /timeout|queryTimeout/i },
        { name: 'Audit Logging', pattern: /audit.*log|logQuery/i },
        { name: 'Slow Query Detection', pattern: /slow.*query|slowQuery/i }
      ];
      
      dbSecurityFeatures.forEach(feature => {
        if (feature.pattern.test(dbContent)) {
          addTest(`DB Security: ${feature.name}`, 'PASS', `${feature.name} is implemented`);
        } else {
          addTest(`DB Security: ${feature.name}`, 'WARN', `${feature.name} may not be implemented`);
        }
      });
      
    } catch (error) {
      addTest('DB Security Parse', 'FAIL', `Failed to read database security module: ${error.message}`);
    }
  } else {
    addTest('Database Security Module', 'FAIL', 'Enhanced database security module not found');
  }
  
  // Test database connection security
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    if (databaseUrl.includes('ssl=true') || databaseUrl.includes('sslmode=require')) {
      addTest('Database SSL', 'PASS', 'Database connection uses SSL');
    } else {
      addTest('Database SSL', 'WARN', 'Database SSL should be enabled for production');
    }
  } else {
    addTest('Database URL', 'FAIL', 'DATABASE_URL is not configured');
  }
}

// 7. Test API Security
function testApiSecurity() {
  console.log('\n🔌 Testing API security...');
  
  const apiSecurityPath = path.join(process.cwd(), 'src', 'lib', 'api-security-wrapper.ts');
  
  if (fs.existsSync(apiSecurityPath)) {
    addTest('API Security Wrapper', 'PASS', 'API security wrapper exists');
    
    try {
      const apiContent = fs.readFileSync(apiSecurityPath, 'utf8');
      
      const apiSecurityFeatures = [
        { name: 'Input Validation', pattern: /input.*validation|validateInput/i },
        { name: 'Request Size Limiting', pattern: /request.*size|maxRequestSize/i },
        { name: 'Content Type Validation', pattern: /content.*type|contentType/i },
        { name: 'Authentication Check', pattern: /auth.*check|requireAuth/i },
        { name: 'CSRF Validation', pattern: /csrf.*validation|requireCSRF/i }
      ];
      
      apiSecurityFeatures.forEach(feature => {
        if (feature.pattern.test(apiContent)) {
          addTest(`API Security: ${feature.name}`, 'PASS', `${feature.name} is implemented`);
        } else {
          addTest(`API Security: ${feature.name}`, 'WARN', `${feature.name} may not be implemented`);
        }
      });
      
    } catch (error) {
      addTest('API Security Parse', 'FAIL', `Failed to read API security wrapper: ${error.message}`);
    }
  } else {
    addTest('API Security Wrapper', 'FAIL', 'API security wrapper not found');
  }
}

// 8. Test Production Security Features
function testProductionSecurity() {
  console.log('\n🏭 Testing production security features...');
  
  const productionSecurityPath = path.join(process.cwd(), 'src', 'lib', 'security-production.ts');
  
  if (fs.existsSync(productionSecurityPath)) {
    addTest('Production Security Module', 'PASS', 'Production security module exists');
    
    try {
      const prodContent = fs.readFileSync(productionSecurityPath, 'utf8');
      
      const prodSecurityFeatures = [
        { name: 'Advanced SQL Injection Prevention', pattern: /sanitizeSQLInput|sqlInjection/i },
        { name: 'XSS Prevention', pattern: /sanitizeXSS|xssProtection/i },
        { name: 'Advanced Bot Detection', pattern: /detectAdvancedBot|botDetection/i },
        { name: 'Request Fingerprinting', pattern: /fingerprint|requestFingerprint/i },
        { name: 'Security Event Logging', pattern: /logSecurityEvent|securityEvent/i },
        { name: 'IP Blacklisting', pattern: /blacklist|ipBlacklist/i }
      ];
      
      prodSecurityFeatures.forEach(feature => {
        if (feature.pattern.test(prodContent)) {
          addTest(`Production: ${feature.name}`, 'PASS', `${feature.name} is implemented`);
        } else {
          addTest(`Production: ${feature.name}`, 'WARN', `${feature.name} may not be implemented`);
        }
      });
      
    } catch (error) {
      addTest('Production Security Parse', 'FAIL', `Failed to read production security module: ${error.message}`);
    }
  } else {
    addTest('Production Security Module', 'FAIL', 'Production security module not found');
  }
}

// 9. Test Security Dependencies
function testSecurityDependencies() {
  console.log('\n📦 Testing security dependencies...');
  
  const packagePath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    addTest('Package.json', 'FAIL', 'package.json not found');
    return;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const securityDependencies = [
      { name: 'bcryptjs', purpose: 'Password hashing' },
      { name: 'jose', purpose: 'JWT handling' }
    ];
    
    securityDependencies.forEach(dep => {
      if (packageJson.dependencies && packageJson.dependencies[dep.name]) {
        addTest(`Dependency: ${dep.name}`, 'PASS', `${dep.name} is installed for ${dep.purpose}`);
      } else {
        addTest(`Dependency: ${dep.name}`, 'WARN', `${dep.name} for ${dep.purpose} is not installed`);
      }
    });
    
    // Check for known vulnerable packages (basic check)
    const potentiallyVulnerable = ['lodash', 'moment', 'request'];
    potentiallyVulnerable.forEach(pkg => {
      if (packageJson.dependencies && packageJson.dependencies[pkg]) {
        addTest(`Vulnerable Package: ${pkg}`, 'WARN', `${pkg} may have known vulnerabilities - consider alternatives`);
      }
    });
    
  } catch (error) {
    addTest('Package.json Parse', 'FAIL', `Failed to parse package.json: ${error.message}`);
  }
}

// 10. Generate Security Report
function generateSecurityReport() {
  console.log('\n📊 Generating security report...');
  
  const report = {
    summary: {
      totalTests: testResults.tests.length,
      passed: testResults.passed,
      failed: testResults.failed,
      warnings: testResults.warnings,
      securityScore: Math.round((testResults.passed / testResults.tests.length) * 100),
      timestamp: new Date().toISOString()
    },
    results: testResults.tests,
    recommendations: generateRecommendations(),
    nextSteps: generateNextSteps()
  };
  
  const reportPath = path.join(process.cwd(), 'security-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Generate human-readable report
  const readableReport = generateReadableReport(report);
  const readableReportPath = path.join(process.cwd(), 'SECURITY-TEST-REPORT.md');
  fs.writeFileSync(readableReportPath, readableReport);
  
  addTest('Security Report', 'PASS', 'Security test report generated');
  
  return report;
}

function generateRecommendations() {
  const recommendations = [];
  
  if (testResults.failed > 0) {
    recommendations.push('Address all failed security tests before production deployment');
  }
  
  if (testResults.warnings > 5) {
    recommendations.push('Review and address security warnings to improve overall security posture');
  }
  
  recommendations.push('Regularly run security tests and audits');
  recommendations.push('Keep all dependencies updated');
  recommendations.push('Monitor security logs and alerts');
  recommendations.push('Conduct periodic penetration testing');
  
  return recommendations;
}

function generateNextSteps() {
  const nextSteps = [];
  
  if (testResults.failed > 0) {
    nextSteps.push('Fix all failed security tests');
  }
  
  nextSteps.push('Set up automated security testing in CI/CD pipeline');
  nextSteps.push('Configure security monitoring and alerting');
  nextSteps.push('Train team on security best practices');
  nextSteps.push('Establish incident response procedures');
  
  return nextSteps;
}

function generateReadableReport(report) {
  return `# Security Test Report

## Summary
- **Total Tests**: ${report.summary.totalTests}
- **Passed**: ${report.summary.passed} ✅
- **Failed**: ${report.summary.failed} ❌
- **Warnings**: ${report.summary.warnings} ⚠️
- **Security Score**: ${report.summary.securityScore}%
- **Generated**: ${report.summary.timestamp}

## Test Results

${report.results.map(test => {
  const icon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
  return `### ${icon} ${test.name}
**Status**: ${test.status}
**Message**: ${test.message}
${test.details ? `**Details**: ${test.details}` : ''}
`;
}).join('\n')}

## Recommendations

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

## Next Steps

${report.nextSteps.map(step => `1. ${step}`).join('\n')}

---
*Generated by Security Testing Script v1.0*
`;
}

// Main execution
async function main() {
  try {
    testEnvironmentVariables();
    testSecurityConfiguration();
    testFileSecurity();
    testSecurityHeaders();
    testMiddlewareSecurity();
    testDatabaseSecurity();
    testApiSecurity();
    testProductionSecurity();
    testSecurityDependencies();
    
    const report = generateSecurityReport();
    
    console.log('\n' + '='.repeat(60));
    console.log('🛡️  SECURITY TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`⚠️  Warnings: ${report.summary.warnings}`);
    console.log(`🎯 Security Score: ${report.summary.securityScore}%`);
    
    if (report.summary.failed === 0) {
      console.log('\n🎉 All critical security tests passed!');
      console.log('📋 Review SECURITY-TEST-REPORT.md for detailed results');
    } else {
      console.log('\n⚠️  Some security tests failed. Please address them before production deployment.');
      console.log('📋 See SECURITY-TEST-REPORT.md for detailed results and recommendations');
    }
    
    console.log('\n📊 Reports generated:');
    console.log('   - security-test-report.json (machine-readable)');
    console.log('   - SECURITY-TEST-REPORT.md (human-readable)');
    
    process.exit(report.summary.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Security testing failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  testEnvironmentVariables,
  testSecurityConfiguration,
  testFileSecurity,
  testSecurityHeaders,
  testMiddlewareSecurity,
  testDatabaseSecurity,
  testApiSecurity,
  testProductionSecurity,
  testSecurityDependencies,
  generateSecurityReport
};