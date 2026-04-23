#!/usr/bin/env node

/**
 * Production-Grade Security Setup Script
 * 
 * This script implements comprehensive security measures for production deployment.
 * It includes advanced threat protection, monitoring, and compliance features.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🛡️  Setting up production-grade security measures...\n');

// 1. Generate cryptographically secure secrets
function generateSecrets() {
  console.log('🔐 Generating cryptographically secure secrets...');
  
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Generate strong secrets
  const jwtSecret = crypto.randomBytes(64).toString('hex');
  const csrfSecret = crypto.randomBytes(32).toString('hex');
  const encryptionKey = crypto.randomBytes(32).toString('hex');
  const sessionSecret = crypto.randomBytes(32).toString('hex');
  
  // Update or add security environment variables
  const securityEnvVars = {
    // Core Secrets
    JWT_SECRET: jwtSecret,
    CSRF_SECRET: csrfSecret,
    ENCRYPTION_KEY: encryptionKey,
    SESSION_SECRET: sessionSecret,
    
    // Security Features
    ENABLE_SECURITY_HEADERS: 'true',
    ENABLE_ADVANCED_SECURITY: 'true',
    ENABLE_PRODUCTION_SECURITY: 'true',
    
    // Rate Limiting
    RATE_LIMIT_ENABLED: 'true',
    RATE_LIMIT_MAX_REQUESTS: '1000',
    RATE_LIMIT_WINDOW_MS: '900000',
    RATE_LIMIT_BLOCK_DURATION: '3600000',
    
    // File Upload Security
    MAX_UPLOAD_SIZE_MB: '50',
    ENABLE_FILE_SCANNING: 'false',
    ENABLE_FILE_QUARANTINE: 'true',
    
    // Session Security
    SESSION_TIMEOUT_HOURS: '24',
    INACTIVITY_TIMEOUT_HOURS: '2',
    MAX_SESSIONS_PER_USER: '3',
    
    // Monitoring & Logging
    LOG_LEVEL: 'error',
    ENABLE_SECURITY_MONITORING: 'true',
    ENABLE_AUDIT_LOGGING: 'true',
    ENABLE_PERFORMANCE_MONITORING: 'true',
    
    // Access Control
    ADMIN_IP_WHITELIST: '',
    ENABLE_IP_FILTERING: 'true',
    ENABLE_GEO_BLOCKING: 'false',
    
    // Bot Protection
    ENABLE_HONEYPOT: 'true',
    ENABLE_BOT_PROTECTION: 'true',
    ENABLE_REQUEST_FINGERPRINTING: 'true',
    ENABLE_BEHAVIOR_ANALYSIS: 'true',
    
    // Database Security
    DATABASE_QUERY_TIMEOUT: '30000',
    SLOW_QUERY_THRESHOLD: '5000',
    ENABLE_DB_AUDIT_LOGGING: 'true',
    ENABLE_DB_ENCRYPTION: 'true',
    
    // Alerting
    SECURITY_ALERT_EMAIL: '',
    ENABLE_EMAIL_ALERTS: 'false',
    ENABLE_WEBHOOK_ALERTS: 'false',
    ALERT_WEBHOOK_URL: '',
    
    // Compliance
    ENABLE_GDPR_COMPLIANCE: 'true',
    DATA_RETENTION_DAYS: '365',
    ENABLE_CONSENT_MANAGEMENT: 'true'
  };
  
  // Update .env file
  Object.entries(securityEnvVars).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
  });
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Generated and stored cryptographically secure secrets');
}

// 2. Create comprehensive security directory structure
function createSecurityDirectories() {
  console.log('\n📁 Creating comprehensive security directory structure...');
  
  const directories = [
    'logs/security',
    'logs/audit',
    'logs/performance',
    'logs/errors',
    'logs/access',
    'backups/security',
    'backups/database',
    'quarantine',
    'temp/uploads',
    'temp/processing',
    'monitoring/metrics',
    'monitoring/alerts'
  ];
  
  directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
  
  // Create .gitkeep files to preserve empty directories
  directories.forEach(dir => {
    const gitkeepPath = path.join(process.cwd(), dir, '.gitkeep');
    if (!fs.existsSync(gitkeepPath)) {
      fs.writeFileSync(gitkeepPath, '');
    }
  });
  
  console.log('✅ Security directory structure created');
}

// 3. Set up file permissions (Unix-like systems only)
function setupFilePermissions() {
  if (process.platform === 'win32') {
    console.log('\n⚠️  Skipping file permissions setup on Windows');
    return;
  }
  
  console.log('\n🔐 Setting up file permissions...');
  
  try {
    const { execSync } = require('child_process');
    
    // Secure sensitive files
    const sensitiveFiles = [
      '.env',
      '.env.local',
      '.env.production'
    ];
    
    sensitiveFiles.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        execSync(`chmod 600 ${filePath}`);
        console.log(`✅ Secured permissions for ${file}`);
      }
    });
    
    // Secure directories
    const secureDirectories = [
      'logs',
      'backups'
    ];
    
    secureDirectories.forEach(dir => {
      const dirPath = path.join(process.cwd(), dir);
      if (fs.existsSync(dirPath)) {
        execSync(`chmod 700 ${dirPath}`);
        console.log(`✅ Secured permissions for ${dir}/`);
      }
    });
    
  } catch (error) {
    console.log('⚠️  Could not set file permissions:', error.message);
  }
}

// 4. Create comprehensive security configuration
function createSecurityConfig() {
  console.log('\n⚙️  Creating comprehensive security configuration...');
  
  const securityConfigPath = path.join(process.cwd(), 'security-config.json');
  
  const securityConfig = {
    version: '3.0.0',
    lastUpdated: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    features: {
      // Core Security
      rateLimiting: true,
      inputValidation: true,
      sqlInjectionProtection: true,
      xssProtection: true,
      csrfProtection: true,
      sessionSecurity: true,
      
      // File Security
      fileUploadSecurity: true,
      virusScanning: false,
      fileQuarantine: true,
      
      // Network Security
      botProtection: true,
      ipFiltering: true,
      ddosProtection: true,
      
      // Headers & Policies
      securityHeaders: true,
      contentSecurityPolicy: true,
      strictTransportSecurity: true,
      
      // Advanced Protection
      advancedThreatDetection: true,
      realTimeMonitoring: true,
      automaticBlacklisting: true,
      honeypotProtection: true,
      requestFingerprinting: true,
      behaviorAnalysis: true,
      
      // Database Security
      databaseSecurity: true,
      queryAuditing: true,
      encryptionAtRest: true,
      
      // Monitoring & Logging
      auditLogging: true,
      securityEventLogging: true,
      performanceMonitoring: true,
      alerting: true
    },
    monitoring: {
      enabled: true,
      alertThresholds: {
        failedLoginAttempts: 5,
        rateLimitViolations: 10,
        suspiciousActivity: 3,
        attackAttempts: 1,
        slowQueries: 5000,
        highTraffic: 1000,
        errorRate: 0.05,
        responseTime: 2000
      },
      retentionDays: 30,
      realTimeAlerts: true,
      emailAlerts: true,
      webhookAlerts: false
    },
    rateLimiting: {
      global: {
        windowMs: 900000, // 15 minutes
        maxRequests: 1000,
        blockDurationMs: 3600000 // 1 hour
      },
      auth: {
        windowMs: 300000, // 5 minutes
        maxRequests: 10,
        blockDurationMs: 1800000 // 30 minutes
      },
      admin: {
        windowMs: 300000, // 5 minutes
        maxRequests: 50,
        blockDurationMs: 3600000 // 1 hour
      },
      upload: {
        windowMs: 300000, // 5 minutes
        maxRequests: 20,
        blockDurationMs: 1800000 // 30 minutes
      },
      api: {
        windowMs: 60000, // 1 minute
        maxRequests: 100,
        blockDurationMs: 300000 // 5 minutes
      }
    },
    fileUpload: {
      maxSizeMB: 50,
      allowedTypes: [
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'text/csv'
      ],
      blockedExtensions: [
        '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
        '.php', '.asp', '.jsp', '.py', '.rb', '.pl', '.sh', '.ps1', '.msi'
      ],
      virusScanning: false,
      quarantineEnabled: true,
      scanTimeout: 30000
    },
    database: {
      queryTimeout: 30000,
      slowQueryThreshold: 5000,
      connectionPoolSize: 10,
      auditLogging: true,
      encryptSensitiveFields: true,
      backupEncryption: true,
      connectionRetries: 3
    },
    encryption: {
      algorithm: 'aes-256-gcm',
      keyRotationDays: 90,
      encryptLogs: false,
      encryptBackups: true
    },
    authentication: {
      passwordMinLength: 12,
      passwordComplexity: true,
      sessionTimeout: 86400000, // 24 hours
      inactivityTimeout: 7200000, // 2 hours
      maxSessions: 3,
      twoFactorAuth: false
    },
    maintenance: {
      logRotation: true,
      logRetentionDays: 30,
      dataCleanup: true,
      securityUpdates: true,
      performanceOptimization: true,
      backupEncryption: true,
      automaticUpdates: false
    },
    compliance: {
      gdprCompliant: true,
      dataRetentionDays: 365,
      rightToErasure: true,
      dataPortability: true,
      consentManagement: true
    }
  };
  
  fs.writeFileSync(securityConfigPath, JSON.stringify(securityConfig, null, 2));
  console.log('✅ Created comprehensive security configuration');
}

// 5. Create security checklist
function createSecurityChecklist() {
  console.log('\n📋 Creating security checklist...');
  
  const checklistPath = path.join(process.cwd(), 'SECURITY-CHECKLIST.md');
  
  const checklist = `# Security Checklist

## Pre-Deployment Security Checklist

### Environment Configuration
- [ ] Change default JWT secret
- [ ] Generate strong CSRF secret
- [ ] Configure database credentials securely
- [ ] Set up HTTPS certificates
- [ ] Configure environment variables for production

### Security Features
- [ ] Enable rate limiting
- [ ] Configure IP whitelisting for admin access (if needed)
- [ ] Set up file upload restrictions
- [ ] Enable security headers
- [ ] Configure Content Security Policy
- [ ] Enable audit logging

### Database Security
- [ ] Use strong database passwords
- [ ] Enable database SSL/TLS
- [ ] Configure database firewall rules
- [ ] Set up database backups
- [ ] Enable query logging

### Server Security
- [ ] Keep server OS updated
- [ ] Configure firewall rules
- [ ] Set up intrusion detection
- [ ] Enable fail2ban or similar
- [ ] Configure log monitoring

### Application Security
- [ ] Update all dependencies
- [ ] Run security audit (npm audit)
- [ ] Enable HTTPS redirect
- [ ] Configure secure cookies
- [ ] Set up error monitoring

### Monitoring & Alerting
- [ ] Set up security monitoring dashboard
- [ ] Configure alert notifications
- [ ] Set up log aggregation
- [ ] Enable uptime monitoring
- [ ] Configure backup monitoring

## Post-Deployment Security Tasks

### Regular Maintenance
- [ ] Review security logs weekly
- [ ] Update dependencies monthly
- [ ] Rotate secrets quarterly
- [ ] Review access logs
- [ ] Test backup restoration

### Security Monitoring
- [ ] Monitor failed login attempts
- [ ] Check for suspicious IP activity
- [ ] Review file upload logs
- [ ] Monitor API usage patterns
- [ ] Check for security alerts

### Incident Response
- [ ] Document incident response procedures
- [ ] Set up emergency contacts
- [ ] Prepare security incident templates
- [ ] Test incident response plan
- [ ] Review and update procedures

## Security Contacts

- **Security Team**: [Your security team email]
- **System Administrator**: [Admin email]
- **Emergency Contact**: [Emergency contact]

## Last Updated
${new Date().toISOString()}
`;

  fs.writeFileSync(checklistPath, checklist);
  console.log('✅ Created security checklist');
}

// 6. Validate current security setup
function validateSecurity() {
  console.log('\n🔍 Validating security setup...');
  
  const issues = [];
  
  // Check environment variables
  const requiredEnvVars = [
    'JWT_SECRET',
    'CSRF_SECRET',
    'DATABASE_URL',
    'NEXT_PUBLIC_APP_URL'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      issues.push(`Missing environment variable: ${envVar}`);
    }
  });
  
  // Check for default secrets
  if (process.env.JWT_SECRET === 'mathew_kavukattu_secret_key_mathew_kavukattu_secret_key') {
    issues.push('Using default JWT secret - please change it');
  }
  
  if (process.env.CSRF_SECRET === 'your_csrf_secret_key_here_change_in_production') {
    issues.push('Using default CSRF secret - please change it');
  }
  
  // Check file permissions
  const sensitiveFiles = ['.env', '.env.local', '.env.production'];
  sensitiveFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      try {
        const stats = fs.statSync(filePath);
        const mode = stats.mode & parseInt('777', 8);
        if (mode > parseInt('600', 8)) {
          issues.push(`File ${file} has overly permissive permissions`);
        }
      } catch (error) {
        // Ignore permission check errors on Windows
      }
    }
  });
  
  if (issues.length === 0) {
    console.log('✅ Security validation passed');
  } else {
    console.log('⚠️  Security issues found:');
    issues.forEach(issue => console.log(`   - ${issue}`));
  }
  
  return issues.length === 0;
}

// Main execution
async function main() {
  try {
    generateSecrets();
    createSecurityDirectories();
    setupFilePermissions();
    createSecurityConfig();
    createSecurityChecklist();
    
    const isValid = validateSecurity();
    
    console.log('\n🎉 Security setup completed!');
    
    if (!isValid) {
      console.log('\n⚠️  Please address the security issues listed above before deploying to production.');
      process.exit(1);
    }
    
    console.log('\n📖 Next steps:');
    console.log('1. Review the SECURITY-CHECKLIST.md file');
    console.log('2. Configure your production environment variables');
    console.log('3. Set up monitoring and alerting');
    console.log('4. Test your security configuration');
    console.log('5. Deploy to production');
    
  } catch (error) {
    console.error('❌ Security setup failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  generateSecrets,
  createSecurityDirectories,
  setupFilePermissions,
  createSecurityConfig,
  createSecurityChecklist,
  validateSecurity
};