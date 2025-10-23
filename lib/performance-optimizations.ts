/**
 * Performance Optimization Utilities for Next.js Product Navigation
 * 
 * This file contains additional optimizations and configurations
 * to achieve instant-feeling page transitions.
 */

// Router prefetch configuration
export const routerPrefetchConfig = {
  // Prefetch on hover for desktop
  prefetchOnHover: true,
  // Prefetch on viewport entry for mobile
  prefetchOnViewport: true,
  // Prefetch threshold
  viewportThreshold: 0.2,
  // Root margin for intersection observer
  rootMargin: '100px',
};

// Image optimization settings
export const imageOptimizationConfig = {
  // Use Next.js Image component with priority for above-the-fold images
  priority: true,
  // Optimize image sizes for different viewports
  sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  // Use WebP format when supported
  format: 'webp',
  // Placeholder blur for better perceived performance
  placeholder: 'blur',
};

// Cache configuration for API calls
export const cacheConfig = {
  // Product data cache duration (1 minute)
  productCache: 60,
  // Related products cache duration (5 minutes)
  relatedProductsCache: 300,
  // Category data cache duration (10 minutes)
  categoryCache: 600,
  // Static content cache duration (1 hour)
  staticContentCache: 3600,
};

// Performance monitoring utilities
export const performanceUtils = {
  // Measure navigation timing
  measureNavigation: (startTime: number, endTime: number) => {
    const duration = endTime - startTime;
    console.log(`Navigation completed in ${duration}ms`);
    return duration;
  },

  // Preload critical resources
  preloadCriticalResources: () => {
    // Preload critical CSS
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = '/critical.css';
    document.head.appendChild(link);
  },

  // Optimize bundle loading
  optimizeBundleLoading: () => {
    // Use dynamic imports for non-critical components
    return {
      ProductRating: () => import('@/components/ClientOnlyRating'),
      RatingForm: () => import('@/components/RatingForm'),
      RatingsList: () => import('@/components/ClientOnlyRatingsList'),
    };
  },
};

// Additional optimization tips
export const optimizationTips = {
  // 1. Use React.memo for components that don't change often
  memoization: 'Wrap components in React.memo to prevent unnecessary re-renders',
  
  // 2. Implement virtual scrolling for long product lists
  virtualScrolling: 'Use react-window or react-virtualized for large product grids',
  
  // 3. Use service workers for offline caching
  serviceWorker: 'Implement service worker for offline product browsing',
  
  // 4. Optimize database queries
  databaseOptimization: 'Use database indexes and query optimization for faster API responses',
  
  // 5. Implement CDN for static assets
  cdn: 'Use CDN for images and static assets to reduce loading times',
  
  // 6. Use HTTP/2 server push
  http2Push: 'Implement HTTP/2 server push for critical resources',
  
  // 7. Optimize CSS delivery
  cssOptimization: 'Use critical CSS inlining and defer non-critical CSS',
  
  // 8. Implement resource hints
  resourceHints: 'Use dns-prefetch, preconnect, and prefetch for external resources',
};

// Bundle analysis configuration
export const bundleAnalysisConfig = {
  // Analyze bundle size
  analyzeBundles: process.env.ANALYZE === 'true',
  // Bundle size limits
  maxBundleSize: {
    javascript: 250000, // 250KB
    css: 50000, // 50KB
  },
  // Code splitting strategy
  codeSplitting: {
    chunks: 'async',
    minSize: 20000,
    maxSize: 250000,
  },
};

export default {
  routerPrefetchConfig,
  imageOptimizationConfig,
  cacheConfig,
  performanceUtils,
  optimizationTips,
  bundleAnalysisConfig,
};