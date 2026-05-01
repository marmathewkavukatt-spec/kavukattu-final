/**
 * Safe error handling utilities
 * Prevents sensitive information from being exposed to users
 */

export interface SafeError {
  message: string;
  code?: string;
  timestamp: string;
}

/**
 * Convert any error to a safe, user-friendly error object
 */
export function toSafeError(error: unknown): SafeError {
  const timestamp = new Date().toISOString();

  // Handle Error objects
  if (error instanceof Error) {
    // Don't expose stack traces or sensitive details in production
    const message = process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'An unexpected error occurred. Please try again.';

    return {
      message,
      code: (error as any).code,
      timestamp,
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: process.env.NODE_ENV === 'development' 
        ? error 
        : 'An unexpected error occurred. Please try again.',
      timestamp,
    };
  }

  // Handle unknown errors
  return {
    message: 'An unexpected error occurred. Please try again.',
    timestamp,
  };
}

/**
 * Log error safely (only in development)
 */
export function logError(error: unknown, context?: string) {
  if (process.env.NODE_ENV === 'development') {
    console.error(context ? `[${context}]` : '[Error]', error);
  }

  // In production, you would send to error tracking service
  // Example: Sentry, LogRocket, DataDog, etc.
  // if (process.env.NODE_ENV === 'production') {
  //   sendToErrorTracking(error, context);
  // }
}

/**
 * Handle async errors with try-catch wrapper
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback?: T,
  context?: string
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    logError(error, context);
    return fallback;
  }
}

/**
 * Handle sync errors with try-catch wrapper
 */
export function safeSync<T>(
  fn: () => T,
  fallback?: T,
  context?: string
): T | undefined {
  try {
    return fn();
  } catch (error) {
    logError(error, context);
    return fallback;
  }
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('NetworkError') ||
      (error as any).code === 'ECONNREFUSED' ||
      (error as any).code === 'ETIMEDOUT'
    );
  }
  return false;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return 'Unable to connect. Please check your internet connection and try again.';
  }

  if (error instanceof Error) {
    // Map common errors to user-friendly messages
    if (error.message.includes('404')) {
      return 'The requested content could not be found.';
    }
    if (error.message.includes('403')) {
      return 'You do not have permission to access this content.';
    }
    if (error.message.includes('500')) {
      return 'A server error occurred. Please try again later.';
    }
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
