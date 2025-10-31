'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

interface PrefetchAnalytics {
  visitedRoutes: string[];
  timeSpent: Record<string, number>;
  clickPatterns: Record<string, number>;
  scrollDepth: Record<string, number>;
}

interface UseAdvancedPrefetchOptions {
  enabled?: boolean;
  maxPrefetchDistance?: number;
  analyticsWeight?: number;
  scrollThreshold?: number;
  batchSize?: number;
  cooldownMs?: number;
}

// Global analytics store
const analytics: PrefetchAnalytics = {
  visitedRoutes: [],
  timeSpent: {},
  clickPatterns: {},
  scrollDepth: {},
};

// Prefetch queue management
class PrefetchQueue {
  private queue: Array<{ href: string; priority: number; timestamp: number }> = [];
  private processing = false;
  private lastProcessed = 0;
  private cooldownMs: number;

  constructor(cooldownMs = 1000) {
    this.cooldownMs = cooldownMs;
  }

  add(href: string, priority: number) {
    // Remove existing entry if present
    this.queue = this.queue.filter(item => item.href !== href);
    
    // Add with current timestamp
    this.queue.push({ href, priority, timestamp: Date.now() });
    
    // Sort by priority (higher first)
    this.queue.sort((a, b) => b.priority - a.priority);
    
    this.processQueue();
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    const now = Date.now();
    if (now - this.lastProcessed < this.cooldownMs) return;
    
    this.processing = true;
    this.lastProcessed = now;
    
    try {
      // Process up to 3 items at once
      const batch = this.queue.splice(0, 3);
      
      await Promise.allSettled(
        batch.map(async ({ href }) => {
          if (typeof window !== 'undefined') {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = href;
            document.head.appendChild(link);
            
            // Remove after a delay to prevent memory leaks
            setTimeout(() => {
              if (link.parentNode) {
                link.parentNode.removeChild(link);
              }
            }, 30000);
          }
        })
      );
    } finally {
      this.processing = false;
      
      // Continue processing if queue has items
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), this.cooldownMs);
      }
    }
  }

  clear() {
    this.queue = [];
  }
}

const prefetchQueue = new PrefetchQueue();

