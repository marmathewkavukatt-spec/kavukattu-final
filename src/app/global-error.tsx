'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Global error:', error);
    }
  }, [error]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error - Mar Mathew Kavukatt</title>
      </head>
      <body className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          {/* Error Icon */}
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
              <svg 
                className="w-12 h-12 text-red-600" 
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
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
            Application Error
          </h1>
          
          <p className="text-lg text-stone-600 mb-8">
            We're sorry, but something went wrong. Please try refreshing the page.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={reset}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Try Again
            </button>
            
            <a
              href="/"
              className="px-6 py-3 bg-white text-red-600 border-2 border-red-600 rounded-lg font-semibold hover:bg-red-600 hover:text-white transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Return Home
            </a>
          </div>

          {/* Additional Help */}
          <div className="mt-12 pt-8 border-t border-stone-200">
            <p className="text-sm text-stone-500">
              If this problem persists, please refresh your browser or try again later.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
