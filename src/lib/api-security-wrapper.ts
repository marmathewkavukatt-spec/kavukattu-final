import { NextRequest, NextResponse } from "next/server";
import { productionSecurity } from "./security-production";
import { validator } from "./input-validation";

// Comprehensive API security wrapper
export function withApiSecurity(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: ApiSecurityOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    
    try {
      // 1. Request size validation
      const contentLength = request.headers.get('content-length');
      const maxSize = options.maxRequestSize || 10 * 1024 * 1024; // 10MB default
      
      if (contentLength && parseInt(contentLength) > maxSize) {
        productionSecurity.logSecurityEvent(request, 'REQUEST_TOO_LARGE', { 
          size: contentLength,
          maxSize 
        });
        return createSecurityResponse('Request too large', 413);
      }

      // 2. Content type validation for POST/PUT requests
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const contentType = request.headers.get('content-type');
        const allowedTypes = options.allowedContentTypes || [
          'application/json',
          'application/x-www-form-urlencoded',
          'multipart/form-data'
        ];
        
        if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
          productionSecurity.logSecurityEvent(request, 'INVALID_CONTENT_TYPE', { contentType });
          return createSecurityResponse('Invalid content type', 400);
        }
      }

      // 3. CSRF validation for state-changing operations
      if (options.requireCSRF && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
        const csrfToken = request.headers.get('x-csrf-token');
        const sessionId = extractSessionId(request);
        
        if (!csrfToken || !sessionId || !productionSecurity.validateCSRFToken(csrfToken, sessionId)) {
          productionSecurity.logSecurityEvent(request, 'CSRF_VALIDATION_FAILED', {});
          return createSecurityResponse('CSRF validation failed', 403);
        }
      }

      // 4. Input validation and sanitization
      let sanitizedRequest = request;
      if (options.validateInput && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          sanitizedRequest = await sanitizeRequestBody(request, options.inputSchema);
        } catch (error) {
          productionSecurity.logSecurityEvent(request, 'INPUT_VALIDATION_FAILED', { 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
          return createSecurityResponse('Invalid input data', 400);
        }
      }

      // 5. Rate limiting (endpoint-specific)
      if (options.rateLimit) {
        const ip = getClientIP(request);
        const rateLimitKey = `${ip}:${request.nextUrl.pathname}`;
        
        const result = productionSecurity.advancedRateLimit(request);
        if (!result.allowed) {
          productionSecurity.logSecurityEvent(request, 'ENDPOINT_RATE_LIMIT', { 
            endpoint: request.nextUrl.pathname 
          });
          const response = createSecurityResponse('Rate limit exceeded', 429);
          if (result.retryAfterSeconds) {
            response.headers.set("Retry-After", result.retryAfterSeconds.toString());
          }
          return response;
        }
      }

      // 6. Authentication check
      if (options.requireAuth) {
        const authResult = await validateAuthentication(request);
        if (!authResult.valid) {
          productionSecurity.logSecurityEvent(request, 'AUTH_FAILED', { 
            reason: authResult.reason 
          });
          return createSecurityResponse('Authentication required', 401);
        }
        
        // Add user info to request for handler
        (sanitizedRequest as any).user = authResult.user;
      }

      // 7. Authorization check
      if (options.requiredRole) {
        const user = (sanitizedRequest as any).user;
        if (!user || !hasRequiredRole(user, options.requiredRole)) {
          productionSecurity.logSecurityEvent(request, 'AUTHORIZATION_FAILED', { 
            requiredRole: options.requiredRole,
            userRole: user?.role 
          });
          return createSecurityResponse('Insufficient permissions', 403);
        }
      }

      // 8. Execute the actual handler
      const response = await handler(sanitizedRequest);

      // 9. Apply security headers to response
      const securityHeaders = productionSecurity.getSecurityHeaders();
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      // 10. Log successful request
      const duration = Date.now() - startTime;
      productionSecurity.logSecurityEvent(request, 'API_SUCCESS', { 
        endpoint: request.nextUrl.pathname,
        method: request.method,
        duration,
        status: response.status
      });

      return response;

    } catch (error) {
      // Log API error
      productionSecurity.logSecurityEvent(request, 'API_ERROR', { 
        endpoint: request.nextUrl.pathname,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      });

      console.error('API Security Error:', error);
      return createSecurityResponse('Internal server error', 500);
    }
  };
}

