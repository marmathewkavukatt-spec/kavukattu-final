/**
 * Performance Configuration for High Concurrency
 * Optimized for 300+ concurrent users
 */

module.exports = {
  // Database Connection Pool
  database: {
    connectionLimit: 20,        // Max connections (shared hosting limit)
    poolTimeout: 30000,         // 30s timeout for getting connection
    connectTimeout: 10000,      // 10s timeout for initial connection
    socketTimeout: 10000,       // 10s timeout for socket operations
    queueLimit: 0,              // Unlimited queue (will wait for available connection)
  },

  // API Response Caching
  cache: {
    enabled: true,
    defaultTTL: 60,             // 60 seconds default cache
    routes: {
      '/api/announcements': 300,      // 5 minutes
      '/api/slider': 300,             // 5 minutes
      '/api/gallery': 300,            // 5 minutes
      '/api/testimonies': 600,        // 10 minutes
      '/api/timings': 600,            // 10 minutes
      '/api/resources': 600,          // 10 minutes
      '/api/timeline': 600,           // 10 minutes
      '/api/favours-recieved': 600,   // 10 minutes
      '/api/archives': 300,           // 5 minutes
    }
  },

  // Rate Limiting (per IP)
  rateLimit: {
    enabled: true,
    public: {
      maxRequests: 100,         // 100 requests per minute per IP
      windowMs: 60000,          // 1 minute window
    },
    api: {
      maxRequests: 50,          // 50 API requests per minute per IP
      windowMs: 60000,          // 1 minute window
    },
    auth: {
      maxRequests: 5,           // 5 login attempts per minute per IP
      windowMs: 60000,          // 1 minute window
    }
  },

  // Response Compression
  compression: {
    enabled: true,
    threshold: 1024,            // Compress responses > 1KB
    level: 6,                   // Compression level (1-9, 6 is balanced)
  },

  // Static Asset Optimization
  static: {
    maxAge: 31536000,           // 1 year cache for static assets
    immutable: true,            // Assets with hashes are immutable
  },

  // Image Optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 31536000,  // 1 year
    quality: 80,                // 80% quality (good balance)
  },

  // Query Optimization
  queries: {
    defaultLimit: 20,           // Default pagination limit
    maxLimit: 100,              // Maximum pagination limit
    selectFields: true,         // Always use select to limit fields
    parallelQueries: true,      // Use Promise.all for parallel queries
  },

  // Memory Management
  memory: {
    maxCacheSize: 100,          // Max 100MB cache
    cleanupInterval: 300000,    // Cleanup every 5 minutes
    gcInterval: 600000,         // Force GC every 10 minutes (if available)
  },

  // Monitoring
  monitoring: {
    enabled: process.env.NODE_ENV === 'production',
    logSlowQueries: true,
    slowQueryThreshold: 1000,   // Log queries > 1s
    logErrors: true,
    logLevel: process.env.LOG_LEVEL || 'error',
  },

  // Security (lightweight for performance)
  security: {
    enableCSRF: false,          // Disable CSRF for public APIs
    enableCORS: true,           // Enable CORS
    enableHelmet: true,         // Enable security headers
    rateLimitAuth: true,        // Rate limit auth endpoints only
  },
};
