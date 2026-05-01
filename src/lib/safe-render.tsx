/**
 * Safe rendering utilities to prevent common React errors
 */

import { ReactNode } from 'react';

/**
 * Safely render array items with proper key handling
 */
export function safeMap<T>(
  items: T[] | null | undefined,
  renderFn: (item: T, index: number) => ReactNode,
  emptyFallback?: ReactNode
): ReactNode {
  if (!Array.isArray(items) || items.length === 0) {
    return emptyFallback || null;
  }

  try {
    return items.map((item, index) => renderFn(item, index));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in safeMap:', error);
    }
    return emptyFallback || null;
  }
}

/**
 * Safely access nested object properties
 */
export function safeGet<T>(
  obj: any,
  path: string,
  defaultValue?: T
): T | undefined {
  try {
    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
      if (result === null || result === undefined) {
        return defaultValue;
      }
      result = result[key];
    }

    return result !== undefined ? result : defaultValue;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in safeGet:', error);
    }
    return defaultValue;
  }
}

/**
 * Safely render conditional content
 */
export function safeRender(
  condition: boolean | null | undefined,
  content: ReactNode,
  fallback?: ReactNode
): ReactNode {
  try {
    return condition ? content : (fallback || null);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in safeRender:', error);
    }
    return fallback || null;
  }
}

/**
 * Safely parse JSON
 */
export function safeJsonParse<T>(
  json: string,
  defaultValue?: T
): T | undefined {
  try {
    return JSON.parse(json);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error parsing JSON:', error);
    }
    return defaultValue;
  }
}

/**
 * Safely stringify JSON
 */
export function safeJsonStringify(
  obj: any,
  defaultValue: string = '{}'
): string {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error stringifying JSON:', error);
    }
    return defaultValue;
  }
}

/**
 * Safely access localStorage
 */
export function safeLocalStorage() {
  const isAvailable = typeof window !== 'undefined' && window.localStorage;

  return {
    getItem: (key: string, defaultValue?: string): string | null => {
      if (!isAvailable) return defaultValue || null;
      try {
        return localStorage.getItem(key) || defaultValue || null;
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error reading from localStorage:', error);
        }
        return defaultValue || null;
      }
    },

    setItem: (key: string, value: string): boolean => {
      if (!isAvailable) return false;
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error writing to localStorage:', error);
        }
        return false;
      }
    },

    removeItem: (key: string): boolean => {
      if (!isAvailable) return false;
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error removing from localStorage:', error);
        }
        return false;
      }
    },

    clear: (): boolean => {
      if (!isAvailable) return false;
      try {
        localStorage.clear();
        return true;
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error clearing localStorage:', error);
        }
        return false;
      }
    },
  };
}

/**
 * Safely access sessionStorage
 */
export function safeSessionStorage() {
  const isAvailable = typeof window !== 'undefined' && window.sessionStorage;

  return {
    getItem: (key: string, defaultValue?: string): string | null => {
      if (!isAvailable) return defaultValue || null;
      try {
        return sessionStorage.getItem(key) || defaultValue || null;
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error reading from sessionStorage:', error);
        }
        return defaultValue || null;
      }
    },

    setItem: (key: string, value: string): boolean => {
      if (!isAvailable) return false;
      try {
        sessionStorage.setItem(key, value);
        return true;
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error writing to sessionStorage:', error);
        }
        return false;
      }
    },

    removeItem: (key: string): boolean => {
      if (!isAvailable) return false;
      try {
        sessionStorage.removeItem(key);
        return true;
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error removing from sessionStorage:', error);
        }
        return false;
      }
    },

    clear: (): boolean => {
      if (!isAvailable) return false;
      try {
        sessionStorage.clear();
        return true;
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error clearing sessionStorage:', error);
        }
        return false;
      }
    },
  };
}

/**
 * Safely call a function
 */
export function safeCall<T, Args extends any[]>(
  fn: (...args: Args) => T,
  args: Args,
  defaultValue?: T
): T | undefined {
  try {
    return fn(...args);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in safeCall:', error);
    }
    return defaultValue;
  }
}

/**
 * Check if value is valid (not null, undefined, or empty)
 */
export function isValid(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  if (typeof value === 'object' && Object.keys(value).length === 0) return false;
  return true;
}

/**
 * Safely format date
 */
export function safeFormatDate(
  date: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions,
  locale: string = 'en-US'
): string {
  try {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toLocaleDateString(locale, options);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error formatting date:', error);
    }
    return '';
  }
}