// Secure JSON body parser
export async function parseSecureJSON(request: NextRequest, maxSizeKB: number = 100): Promise<any> {
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > maxSizeKB * 1024) {
    throw new Error('Request body too large');
  }

  const text = await request.text();
  
  // Check for suspicious patterns
  if (productionSecurity.detectSuspiciousPatterns(text)) {
    throw new Error('Suspicious content detected in request body');
  }

  try {
    const parsed = JSON.parse(text);
    return productionSecurity.sanitizeSQLInput(parsed);
  } catch {
    throw new Error('Invalid JSON format');
  }
}

// Secure form data parser
export async function parseSecureFormData(request: NextRequest): Promise<FormData> {
  const contentLength = request.headers.get('content-length');
  const maxSize = 50 * 1024 * 1024; // 50MB
  
  if (contentLength && parseInt(contentLength) > maxSize) {
    throw new Error('Form data too large');
  }

  const formData = await request.formData();
  
  // Sanitize form data
  const sanitizedFormData = new FormData();
  
  for (const [key, value] of Array.from(formData.entries())) {
    const sanitizedKey = productionSecurity.sanitizeSQLInput(key);
    
    if (typeof value === 'string') {
      // Check for suspicious patterns
      if (productionSecurity.detectSuspiciousPatterns(value)) {
        throw new Error(`Suspicious content detected in field: ${key}`);
      }
      
      const sanitizedValue = productionSecurity.sanitizeXSS(value);
      sanitizedFormData.append(sanitizedKey, sanitizedValue);
    } else {
      // File upload
      const fileValidation = productionSecurity.validateFileUpload(value as File);
      if (!fileValidation.valid) {
        throw new Error(fileValidation.error || 'Invalid file');
      }
      
      sanitizedFormData.append(sanitizedKey, value);
    }
  }
  
  return sanitizedFormData;
}

// Database query security wrapper
export function secureDbQuery<T extends (...args: any[]) => any>(
  queryFunction: T,
  options: DbSecurityOptions = {}
): T {
  return ((...args: any[]) => {
    // Sanitize all query parameters
    const sanitizedArgs = args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        return productionSecurity.sanitizeSQLInput(arg);
      }
      return arg;
    });

    // Add query timeout
    const timeout = options.timeout || 30000; // 30 seconds default
    
    return Promise.race([
      queryFunction(...sanitizedArgs),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), timeout)
      )
    ]);
  }) as T;
}

// File upload security
export async function validateAndProcessUpload(
  file: File,
  options: FileUploadOptions = {}
): Promise<{ valid: boolean; processedFile?: File; error?: string }> {
  
  // Basic file validation
  const validation = productionSecurity.validateFileUpload(file);
  if (!validation.valid) {
    return { valid: false, error: validation.error };
  }

  // Additional custom validation
  if (options.customValidator) {
    const customResult = await options.customValidator(file);
    if (!customResult.valid) {
      return { valid: false, error: customResult.error };
    }
  }

  // Virus scanning (if enabled)
  if (options.enableVirusScanning) {
    const scanResult = await scanFileForViruses(file);
    if (!scanResult.clean) {
      productionSecurity.logSecurityEvent(
        {} as NextRequest, // Mock request for logging
        'VIRUS_DETECTED',
        { filename: file.name, threat: scanResult.threat }
      );
      return { valid: false, error: 'File contains malicious content' };
    }
  }

  return { valid: true, processedFile: file };
}