export function useAdvancedPrefetch({
  enabled = true,
  maxPrefetchDistance = 5,
  analyticsWeight = 0.7,
  scrollThreshold = 0.8,
  batchSize = 3,
  cooldownMs = 1000,
}: UseAdvancedPrefetchOptions = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const currentRouteRef = useRef<string>('');
  const routeStartTimeRef = useRef<number>(Date.now());

  // Track current route analytics
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const currentRoute = window.location.pathname;
    const now = Date.now();
    
    // Record time spent on previous route
    if (currentRouteRef.current && currentRouteRef.current !== currentRoute) {
      const timeSpent = now - routeStartTimeRef.current;
      analytics.timeSpent[currentRouteRef.current] = 
        (analytics.timeSpent[currentRouteRef.current] || 0) + timeSpent;
    }
    
    // Update current route tracking
    currentRouteRef.current = currentRoute;
    routeStartTimeRef.current = now;
    
    // Add to visited routes
    if (!analytics.visitedRoutes.includes(currentRoute)) {
      analytics.visitedRoutes.push(currentRoute);
    }
  }, []);

  // Scroll-based prefetching
  const handleScroll = useCallback(() => {
    if (!enabled) return;
    
    setIsScrolling(true);
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Set new timeout
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
    
    // Calculate scroll depth
    const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    const currentRoute = window.location.pathname;
    analytics.scrollDepth[currentRoute] = Math.max(
      analytics.scrollDepth[currentRoute] || 0,
      scrollPercent
    );
    
    // Trigger prefetch when user scrolls past threshold
    if (scrollPercent > scrollThreshold) {
      prefetchRelatedContent();
    }
  }, [enabled, scrollThreshold]);

  // Analytics-based route prediction
  const predictNextRoutes = useCallback((): Array<{ href: string; score: number }> => {
    const currentRoute = window.location.pathname;
    const predictions: Array<{ href: string; score: number }> = [];
    
    // Score based on visit frequency
    Object.entries(analytics.clickPatterns).forEach(([route, clicks]) => {
      if (route !== currentRoute) {
        let score = clicks * 0.4;
        
        // Boost score based on time spent (indicates engagement)
        const timeSpent = analytics.timeSpent[route] || 0;
        score += (timeSpent / 60000) * 0.3; // Convert ms to minutes
        
        // Boost score based on scroll depth (indicates interest)
        const scrollDepth = analytics.scrollDepth[route] || 0;
        score += scrollDepth * 0.3;
        
        predictions.push({ href: route, score });
      }
    });
    
    // Add common navigation patterns
    if (currentRoute === '/') {
      predictions.push({ href: '/collections', score: 0.8 });
    } else if (currentRoute.includes('/products/')) {
      predictions.push({ href: '/collections', score: 0.6 });
      predictions.push({ href: '/', score: 0.4 });
    } else if (currentRoute === '/collections') {
      // Predict popular product routes based on analytics
      const popularProducts = Object.entries(analytics.clickPatterns)
        .filter(([route]) => route.includes('/products/'))
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([route, clicks]) => ({ href: route, score: clicks * 0.1 }));
      
      predictions.push(...popularProducts);
    }
    
    return predictions
      .sort((a, b) => b.score - a.score)
      .slice(0, maxPrefetchDistance);
  }, [maxPrefetchDistance]);

  // Prefetch related content based on current context
  const prefetchRelatedContent = useCallback(async () => {
    if (!enabled) return;
    
    const predictions = predictNextRoutes();
    
    predictions.forEach(({ href, score }) => {
      // Add to prefetch queue with priority based on score
      prefetchQueue.add(href, score);
    });
    
    // Prefetch product data for product pages
    const currentRoute = window.location.pathname;
    if (currentRoute.includes('/products/')) {
      const productHandle = currentRoute.split('/products/')[1]?.split('?')[0];
      if (productHandle) {
        // Prefetch related products
        queryClient.prefetchQuery({
          queryKey: ['related-products', productHandle],
          queryFn: async () => {
            // Use the same logic as in query-hooks.ts
            const response = await fetch(`/api/v1/products?limit=8`);
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();
            
            // Simple related products logic - return random products excluding the current one
            const relatedProducts = data.data?.filter((product: any) => product.handle !== productHandle).slice(0, 4) || [];
            
            return {
              success: true,
              data: relatedProducts
            };
          },
          staleTime: 10 * 60 * 1000,
        });
        
        // Prefetch product reviews
        queryClient.prefetchQuery({
          queryKey: ['product-ratings', productHandle],
          queryFn: async () => {
            // First get the product to get its ID
            const productResponse = await fetch(`/api/v1/products/handle/${productHandle}`);
            if (!productResponse.ok) throw new Error('Failed to fetch product');
            const productData = await productResponse.json();
            const productId = productData.data._id;
            
            // Then fetch reviews using the product ID
            const response = await fetch(`/api/v1/ratings/product/${productId}/ratings`);
            return response.json();
          },
          staleTime: 5 * 60 * 1000,
        });
      }
    }
  }, [enabled, predictNextRoutes, queryClient]);

  // Infinite scroll prefetching
  const { ref: infiniteScrollRef } = useInView({
    threshold: 0.1,
    rootMargin: '200px',
    onChange: (inView) => {
      if (inView && enabled) {
        prefetchRelatedContent();
      }
    },
  });

  // Set up scroll listener
  useEffect(() => {
    if (!enabled) return;
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [enabled, handleScroll]);

  // Track click patterns
  const trackClick = useCallback((href: string) => {
    analytics.clickPatterns[href] = (analytics.clickPatterns[href] || 0) + 1;
  }, []);

  // Preload critical resources
  const preloadCriticalResources = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    // Preload critical fonts
    const fontPreloads = [
      '/fonts/inter-var.woff2',
      '/fonts/tajawal-var.woff2',
    ];
    
    fontPreloads.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = font;
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
    
    // Preload critical images
    const imagePreloads = [
      '/logo-logen.png',
      '/hero-banner.webp',
    ];
    
    imagePreloads.forEach(image => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = image;
      link.as = 'image';
      document.head.appendChild(link);
    });
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (enabled) {
      preloadCriticalResources();
      
      // Initial prefetch after a short delay
      setTimeout(() => {
        prefetchRelatedContent();
      }, 1000);
    }
  }, [enabled, preloadCriticalResources, prefetchRelatedContent]);

  return {
    infiniteScrollRef,
    isScrolling,
    trackClick,
    prefetchRelatedContent,
    analytics: analytics,
    clearAnalytics: () => {
      analytics.visitedRoutes = [];
      analytics.timeSpent = {};
      analytics.clickPatterns = {};
      analytics.scrollDepth = {};
      prefetchQueue.clear();
    },
  };
}