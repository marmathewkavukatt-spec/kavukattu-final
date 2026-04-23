"use client";

import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  imageCount: number;
  renderTime: number;
}

export function usePerformanceMonitor(componentName: string, itemCount?: number) {
  const startTimeRef = useRef<number>(0);
  const renderStartRef = useRef<number>(0);

  useEffect(() => {
    // Mark start time
    startTimeRef.current = performance.now();
    renderStartRef.current = performance.now();

    return () => {
      // Calculate metrics on unmount
      const loadTime = performance.now() - startTimeRef.current;
      const renderTime = performance.now() - renderStartRef.current;

      const metrics: PerformanceMetrics = {
        loadTime,
        imageCount: itemCount || 0,
        renderTime,
      };

      // Log performance metrics in development
      if (process.env.NODE_ENV === 'development') {
        console.group(`🚀 Performance Metrics: ${componentName}`);
        console.log(`Load Time: ${loadTime.toFixed(2)}ms`);
        console.log(`Render Time: ${renderTime.toFixed(2)}ms`);
        if (itemCount) {
          console.log(`Images: ${itemCount}`);
          console.log(`Time per image: ${(loadTime / itemCount).toFixed(2)}ms`);
        }
        console.groupEnd();
      }

      // Send to analytics in production (if available)
      if (typeof window !== 'undefined' && 'gtag' in window && typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'performance_timing', {
          event_category: 'Gallery',
          event_label: componentName,
          value: Math.round(loadTime),
          custom_map: {
            load_time: loadTime,
            image_count: itemCount || 0,
            render_time: renderTime,
          }
        });
      }
    };
  }, [componentName, itemCount]);

  const markRenderComplete = () => {
    renderStartRef.current = performance.now();
  };

  return { markRenderComplete };
}

export function useImageLoadMonitor() {
  const loadedImagesRef = useRef<Set<string>>(new Set());
  const loadTimesRef = useRef<Map<string, number>>(new Map());

  const trackImageLoad = (imageId: string, startTime?: number) => {
    const loadTime = performance.now() - (startTime || 0);
    loadedImagesRef.current.add(imageId);
    loadTimesRef.current.set(imageId, loadTime);

    if (process.env.NODE_ENV === 'development') {
      console.log(`📸 Image loaded: ${imageId} (${loadTime.toFixed(2)}ms)`);
    }
  };

  const getLoadStats = () => {
    const loadTimes = Array.from(loadTimesRef.current.values());
    return {
      totalLoaded: loadedImagesRef.current.size,
      averageLoadTime: loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length || 0,
      maxLoadTime: Math.max(...loadTimes, 0),
      minLoadTime: Math.min(...loadTimes, Infinity) || 0,
    };
  };

  return { trackImageLoad, getLoadStats };
}