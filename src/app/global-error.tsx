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
    console.error('Global error:', error);

    // Auto-reload for chunk errors
    const isChunkError = 
      error.message.includes('Loading chunk') ||
      error.message.includes('ChunkLoadError') ||
      error.message.includes('Failed to fetch');

    if (isChunkError && !sessionStorage.getItem('global-error-reloaded')) {
      sessionStorage.setItem('global-error-reloaded', 'true');
      setTimeout(() => window.location.reload(), 100);
    }
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)',
          padding: '1rem',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '28rem',
            width: '100%',
            background: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '1rem'
            }}>
              Application Error
            </h1>
            
            <p style={{
              color: '#6b7280',
              marginBottom: '1.5rem'
            }}>
              The application encountered an error. Please reload the page.
            </p>

            <button
              onClick={() => {
                sessionStorage.removeItem('global-error-reloaded');
                window.location.reload();
              }}
              style={{
                width: '100%',
                background: '#4f46e5',
                color: 'white',
                fontWeight: '600',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
