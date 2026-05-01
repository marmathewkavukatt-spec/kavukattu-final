'use client';

import { useState, useEffect, useCallback } from 'react';
import { logError, toSafeError, type SafeError } from '@/lib/error-handler';

interface UseSafeAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: SafeError | null;
}

interface UseSafeAsyncOptions {
  onError?: (error: SafeError) => void;
  retryCount?: number;
  retryDelay?: number;
}

/**
 * Hook for safe async operations with error handling
 */
export function useSafeAsync<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList = [],
  options: UseSafeAsyncOptions = {}
) {
  const [state, setState] = useState<UseSafeAsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const { onError, retryCount = 0, retryDelay = 1000 } = options;

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    let attempts = 0;
    const maxAttempts = retryCount + 1;

    while (attempts < maxAttempts) {
      try {
        const result = await asyncFn();
        setState({ data: result, loading: false, error: null });
        return;
      } catch (error) {
        attempts++;
        
        if (attempts >= maxAttempts) {
          const safeError = toSafeError(error);
          logError(error, 'useSafeAsync');
          setState({ data: null, loading: false, error: safeError });
          
          if (onError) {
            onError(safeError);
          }
        } else {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
        }
      }
    }
  }, [asyncFn, retryCount, retryDelay, onError]);

  useEffect(() => {
    execute();
  }, deps);

  const retry = useCallback(() => {
    execute();
  }, [execute]);

  return {
    ...state,
    retry,
  };
}

/**
 * Hook for manual async operations (doesn't auto-execute)
 */
export function useSafeAsyncCallback<T, Args extends any[]>(
  asyncFn: (...args: Args) => Promise<T>,
  options: UseSafeAsyncOptions = {}
) {
  const [state, setState] = useState<UseSafeAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { onError } = options;

  const execute = useCallback(
    async (...args: Args) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await asyncFn(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (error) {
        const safeError = toSafeError(error);
        logError(error, 'useSafeAsyncCallback');
        setState({ data: null, loading: false, error: safeError });
        
        if (onError) {
          onError(safeError);
        }
        
        throw error;
      }
    },
    [asyncFn, onError]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
