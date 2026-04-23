import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Enhanced security utilities for production deployment

// SQL Injection Prevention
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Remove SQL injection patterns
  return input
    .replace(/['"`;\\]/g, '') // Remove dangerous SQL characters
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi, '') // Remove SQL keywords
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .trim()
    .slice(0, 1000); // Limit length
}

// XSS Prevention
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/&/g, '&amp;')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim()
    .slice(0, 10000);
}

// CSRF Token Generation and Validation
const CSRF_SECRET = process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex');

export function generateCSRFToken(sessionId: string): string {
  const timestamp = Date.now().toString();
  const data = `${sessionId}:${timestamp}`;
  const signature = crypto.createHmac('sha256', CSRF_SECRET).update(data).digest('hex');
  return Buffer.from(`${data}:${signature}`).toString('base64');
}

export function validateCSRFToken(token: string, sessionId: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [receivedSessionId, timestamp, signature] = decoded.split(':');
    
    if (receivedSessionId !== sessionId) return false;
    
    // Token expires after 1 hour
    if (Date.now() - parseInt(timestamp) > 3600000) return false;
    
    const data = `${receivedSessionId}:${timestamp}`;
    const expectedSignature = crypto.createHmac('sha256', CSRF_SECRET).update(data).digest('hex');
    
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}

// Request Size Limiting
export function validateRequestSize(request: NextRequest, maxSizeBytes: number = 10 * 1024 * 1024): boolean {
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > maxSizeBytes) {
    return false;
  }
  return true;
}

// IP Whitelisting for Admin Routes
const ADMIN_IP_WHITELIST = process.env.ADMIN_IP_WHITELIST?.split(',').map(ip => ip.trim()) || [];

export function isAdminIPAllowed(ip: string): boolean {
  if (ADMIN_IP_WHITELIST.length === 0) return true; // No whitelist configured
  return ADMIN_IP_WHITELIST.includes(ip) || ADMIN_IP_WHITELIST.includes('*');
}

// Honeypot Field Detection
export function detectHoneypot(formData: FormData | Record<string, any>): boolean {
  const honeypotFields = ['email_confirm', 'website', 'url', 'phone_number'];
  
  for (const field of honeypotFields) {
    if (formData instanceof FormData) {
      if (formData.get(field)) return true;
    } else {
      if (formData[field]) return true;
    }
  }
  return false;
}

// Suspicious Pattern Detection
export function detectSuspiciousPatterns(input: string): boolean {
  const suspiciousPatterns = [
    /\b(eval|exec|system|shell_exec|passthru)\s*\(/i,
    /\b(document\.cookie|localStorage|sessionStorage)\b/i,
    /\b(alert|confirm|prompt)\s*\(/i,
    /<iframe|<object|<embed|<applet/i,
    /javascript:|data:|vbscript:/i,
    /\b(union|select|insert|update|delete|drop|create|alter)\b.*\b(from|into|set|where)\b/i,
    /\.\.\//g, // Path traversal
    /\0/g, // Null bytes
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(input));
}

// File Upload Security
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];
  
  const maxSize = 50 * 1024 * 1024; // 50MB
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar', '.php', '.asp', '.jsp'];
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large' };
  }
  
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (dangerousExtensions.includes(extension)) {
    return { valid: false, error: 'Dangerous file extension' };
  }
  
  return { valid: true };
}

// Request Fingerprinting for Bot Detection
export function generateRequestFingerprint(request: NextRequest): string {
  const userAgent = request.headers.get('user-agent') || '';
  const acceptLanguage = request.headers.get('accept-language') || '';
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  const ip = getClientIP(request);
  
  const fingerprint = crypto
    .createHash('sha256')
    .update(`${userAgent}:${acceptLanguage}:${acceptEncoding}:${ip}`)
    .digest('hex');
    
  return fingerprint;
}

// Bot Detection
export function detectBot(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /curl/i, /wget/i, /python/i, /java/i,
    /postman/i, /insomnia/i, /httpie/i
  ];
  
  // Allow legitimate bots but block malicious ones
  const legitimateBots = [
    /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i,
    /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i
  ];
  
  const isBot = botPatterns.some(pattern => pattern.test(userAgent));
  const isLegitimate = legitimateBots.some(pattern => pattern.test(userAgent));
  
  return isBot && !isLegitimate;
}

