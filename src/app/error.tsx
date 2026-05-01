'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Application error:', error);
    }
    
    // In production, you could send to error tracking service
    // Example: Sentry, LogRocket, etc.
    // logErrorToService(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          {/* Error Icon */}
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center">
              <svg 
                className="w-12 h-12 text-accent" 
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
          </div>

          {/* Error Message */}
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 mb-4">
            Something Went Wrong
          </h1>
          
          <p className="text-lg text-stone-600 mb-8">
            We apologize for the inconvenience. An unexpected error has occurred.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={reset}
              className="px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent-dark transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Try Again
            </button>
            
            <Link
              href="/"
              className="px-6 py-3 bg-white text-accent border-2 border-accent rounded-lg font-semibold hover:bg-accent hover:text-white transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Return Home
            </Link>
          </div>

          {/* Additional Help */}
          <div className="mt-12 pt-8 border-t border-stone-200">
            <p className="text-sm text-stone-500">
              If this problem persists, please{' '}
              <Link href="/contacts" className="text-accent hover:underline font-semibold">
                contact us
              </Link>
              {' '}for assistance.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
