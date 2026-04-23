import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIP } from "./rateLimit";

// Production-grade security implementation
export class ProductionSecurity {
  private static instance: ProductionSecurity;
  private blacklistedIPs = new Set<string>();
  private rateLimitViolations = new Map<string, { count: number; lastViolation: number }>();
  private securityEvents: SecurityEvent[] = [];
  private csrfTokens = new Map<string, { token: string; expires: number }>();
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  // Cache for security checks to reduce overhead
  private securityCheckCache = new Map<string, { allowed: boolean; timestamp: number }>();
  private readonly CACHE_TTL = 5000; // 5 seconds cache

  constructor() {
    // Start automatic cleanup every 5 minutes
    this.startAutomaticCleanup();
  }

  static getInstance(): ProductionSecurity {
    if (!ProductionSecurity.instance) {
      ProductionSecurity.instance = new ProductionSecurity();
    }
    return ProductionSecurity.instance;
  }

  // Automatic cleanup to prevent memory leaks
  private startAutomaticCleanup() {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 5 * 60 * 1000);
  }

  private performCleanup() {
    const now = Date.now();
    
    // Clean expired CSRF tokens
    for (const [sessionId, token] of this.csrfTokens.entries()) {
      if (token.expires < now) {
        this.csrfTokens.delete(sessionId);
      }
    }
    
    // Clean old rate limit violations (older than 1 hour)
    const oneHourAgo = now - 60 * 60 * 1000;
    for (const [ip, record] of this.rateLimitViolations.entries()) {
      if (record.lastViolation < oneHourAgo) {
        this.rateLimitViolations.delete(ip);
      }
    }
    
    // Clean expired security check cache
    for (const [key, cache] of this.securityCheckCache.entries()) {
      if (now - cache.timestamp > this.CACHE_TTL) {
        this.securityCheckCache.delete(key);
      }
    }
    
    // Keep only last 500 security events (reduced from 1000)
    if (this.securityEvents.length > 500) {
      this.securityEvents = this.securityEvents.slice(-500);
    }
    
    console.log('[SECURITY] Cleanup completed:', {
      csrfTokens: this.csrfTokens.size,
      rateLimitViolations: this.rateLimitViolations.size,
      securityEvents: this.securityEvents.length,
      blacklistedIPs: this.blacklistedIPs.size,
      cacheEntries: this.securityCheckCache.size
    });
  }

  // Cleanup on shutdown
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  // Advanced SQL Injection Prevention
  sanitizeSQLInput(input: any): any {
    if (typeof input === 'string') {
      return input
        .replace(/['"`;\\]/g, '') // Remove dangerous SQL characters
        .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT|TRUNCATE|GRANT|REVOKE)\b)/gi, '')
        .replace(/--/g, '') // Remove SQL comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
        .replace(/\bOR\b\s+\d+\s*=\s*\d+/gi, '') // Remove OR 1=1 patterns
        .replace(/\bAND\b\s+\d+\s*=\s*\d+/gi, '') // Remove AND 1=1 patterns
        .replace(/\bUNION\b\s+SELECT/gi, '') // Remove UNION SELECT
        .replace(/\bINTO\b\s+OUTFILE/gi, '') // Remove INTO OUTFILE
        .replace(/\bLOAD_FILE\b/gi, '') // Remove LOAD_FILE
        .replace(/\bINTO\b\s+DUMPFILE/gi, '') // Remove INTO DUMPFILE
        .trim()
        .slice(0, 1000);
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeSQLInput(item));
    }
    
    if (input && typeof input === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[this.sanitizeSQLInput(key)] = this.sanitizeSQLInput(value);
      }
      return sanitized;
    }
    
    return input;
  }

  // Advanced XSS Prevention
  sanitizeXSS(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/&/g, '&amp;')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, '')
      .replace(/<meta\b[^>]*>/gi, '')
      .replace(/<link\b[^>]*>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .trim()
      .slice(0, 10000);
  }

  // CSRF Protection
  generateCSRFToken(sessionId: string): string {
    const timestamp = Date.now().toString();
    const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const data = `${sessionId}:${timestamp}:${randomBytes}`;
    
    // For Edge Runtime, we'll use a simpler approach without HMAC
    // In production, consider using a more robust signing method
    const token = btoa(`${data}:${this.simpleHash(data)}`);
    
    // Store token with expiration
    this.csrfTokens.set(sessionId, {
      token,
      expires: Date.now() + 3600000 // 1 hour
    });
    
    return token;
  }

  private simpleHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  validateCSRFToken(token: string, sessionId: string): boolean {
    try {
      const storedToken = this.csrfTokens.get(sessionId);
      if (!storedToken || storedToken.expires < Date.now()) {
        this.csrfTokens.delete(sessionId);
        return false;
      }

      const decoded = atob(token);
      const [receivedSessionId, timestamp, randomBytes, signature] = decoded.split(':');
      
      if (receivedSessionId !== sessionId) return false;
      
      // Token expires after 1 hour
      if (Date.now() - parseInt(timestamp) > 3600000) return false;
      
      const data = `${receivedSessionId}:${timestamp}:${randomBytes}`;
      const expectedSignature = this.simpleHash(data);
      
      return signature === expectedSignature;
    } catch {
      return false;
    }
  }

  // Advanced Bot Detection (simplified with caching)
  detectAdvancedBot(request: NextRequest): boolean {
    const ip = getClientIP(request);
    const cacheKey = `bot:${ip}`;
    
    // Check cache first
    const cached = this.securityCheckCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return !cached.allowed;
    }
    
    const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
    
    // Allow legitimate search engine bots
    const legitimateBots = [
      /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i,
      /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i,
      /whatsapp/i, /telegrambot/i, /applebot/i
    ];
    
    const isLegitimate = legitimateBots.some(pattern => pattern.test(userAgent));
    if (isLegitimate) {
      this.securityCheckCache.set(cacheKey, { allowed: true, timestamp: Date.now() });
      return false;
    }
    
    // Check for obvious bot patterns
    const botPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i,
      /curl/i, /wget/i, /python-requests/i, /go-http/i,
    ];
    
    const isBot = botPatterns.some(pattern => pattern.test(userAgent));
    this.securityCheckCache.set(cacheKey, { allowed: !isBot, timestamp: Date.now() });
    
    return isBot;
  }

  // Advanced Rate Limiting with IP Reputation (VERY RELAXED for production traffic)
  advancedRateLimit(request: NextRequest): {
    allowed: boolean;
    reason?: string;
    retryAfterSeconds?: number;
  } {
    const ip = getClientIP(request);
    const path = request.nextUrl.pathname;
    const method = request.method.toUpperCase();

    // Optional: allow trusted admin IPs to bypass rate limiting/blacklisting
    const whitelist = process.env.ADMIN_IP_WHITELIST?.split(",").map((value) => value.trim()).filter(Boolean) ?? [];
    if (whitelist.includes(ip)) {
      return { allowed: true };
    }
    
    // Check if IP is blacklisted
    if (this.blacklistedIPs.has(ip)) {
      return { allowed: false, reason: 'IP blacklisted' };
    }
    
    // VERY RELAXED limits for production traffic (100+ concurrent users)
    let bucket = "api";
    let maxRequests = 2000; // Very high default
    let windowMs = 60_000; // 1 minute

    if (path === "/api/auth/setup" && method === "POST") {
      bucket = "auth-setup";
      maxRequests = 5; // Still protect setup
      windowMs = 60 * 60 * 1000; // 1 hour
    } else if (path === "/api/auth/login" && method === "POST") {
      bucket = "auth-login";
      maxRequests = 100; // Allow many login attempts
      windowMs = 300_000; // 5 minutes
    } else if (path.startsWith("/api/auth")) {
      bucket = "auth";
      maxRequests = 500; // Very relaxed
      windowMs = 300_000; // 5 minutes
    } else if (path.startsWith("/api/admin")) {
      bucket = "admin-api";
      maxRequests = 1000; // Very high for admin operations
      windowMs = 60_000; // 1 minute
    } else if (path.startsWith("/admin")) {
      bucket = "admin-page";
      maxRequests = 1000; // Very high for admin pages
      windowMs = 60_000; // 1 minute
    } else if (path.startsWith("/api/upload")) {
      bucket = "upload";
      maxRequests = 200; // Many uploads allowed
      windowMs = 300_000; // 5 minutes
    } else if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      bucket = "api-write";
      maxRequests = 1000; // Very high for write operations
      windowMs = 60_000; // 1 minute
    }

    // IMPORTANT: Use a bucketed key so normal traffic can't lock out auth/admin endpoints.
    const key = `rl:${bucket}:${ip}`;
    const result = rateLimit(key, { windowMs, max: maxRequests });
    
    if (!result.allowed) {
      // Track violations for potential blacklisting
      const now = Date.now();
      const record = this.rateLimitViolations.get(ip) ?? { count: 0, lastViolation: now };
      record.count += 1;
      record.lastViolation = now;
      this.rateLimitViolations.set(ip, record);
      
      // Blacklist after 50 violations (very lenient - only for real attacks)
      if (record.count >= 50) {
        this.blacklistedIPs.add(ip);
        this.logSecurityEvent(request, 'IP_BLACKLISTED', { ip, violations: record.count });
      }
      
      const retryAfterSeconds = Math.max(1, Math.ceil(result.retryAfterMs / 1000));
      return { allowed: false, reason: 'Rate limit exceeded', retryAfterSeconds };
    }
    
    return { allowed: true };
  }

  // File Upload Security
  validateFileUpload(file: File): { valid: boolean; error?: string } {
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv'
    ];
    
    const maxSize = parseInt(process.env.MAX_UPLOAD_SIZE_MB || '50') * 1024 * 1024;
    const dangerousExtensions = [
      '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
      '.php', '.asp', '.jsp', '.py', '.rb', '.pl', '.sh', '.ps1', '.msi',
      '.deb', '.rpm', '.dmg', '.app', '.ipa', '.apk'
    ];
    
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: `File type ${file.type} not allowed` };
    }
    
    // Check file size
    if (file.size > maxSize) {
      return { valid: false, error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (max: ${maxSize / 1024 / 1024}MB)` };
    }
    
    // Check file extension
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (dangerousExtensions.includes(extension)) {
      return { valid: false, error: `Dangerous file extension: ${extension}` };
    }
    
    // Check filename for suspicious patterns
    if (this.detectSuspiciousPatterns(file.name)) {
      return { valid: false, error: 'Suspicious filename detected' };
    }
    
    return { valid: true };
  }

  // Suspicious Pattern Detection (optimized - reduced patterns)
  detectSuspiciousPatterns(input: string): boolean {
    // Only check for the most critical patterns to reduce CPU usage
    const criticalPatterns = [
      // SQL injection patterns (most common)
      /\b(union|select|insert|update|delete|drop)\b.*\b(from|into|set|where)\b/i,
      /\b(or|and)\s+\d+\s*=\s*\d+/i,
      
      // Path traversal
      /\.\.\//g,
      
      // Code injection
      /\b(eval|exec|system)\s*\(/i,
      
      // XSS (basic)
      /<script\b/i,
      /javascript:/i,
    ];
    
    return criticalPatterns.some(pattern => pattern.test(input));
  }

  // Request Validation
  validateRequest(request: NextRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check content length
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB
      errors.push('Request too large');
    }
    
    // Check content type for POST requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const contentType = request.headers.get('content-type');
      if (!contentType) {
        errors.push('Missing content-type header');
      } else {
        const allowedTypes = [
          'application/json',
          'application/x-www-form-urlencoded',
          'multipart/form-data',
          'text/plain'
        ];
        
        if (!allowedTypes.some(type => contentType.includes(type))) {
          errors.push(`Invalid content-type: ${contentType}`);
        }
      }
    }
    
    // Check origin for state-changing requests
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      const origin = request.headers.get('origin');
      const referer = request.headers.get('referer');
      
      if (origin || referer) {
        const allowedOrigins = [
          process.env.NEXT_PUBLIC_APP_URL,
          'http://localhost:3000',
          'https://localhost:3000'
        ].filter(Boolean);
        
        let isValidOrigin = false;
        
        if (origin && allowedOrigins.includes(origin)) {
          isValidOrigin = true;
        } else if (referer) {
          try {
            const refererOrigin = new URL(referer).origin;
            isValidOrigin = allowedOrigins.includes(refererOrigin);
          } catch {
            // Invalid referer URL
          }
        }
        
        if (!isValidOrigin) {
          errors.push('Invalid origin');
        }
      }
    }
    
    return { valid: errors.length === 0, errors };
  }

  // Security Headers
  getSecurityHeaders(request?: NextRequest): Record<string, string> {
    const hostname =
      request?.nextUrl?.hostname ??
      request?.headers.get("host")?.split(":")[0] ??
      "";

    const isLocalhost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname.endsWith(".localhost");

    const isPrivateNetworkHost = (() => {
      // Match common dev/test hostnames and RFC1918 IPv4 ranges.
      if (!hostname) return false;
      if (hostname.endsWith(".local")) return true;

      const ipv4 = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
      if (!ipv4) return false;
      const octets = ipv4.slice(1).map(Number);
      if (octets.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return false;

      const [a, b] = octets;
      if (a === 10) return true;
      if (a === 192 && b === 168) return true;
      if (a === 172 && b >= 16 && b <= 31) return true;
      return false;
    })();

    // Next sets NODE_ENV="production" for `next start`, even when you're running locally.
    // Keep security strict for real deployments, but don't break localhost usage.
    const isRelaxed =
      process.env.NODE_ENV !== "production" ||
      isLocalhost ||
      isPrivateNetworkHost ||
      process.env.SECURITY_RELAXED === "true";

    // COEP breaks many common third-party assets unless they opt-in with CORP/CORS.
    // Enable only when explicitly required (e.g. for SharedArrayBuffer use-cases).
    const enableCoep = !isRelaxed && process.env.ENABLE_COEP === "true";
    
    return {
      // Prevent clickjacking
      'X-Frame-Options': 'DENY',
      
      // Prevent MIME type sniffing
      'X-Content-Type-Options': 'nosniff',
      
      // XSS protection
      'X-XSS-Protection': '1; mode=block',
      
      // Referrer policy
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // Permissions policy
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
      
      // DNS prefetch control
      'X-DNS-Prefetch-Control': 'off',
      
      // Cross-origin policies (relaxed for localhost/dev)
      'Cross-Origin-Opener-Policy': isRelaxed ? 'unsafe-none' : 'same-origin',
      'Cross-Origin-Resource-Policy': isRelaxed ? 'cross-origin' : 'same-origin',
      ...(enableCoep ? { 'Cross-Origin-Embedder-Policy': 'require-corp' } : {}),
      
      // Content Security Policy
      'Content-Security-Policy': this.getCSP({ relaxed: isRelaxed }),
      
      // HSTS (only in production with HTTPS)
      ...(process.env.NODE_ENV === 'production' ? {
        'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
      } : {}),
      
      // Cache control for sensitive routes
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      
      // Remove server information
      'Server': '',
      'X-Powered-By': '',
    };
  }

  private getCSP(opts: { relaxed: boolean }): string {
    if (opts.relaxed) {
      // Relaxed CSP for localhost/dev (supports HMR + common inline scripts)
      return [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.emailjs.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' ws: wss: https://api.emailjs.com https://api.cloudinary.com https://*.cloudinary.com",
        "media-src 'self' https://res.cloudinary.com https://*.cloudinary.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "frame-src 'self' https://www.google.com https://maps.google.com https://www.youtube.com",
      ].join("; ");
    }

    // Production CSP: compatible with Next.js (no strict-dynamic/nonce, allows self scripts)
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.emailjs.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://api.emailjs.com https://api.cloudinary.com https://*.cloudinary.com",
      "media-src 'self' https://res.cloudinary.com https://*.cloudinary.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "frame-src 'self' https://www.google.com https://maps.google.com https://www.youtube.com",
      "upgrade-insecure-requests",
      "block-all-mixed-content"
    ].join("; ");
  }

  // Security Event Logging (only log security events, not normal traffic)
  logSecurityEvent(request: NextRequest, eventType: string, details?: any) {
    // Only log security-relevant events, not normal successful requests
    const shouldLog = ![
      'REQUEST_ALLOWED', // Don't log every successful request
    ].includes(eventType);
    
    if (!shouldLog) return;
    
    const event: SecurityEvent = {
      timestamp: new Date().toISOString(),
      ip: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      method: request.method,
      path: request.nextUrl.pathname,
      eventType,
      details
    };
    
    this.securityEvents.push(event);
    
    // Keep only last 1000 events
    if (this.securityEvents.length > 1000) {
      this.securityEvents.shift();
    }
    
    // Log critical events to console
    if (['IP_BLACKLISTED', 'ATTACK_DETECTED', 'BREACH_ATTEMPT', 'BOT_BLOCKED', 'RATE_LIMIT_EXCEEDED', 'SUSPICIOUS_URL', 'CSRF_INVALID_ORIGIN'].includes(eventType)) {
      console.warn(`[SECURITY] ${eventType}:`, {
        ip: event.ip,
        path: event.path,
        timestamp: event.timestamp
      });
    }
  }

  // Get security metrics
  getSecurityMetrics() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const recentEvents = this.securityEvents.filter(event => 
      now - new Date(event.timestamp).getTime() < oneHour
    );

    return {
      totalEvents: recentEvents.length,
      blockedRequests: recentEvents.filter(e => e.eventType.includes('BLOCKED')).length,
      attackAttempts: recentEvents.filter(e => e.eventType.includes('ATTACK')).length,
      uniqueIPs: new Set(recentEvents.map(e => e.ip)).size,
      blacklistedIPs: this.blacklistedIPs.size,
      suspiciousIPs: this.rateLimitViolations.size,
      topAttackTypes: this.getTopAttackTypes(recentEvents),
      topAttackerIPs: this.getTopAttackerIPs(recentEvents)
    };
  }

  private getTopAttackTypes(events: SecurityEvent[]) {
    const attackTypes = events.reduce((acc, event) => {
      if (event.eventType.includes('ATTACK') || event.eventType.includes('BLOCKED')) {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(attackTypes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  }

  private getTopAttackerIPs(events: SecurityEvent[]) {
    const attackerIPs = events.reduce((acc, event) => {
      if (event.eventType.includes('ATTACK') || event.eventType.includes('BLOCKED')) {
        acc[event.ip] = (acc[event.ip] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(attackerIPs)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));
  }

  // Manual IP management
  blacklistIP(ip: string, reason: string) {
    this.blacklistedIPs.add(ip);
    console.log(`[SECURITY] IP ${ip} blacklisted: ${reason}`);
  }

  unblacklistIP(ip: string) {
    this.blacklistedIPs.delete(ip);
    this.rateLimitViolations.delete(ip);
    console.log(`[SECURITY] IP ${ip} removed from blacklist`);
  }

  getBlacklistedIPs(): string[] {
    return Array.from(this.blacklistedIPs);
  }

  getSecurityEvents(limit: number = 100): SecurityEvent[] {
    return this.securityEvents.slice(-limit);
  }
}

interface SecurityEvent {
  timestamp: string;
  ip: string;
  userAgent: string;
  method: string;
  path: string;
  eventType: string;
  details?: any;
}

// Export singleton instance
export const productionSecurity = ProductionSecurity.getInstance();
