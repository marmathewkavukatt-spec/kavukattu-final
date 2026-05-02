'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Application error:', error);

    // Check if it's a chunk loading error
    const isChunkError = 
      error.message.includes('Loading chunk') ||
      error.message.includes('ChunkLoadError') ||
      error.message.includes('Failed to fetch dynamically imported module');

    if (isChunkError) {
      // Automatically reload the page once to get fresh chunks
      if (!sessionStorage.getItem('chunk-error-reloaded')) {
        sessionStorage.setItem('chunk-error-reloaded', 'true');
        window.location.reload();
      }
    }
  }, [error]);

  const handleReset = () => {
    // Clear the reload flag
    sessionStorage.removeItem('chunk-error-reloaded');
    reset();
  };

  const handleReload = () => {
    sessionStorage.removeItem('chunk-error-reloaded');
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h1>
        
        <p className="text-gray-600 mb-6">
          We encountered an unexpected error. This might be due to a recent update.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleReload}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Reload Page
          </button>
          
          <button
            onClick={handleReset}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          If the problem persists, please clear your browser cache and try again.
        </p>
      </div>
    </div>
  );
}