// Enhanced Rate Limiting with Progressive Penalties
interface EnhancedRateLimit {
  requests: number[];
  violations: number;
  lastViolation?: number;
}

const enhancedRateLimitStore = new Map<string, EnhancedRateLimit>();

export function enhancedRateLimit(ip: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const key = ip;
  
  let record = enhancedRateLimitStore.get(key) || { requests: [], violations: 0 };
  
  // Clean old requests
  record.requests = record.requests.filter(time => now - time < windowMs);
  
  // Check if rate limit exceeded
  if (record.requests.length >= maxRequests) {
    record.violations++;
    record.lastViolation = now;
    
    // Progressive penalties: longer blocks for repeat offenders
    const penaltyMultiplier = Math.min(record.violations, 10);
    const blockDuration = windowMs * penaltyMultiplier;
    
    if (record.lastViolation && now - record.lastViolation < blockDuration) {
      enhancedRateLimitStore.set(key, record);
      return false;
    }
  }
  
  record.requests.push(now);
  enhancedRateLimitStore.set(key, record);
  return true;
}

// Get Client IP with enhanced detection
function getClientIP(request: NextRequest): string {
  // Check various headers in order of preference
  const headers = [
    'cf-connecting-ip', // Cloudflare
    'x-real-ip', // Nginx
    'x-forwarded-for', // Standard proxy header
    'x-client-ip', // Apache
    'x-cluster-client-ip', // Cluster
    'forwarded-for',
    'forwarded'
  ];
  
  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // Handle comma-separated IPs (take the first one)
      const ip = value.split(',')[0].trim();
      if (isValidIP(ip)) return ip;
    }
  }
  
  return 'unknown';
}

function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

// Security Headers Enhancement
export function getEnhancedSecurityHeaders(): Record<string, string> {
  return {
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Enable XSS protection
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions policy
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    
    // Prevent DNS prefetching
    'X-DNS-Prefetch-Control': 'off',
    
    // Cross-origin policies
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    
    // Cache control for sensitive pages
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    
    // Remove server information
    'Server': '',
    'X-Powered-By': '',
  };
}

// Content Security Policy for production
export function getProductionCSP(): string {
  const nonce = crypto.randomBytes(16).toString('base64');
  
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https://res.cloudinary.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.emailjs.com https://api.cloudinary.com",
    "media-src 'self' https://res.cloudinary.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'self' https://www.google.com https://maps.google.com",
    "upgrade-insecure-requests",
    "block-all-mixed-content"
  ].join('; ');
}

// Database Query Sanitization
export function sanitizeDbQuery(query: any): any {
  if (typeof query === 'string') {
    return sanitizeInput(query);
  }
  
  if (Array.isArray(query)) {
    return query.map(sanitizeDbQuery);
  }
  
  if (query && typeof query === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(query)) {
      sanitized[sanitizeInput(key)] = sanitizeDbQuery(value);
    }
    return sanitized;
  }
  
  return query;
}

// Audit Logging
interface AuditLog {
  timestamp: number;
  ip: string;
  userAgent: string;
  action: string;
  resource: string;
  success: boolean;
  details?: any;
}

const auditLogs: AuditLog[] = [];

export function logSecurityEvent(
  request: NextRequest,
  action: string,
  resource: string,
  success: boolean,
  details?: any
) {
  const log: AuditLog = {
    timestamp: Date.now(),
    ip: getClientIP(request),
    userAgent: request.headers.get('user-agent') || 'unknown',
    action,
    resource,
    success,
    details
  };
  
  auditLogs.push(log);
  
  // Keep only last 1000 logs in memory
  if (auditLogs.length > 1000) {
    auditLogs.shift();
  }
  
  // Log to console for monitoring
  console.log(`[SECURITY] ${success ? 'SUCCESS' : 'FAILURE'} - ${action} on ${resource} from ${log.ip}`);
}

export function getAuditLogs(limit: number = 100): AuditLog[] {
  return auditLogs.slice(-limit);
}