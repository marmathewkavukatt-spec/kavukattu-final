"use client";

import { useEffect } from 'react';

/**
 * ChunkErrorHandler Component
 * 
 * Handles chunk loading errors by automatically reloading the page once.
 * This fixes issues where users have cached old chunk references.
 */
export default function ChunkErrorHandler() {
  useEffect(() => {
    // Track if we've already reloaded to prevent infinite loops
    const hasReloaded = sessionStorage.getItem('chunk-reload');
    
    const handleChunkError = (event: ErrorEvent) => {
      const error = event.error || event.message;
      const errorString = String(error);
      
      // Check if it's a chunk loading error
      const isChunkError = 
        errorString.includes('ChunkLoadError') ||
        errorString.includes('Loading chunk') ||
        errorString.includes('Failed to fetch dynamically imported module') ||
        (event.message && (
          event.message.includes('ChunkLoadError') ||
          event.message.includes('Loading chunk')
        ));
      
      if (isChunkError && !hasReloaded) {
        console.warn('Chunk loading error detected. Reloading page...');
        sessionStorage.setItem('chunk-reload', 'true');
        window.location.reload();
      }
    };
    
    // Listen for unhandled errors
    window.addEventListener('error', handleChunkError);
    
    // Listen for unhandled promise rejections (for dynamic imports)
    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      const reason = String(event.reason);
      
      const isChunkError = 
        reason.includes('ChunkLoadError') ||
        reason.includes('Loading chunk') ||
        reason.includes('Failed to fetch dynamically imported module');
      
      if (isChunkError && !hasReloaded) {
        console.warn('Chunk loading error detected in promise. Reloading page...');
        sessionStorage.setItem('chunk-reload', 'true');
        window.location.reload();
      }
    };
    
    window.addEventListener('unhandledrejection', handlePromiseRejection);
    
    // Clear the reload flag after successful load
    const clearReloadFlag = () => {
      // Wait a bit to ensure everything loaded successfully
      setTimeout(() => {
        sessionStorage.removeItem('chunk-reload');
      }, 5000);
    };
    
    if (hasReloaded) {
      clearReloadFlag();
    }
    
    return () => {
      window.removeEventListener('error', handleChunkError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, []);
  
  return null;
}
