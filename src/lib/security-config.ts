// Comprehensive security configuration for production deployment

export const SECURITY_CONFIG = {
  // Rate limiting configuration
  RATE_LIMITS: {
    // Global API rate limit
    GLOBAL: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // requests per window
      blockDurationMs: 30 * 60 * 1000 // 30 minutes block
    },
    
    // Authentication endpoints
    AUTH_LOGIN: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // attempts per window
      blockDurationMs: 60 * 60 * 1000 // 1 hour block
    },
    
    // File upload endpoints
    UPLOAD: {
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 20, // uploads per window
      blockDurationMs: 30 * 60 * 1000 // 30 minutes block
    },
    
    // Public API endpoints
    PUBLIC_API: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 100, // requests per window
      blockDurationMs: 15 * 60 * 1000 // 15 minutes block
    },
    
    // Admin API endpoints
    ADMIN_API: {
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 200, // requests per window
      blockDurationMs: 30 * 60 * 1000 // 30 minutes block
    }
  },

  // File upload security
  FILE_UPLOAD: {
    MAX_SIZE_MB: 50,
    ALLOWED_TYPES: [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ],
    BLOCKED_EXTENSIONS: [
      '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', 
      '.js', '.jar', '.php', '.asp', '.jsp', '.py', '.rb',
      '.sh', '.ps1', '.msi', '.deb', '.rpm'
    ],
    SCAN_FOR_MALWARE: true,
    QUARANTINE_SUSPICIOUS: true
  },

  // Input validation
  INPUT_VALIDATION: {
    MAX_STRING_LENGTH: 10000,
    MAX_TEXT_LENGTH: 50000,
    MAX_URL_LENGTH: 2048,
    MAX_EMAIL_LENGTH: 254,
    MAX_NAME_LENGTH: 120,
    SANITIZE_HTML: true,
    STRIP_DANGEROUS_TAGS: true,
    VALIDATE_URLS: true
  },

  // Password policy
  PASSWORD_POLICY: {
    MIN_LENGTH: 12,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
    BLOCK_COMMON_PASSWORDS: true,
    BLOCK_PERSONAL_INFO: true,
    MAX_CONSECUTIVE_CHARS: 2,
    HASH_ROUNDS: 14
  },

  // Session security
  SESSION: {
    MAX_AGE_MS: 24 * 60 * 60 * 1000, // 24 hours
    INACTIVITY_TIMEOUT_MS: 2 * 60 * 60 * 1000, // 2 hours
    SECURE_COOKIES: true,
    HTTP_ONLY: true,
    SAME_SITE: 'strict' as const,
    VALIDATE_IP: true,
    VALIDATE_USER_AGENT: true,
    ROTATE_ON_LOGIN: true
  },

  // CSRF protection
  CSRF: {
    ENABLED: true,
    TOKEN_LENGTH: 32,
    TOKEN_EXPIRY_MS: 60 * 60 * 1000, // 1 hour
    VALIDATE_ORIGIN: true,
    VALIDATE_REFERER: true
  },

  // Content Security Policy
  CSP: {
    ENABLED: true,
    REPORT_ONLY: false,
    DIRECTIVES: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'strict-dynamic'"],
      'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      'img-src': ["'self'", "data:", "https://res.cloudinary.com"],
      'font-src': ["'self'", "https://fonts.gstatic.com"],
      'connect-src': ["'self'", "https://api.emailjs.com", "https://api.cloudinary.com"],
      'media-src': ["'self'", "https://res.cloudinary.com"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'frame-src': ["'self'", "https://www.google.com", "https://maps.google.com"],
      'upgrade-insecure-requests': [],
      'block-all-mixed-content': []
    }
  },

  // Security headers
  SECURITY_HEADERS: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    'X-DNS-Prefetch-Control': 'off',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
  },

  // Database security
  DATABASE: {
    CONNECTION_TIMEOUT_MS: 30000,
    QUERY_TIMEOUT_MS: 60000,
    MAX_CONNECTIONS: 10,
    SANITIZE_INPUTS: true,
    LOG_QUERIES: true,
    LOG_SLOW_QUERIES: true,
    SLOW_QUERY_THRESHOLD_MS: 1000,
    ENABLE_QUERY_CACHE: true,
    VALIDATE_SCHEMA: true
  },

  // Logging and monitoring
  LOGGING: {
    LOG_LEVEL: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    LOG_REQUESTS: true,
    LOG_RESPONSES: false,
    LOG_ERRORS: true,
    LOG_SECURITY_EVENTS: true,
    RETENTION_DAYS: 30,
    MAX_LOG_SIZE_MB: 100
  },

  // IP filtering
  IP_FILTERING: {
    ENABLE_WHITELIST: false, // Set to true and configure ADMIN_WHITELIST for production
    ADMIN_WHITELIST: [], // Add admin IP addresses here
    ENABLE_BLACKLIST: true,
    BLACKLIST: [], // Add known malicious IPs here
    AUTO_BLOCK_SUSPICIOUS: true,
    BLOCK_DURATION_MS: 24 * 60 * 60 * 1000 // 24 hours
  },

  // Bot protection
  BOT_PROTECTION: {
    BLOCK_BOTS: true,
    ALLOW_LEGITIMATE_BOTS: true,
    LEGITIMATE_BOTS: [
      'googlebot',
      'bingbot', 
      'slurp',
      'duckduckbot',
      'facebookexternalhit',
      'twitterbot',
      'linkedinbot'
    ],
    CHALLENGE_SUSPICIOUS: true,
    HONEYPOT_FIELDS: ['email_confirm', 'website', 'url', 'phone_number']
  },

  // API security
  API_SECURITY: {
    REQUIRE_HTTPS: true,
    VALIDATE_CONTENT_TYPE: true,
    MAX_REQUEST_SIZE_MB: 10,
    TIMEOUT_MS: 30000,
    CORS_ENABLED: true,
    CORS_ORIGINS: [], // Configure allowed origins
    API_KEY_REQUIRED: false, // Set to true if using API keys
    JWT_EXPIRY: '24h'
  },

  // Error handling
  ERROR_HANDLING: {
    HIDE_STACK_TRACES: true,
    GENERIC_ERROR_MESSAGES: true,
    LOG_ERRORS: true,
    NOTIFY_ADMIN: false, // Set to true to enable admin notifications
    MAX_ERROR_RATE: 0.1 // 10% error rate threshold
  },

  // Backup and recovery
  BACKUP: {
    AUTO_BACKUP: false, // Enable for production
    BACKUP_INTERVAL_HOURS: 6,
    RETENTION_DAYS: 30,
    ENCRYPT_BACKUPS: true,
    VERIFY_BACKUPS: true
  },

  // Performance and DDoS protection
  PERFORMANCE: {
    ENABLE_COMPRESSION: true,
    CACHE_STATIC_ASSETS: true,
    CACHE_API_RESPONSES: false,
    MAX_CONCURRENT_REQUESTS: 1000,
    REQUEST_QUEUE_SIZE: 100,
    DDOS_PROTECTION: true,
    DDOS_THRESHOLD: 100 // requests per second
  }
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'production') {
  // Production-specific security settings
  SECURITY_CONFIG.SESSION.SECURE_COOKIES = true;
  SECURITY_CONFIG.CSP.REPORT_ONLY = false;
  SECURITY_CONFIG.ERROR_HANDLING.HIDE_STACK_TRACES = true;
  SECURITY_CONFIG.ERROR_HANDLING.GENERIC_ERROR_MESSAGES = true;
  SECURITY_CONFIG.LOGGING.LOG_LEVEL = 'error';
  SECURITY_CONFIG.API_SECURITY.REQUIRE_HTTPS = true;
}

