import { config } from './config';

// Performance optimization utilities for SEO
export interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

// Lazy loading with SEO-friendly attributes
export function createSEOOptimizedImage(
  src: string,
  alt: string,
  options: {
    width?: number;
    height?: number;
    priority?: boolean;
    sizes?: string;
    className?: string;
  } = {}
) {
  const {
    width = 800,
    height = 600,
    priority = false,
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    className = ''
  } = options;

  return {
    src,
    alt,
    width,
    height,
    sizes,
    className,
    loading: priority ? 'eager' : 'lazy' as 'eager' | 'lazy',
    decoding: 'async' as 'async',
    // SEO-friendly attributes
    'data-seo-optimized': 'true',
    // Prevent layout shift
    style: {
      aspectRatio: `${width}/${height}`,
      objectFit: 'cover' as const
    }
  };
}

// Preload critical resources for better performance
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return;

  const criticalResources = [
    // Preload critical fonts
    {
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      as: 'style',
      crossOrigin: 'anonymous'
    },
    // Preload critical images
    {
      href: '/logo.svg',
      as: 'image',
      type: 'image/svg+xml'
    },
    {
      href: '/og-default.jpg',
      as: 'image',
      type: 'image/jpeg'
    }
  ];

  if (Array.isArray(criticalResources) && criticalResources.length > 0) {
    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
       link.as = resource.as;
       if (resource.crossOrigin) {
         link.crossOrigin = resource.crossOrigin;
       }
       if (resource.type) {
         link.type = resource.type;
       }
       document.head.appendChild(link);
     });
   }
}

// Monitor Core Web Vitals
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  const metrics: PerformanceMetrics = {};

  // Measure FCP (First Contentful Paint)
  const fcpObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      metrics.fcp = fcpEntry.startTime;
      reportMetric('FCP', fcpEntry.startTime);
    }
  });
  fcpObserver.observe({ entryTypes: ['paint'] });

  // Measure LCP (Largest Contentful Paint)
  const lcpObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];
    metrics.lcp = lastEntry.startTime;
    reportMetric('LCP', lastEntry.startTime);
  });
  lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

  // Measure FID (First Input Delay)
  const fidObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    if (Array.isArray(entries) && entries.length > 0) {
      entries.forEach(entry => {
        // Type assertion for PerformanceEventTiming which has processingStart
        const eventEntry = entry as any;
        if (eventEntry.processingStart && eventEntry.startTime) {
          const fid = eventEntry.processingStart - eventEntry.startTime;
          metrics.fid = fid;
          reportMetric('FID', fid);
        }
      });
    }
  });
  fidObserver.observe({ entryTypes: ['first-input'] });

  // Measure CLS (Cumulative Layout Shift)
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    if (Array.isArray(entries) && entries.length > 0) {
      entries.forEach(entry => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      });
    }
    metrics.cls = clsValue;
    reportMetric('CLS', clsValue);
  });
  clsObserver.observe({ entryTypes: ['layout-shift'] });

  // Measure TTFB (Time to First Byte)
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const ttfb = navigation.responseStart - navigation.requestStart;
      metrics.ttfb = ttfb;
      reportMetric('TTFB', ttfb);
    }
  });

  return metrics;
}

// Report performance metrics
function reportMetric(name: string, value: number) {
  // Only report in production and if analytics is configured
  if (process.env.NODE_ENV === 'production' && config.analytics.id) {
    // Report to Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', name, {
        event_category: 'Web Vitals',
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        non_interaction: true,
      });
    }

    // Log for debugging (remove in production)
    console.log(`${name}: ${value}`);
  }
}

// Optimize images for SEO and performance
export function optimizeImageForSEO(
  src: string,
  alt: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  } = {}
) {
  const { width = 800, height = 600, quality = 80, format = 'webp' } = options;
  
  // Generate optimized image URL (assuming you have an image optimization service)
  const optimizedSrc = `${src}?w=${width}&h=${height}&q=${quality}&f=${format}`;
  
  return {
    src: optimizedSrc,
    alt,
    width,
    height,
    // Generate srcSet for responsive images
    srcSet: [
      `${src}?w=${Math.round(width * 0.5)}&h=${Math.round(height * 0.5)}&q=${quality}&f=${format} ${Math.round(width * 0.5)}w`,
      `${src}?w=${width}&h=${height}&q=${quality}&f=${format} ${width}w`,
      `${src}?w=${Math.round(width * 1.5)}&h=${Math.round(height * 1.5)}&q=${quality}&f=${format} ${Math.round(width * 1.5)}w`,
      `${src}?w=${Math.round(width * 2)}&h=${Math.round(height * 2)}&q=${quality}&f=${format} ${Math.round(width * 2)}w`
    ].join(', '),
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  };
}

// Critical CSS inlining for above-the-fold content
export function inlineCriticalCSS() {
  if (typeof document === 'undefined') return;

  const criticalCSS = `
    /* Critical CSS for above-the-fold content */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      margin: 0;
      padding: 0;
      line-height: 1.6;
    }
    
    .header {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: #fff;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .hero {
      min-height: 60vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  const style = document.createElement('style');
  style.textContent = criticalCSS;
  document.head.appendChild(style);
}

// Defer non-critical JavaScript
export function deferNonCriticalJS() {
  if (typeof window === 'undefined') return;

  // Defer analytics and other non-critical scripts
  const nonCriticalScripts = [
    'https://www.googletagmanager.com/gtag/js',
    // Add other non-critical script URLs
  ];

  // Load non-critical scripts after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (Array.isArray(nonCriticalScripts) && nonCriticalScripts.length > 0) {
        nonCriticalScripts.forEach(src => {
          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          document.head.appendChild(script);
        });
      }
    }, 1000); // Delay by 1 second after load
  });
}

// Service Worker registration for caching
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Initialize all performance optimizations
export function initPerformanceOptimizations() {
  if (typeof window === 'undefined') return;

  // Preload critical resources
  preloadCriticalResources();
  
  // Initialize performance monitoring
  initPerformanceMonitoring();
  
  // Inline critical CSS
  inlineCriticalCSS();
  
  // Defer non-critical JavaScript
  deferNonCriticalJS();
  
  // Register service worker
  registerServiceWorker();
}

export default {
  createSEOOptimizedImage,
  preloadCriticalResources,
  initPerformanceMonitoring,
  optimizeImageForSEO,
  inlineCriticalCSS,
  deferNonCriticalJS,
  registerServiceWorker,
  initPerformanceOptimizations
};