// Helper functions
function createSecurityResponse(message: string, status: number): NextResponse {
  const response = NextResponse.json({ error: message }, { status });
  
  // Apply security headers
  const securityHeaders = productionSecurity.getSecurityHeaders();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

function getClientIP(request: NextRequest): string {
  const headers = [
    'cf-connecting-ip',
    'x-real-ip',
    'x-forwarded-for',
    'x-client-ip'
  ];
  
  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      return value.split(',')[0].trim();
    }
  }
  
  return 'unknown';
}

function extractSessionId(request: NextRequest): string | null {
  // Extract session ID from cookie or header
  const sessionCookie = request.cookies.get('session')?.value;
  const sessionHeader = request.headers.get('x-session-id');
  
  return sessionCookie || sessionHeader || null;
}

async function sanitizeRequestBody(request: NextRequest, schema?: Record<string, string>): Promise<NextRequest> {
  const contentType = request.headers.get('content-type');
  
  if (contentType?.includes('application/json')) {
    const body = await parseSecureJSON(request);
    
    if (schema) {
      const validation = validator.validateObject(body, schema);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${Object.values(validation.errors).flat().join(', ')}`);
      }
      
      // Create new request with sanitized body
      return new NextRequest(request.url, {
        method: request.method,
        headers: request.headers,
        body: JSON.stringify(validation.sanitizedData)
      });
    }
    
    return request;
  }
  
  if (contentType?.includes('multipart/form-data')) {
    await parseSecureFormData(request); // Validates but doesn't modify original request
    return request;
  }
  
  return request;
}

async function validateAuthentication(request: NextRequest): Promise<{
  valid: boolean;
  user?: any;
  reason?: string;
}> {
  try {
    // Extract token from cookie or header
    const token = request.cookies.get('auth-token')?.value || 
                 request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return { valid: false, reason: 'No authentication token' };
    }

    // Validate token (implement your JWT validation logic here)
    // This is a placeholder - implement actual token validation
    const user = await validateJWTToken(token);
    
    if (!user) {
      return { valid: false, reason: 'Invalid token' };
    }

    return { valid: true, user };
  } catch (error) {
    return { valid: false, reason: 'Authentication error' };
  }
}

function hasRequiredRole(user: any, requiredRole: string): boolean {
  // Implement role-based access control logic
  return user.role === requiredRole || user.role === 'admin';
}

async function validateJWTToken(token: string): Promise<any> {
  // Implement JWT token validation
  // This is a placeholder - implement actual JWT validation
  try {
    // Your JWT validation logic here
    return { id: 'user-id', role: 'user' };
  } catch {
    return null;
  }
}

async function scanFileForViruses(file: File): Promise<{ clean: boolean; threat?: string }> {
  // Implement virus scanning logic
  // This is a placeholder - integrate with actual antivirus service
  
  // Basic pattern matching for known malicious patterns
  const buffer = await file.arrayBuffer();
  const content = new TextDecoder().decode(buffer);
  
  const maliciousPatterns = [
    /eval\s*\(/gi,
    /exec\s*\(/gi,
    /system\s*\(/gi,
    /<script/gi,
    /javascript:/gi
  ];
  
  for (const pattern of maliciousPatterns) {
    if (pattern.test(content)) {
      return { clean: false, threat: 'Suspicious code pattern detected' };
    }
  }
  
  return { clean: true };
}

// Type definitions
interface ApiSecurityOptions {
  maxRequestSize?: number;
  allowedContentTypes?: string[];
  requireCSRF?: boolean;
  validateInput?: boolean;
  inputSchema?: Record<string, string>;
  rateLimit?: boolean;
  requireAuth?: boolean;
  requiredRole?: string;
}

interface DbSecurityOptions {
  timeout?: number;
}

interface FileUploadOptions {
  customValidator?: (file: File) => Promise<{ valid: boolean; error?: string }>;
  enableVirusScanning?: boolean;
}

// Export commonly used security wrappers
export const secureApiRoute = withApiSecurity;
export const secureDbCall = secureDbQuery;