if (process.env.NODE_ENV === 'development') {
  // Development-specific settings
  SECURITY_CONFIG.SESSION.SECURE_COOKIES = false;
  SECURITY_CONFIG.CSP.REPORT_ONLY = true;
  SECURITY_CONFIG.ERROR_HANDLING.HIDE_STACK_TRACES = false;
  SECURITY_CONFIG.LOGGING.LOG_LEVEL = 'debug';
  SECURITY_CONFIG.API_SECURITY.REQUIRE_HTTPS = false;
}

// Validation function to ensure configuration is valid
export function validateSecurityConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate rate limits
  Object.entries(SECURITY_CONFIG.RATE_LIMITS).forEach(([key, config]) => {
    if (config.max <= 0) {
      errors.push(`Invalid rate limit max for ${key}: must be greater than 0`);
    }
    if (config.windowMs <= 0) {
      errors.push(`Invalid rate limit window for ${key}: must be greater than 0`);
    }
  });

  // Validate file upload settings
  if (SECURITY_CONFIG.FILE_UPLOAD.MAX_SIZE_MB <= 0) {
    errors.push('Invalid file upload max size: must be greater than 0');
  }

  if (SECURITY_CONFIG.FILE_UPLOAD.ALLOWED_TYPES.length === 0) {
    errors.push('No allowed file types configured');
  }

  // Validate password policy
  if (SECURITY_CONFIG.PASSWORD_POLICY.MIN_LENGTH < 8) {
    errors.push('Password minimum length should be at least 8 characters');
  }

  if (SECURITY_CONFIG.PASSWORD_POLICY.HASH_ROUNDS < 10) {
    errors.push('Password hash rounds should be at least 10');
  }

  // Validate session settings
  if (SECURITY_CONFIG.SESSION.MAX_AGE_MS <= 0) {
    errors.push('Invalid session max age: must be greater than 0');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Get security configuration for specific environment
export function getSecurityConfig() {
  const validation = validateSecurityConfig();
  if (!validation.valid) {
    console.error('Security configuration validation failed:', validation.errors);
    throw new Error('Invalid security configuration');
  }
  
  return SECURITY_CONFIG;
}

// Export individual configurations for easy access
export const {
  RATE_LIMITS,
  FILE_UPLOAD,
  INPUT_VALIDATION,
  PASSWORD_POLICY,
  SESSION,
  CSRF,
  CSP,
  SECURITY_HEADERS,
  DATABASE,
  LOGGING,
  IP_FILTERING,
  BOT_PROTECTION,
  API_SECURITY,
  ERROR_HANDLING,
  BACKUP,
  PERFORMANCE
} = SECURITY_CONFIG;