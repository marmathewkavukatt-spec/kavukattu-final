"use client";

import { useEffect } from 'react';

/**
 * Service Worker Manager
 * 
 * Unregisters any existing service workers to prevent caching issues.
 * Service workers can cause stale content and chunk loading errors.
 */
export default function ServiceWorkerManager() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Unregister all service workers
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      if (registrations.length > 0) {
        console.log(`Found ${registrations.length} service worker(s). Unregistering...`);
        
        registrations.forEach((registration) => {
          registration.unregister().then((success) => {
            if (success) {
              console.log('Service worker unregistered successfully');
            }
          });
        });
      }
    }).catch((error) => {
      console.error('Error checking service workers:', error);
    });

    // Clear all caches
    if ('caches' in window) {
      caches.keys().then((cacheNames) => {
        if (cacheNames.length > 0) {
          console.log(`Found ${cacheNames.length} cache(s). Clearing...`);
          
          cacheNames.forEach((cacheName) => {
            caches.delete(cacheName).then((success) => {
              if (success) {
                console.log(`Cache "${cacheName}" cleared`);
              }
            });
          });
        }
      }).catch((error) => {
        console.error('Error clearing caches:', error);
      });
    }
  }, []);

  return null;
}
