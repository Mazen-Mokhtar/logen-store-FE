// Performance monitoring and optimization utilities

export interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

export interface ResourceTiming {
  name: string;
  duration: number;
  size?: number;
  type: string;
}

// Performance observer for Core Web Vitals
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
          this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime || lastEntry.startTime;
          this.reportMetric('LCP', this.metrics.lcp);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (Array.isArray(entries) && entries.length > 0) {
            entries.forEach((entry: any) => {
              this.metrics.fid = entry.processingStart - entry.startTime;
              this.reportMetric('FID', this.metrics.fid);
            });
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // Cumulative Layout Shift
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          if (Array.isArray(entries) && entries.length > 0) {
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
          }
          this.metrics.cls = clsValue;
          this.reportMetric('CLS', this.metrics.cls);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }

      // First Contentful Paint
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (Array.isArray(entries) && entries.length > 0) {
            entries.forEach((entry) => {
              if (entry.name === 'first-contentful-paint') {
                this.metrics.fcp = entry.startTime;
                this.reportMetric('FCP', this.metrics.fcp);
              }
            });
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(fcpObserver);
      } catch (e) {
        console.warn('FCP observer not supported');
      }
    }

    // Navigation timing for TTFB
    if ('performance' in window && 'getEntriesByType' in performance) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
          this.reportMetric('TTFB', this.metrics.ttfb);
        }
      });
    }
  }

  private reportMetric(name: string, value: number) {
    // Report to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'web_vitals', {
        event_category: 'Performance',
        event_label: name,
        value: Math.round(value),
        non_interaction: true,
      });
    }

    // Log for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${name}: ${value.toFixed(2)}ms`);
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  disconnect() {
    if (Array.isArray(this.observers) && this.observers.length > 0) {
      this.observers.forEach(observer => observer.disconnect());
    }
    this.observers = [];
  }
}

// Resource loading performance
export function getResourceTimings(): ResourceTiming[] {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return [];
  }

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  return resources.map(resource => ({
    name: resource.name,
    duration: resource.duration,
    size: resource.transferSize,
    type: getResourceType(resource.name),
  }));
}

function getResourceType(url: string): string {
  const extension = url.split('.').pop()?.toLowerCase();
  
  if (['js', 'mjs'].includes(extension || '')) return 'script';
  if (['css'].includes(extension || '')) return 'stylesheet';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) return 'image';
  if (['woff', 'woff2', 'ttf', 'otf'].includes(extension || '')) return 'font';
  if (url.includes('/api/')) return 'api';
  
  return 'other';
}

// Image optimization utilities
export function getOptimizedImageUrl(
  src: string,
  width: number,
  height?: number,
  quality: number = 75
): string {
  // For Next.js Image optimization
  const params = new URLSearchParams({
    url: src,
    w: width.toString(),
    q: quality.toString(),
  });
  
  if (height) {
    params.append('h', height.toString());
  }
  
  return `/_next/image?${params.toString()}`;
}

// Preload critical resources
export function preloadResource(href: string, as: string, type?: string) {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  
  if (type) {
    link.type = type;
  }
  
  document.head.appendChild(link);
}

// Prefetch resources for next navigation
export function prefetchResource(href: string) {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  
  document.head.appendChild(link);
}

// Bundle analysis utilities
export function analyzeBundleSize() {
  if (typeof window === 'undefined') return null;
  
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  
  return {
    scripts: scripts.length,
    styles: styles.length,
    totalResources: scripts.length + styles.length,
  };
}

// Memory usage monitoring
export function getMemoryUsage() {
  if (typeof window === 'undefined' || !('performance' in window)) return null;
  
  const memory = (performance as any).memory;
  if (!memory) return null;
  
  return {
    used: memory.usedJSHeapSize,
    total: memory.totalJSHeapSize,
    limit: memory.jsHeapSizeLimit,
    percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
  };
}

// Connection quality detection
export function getConnectionInfo() {
  if (typeof navigator === 'undefined') return null;
  
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (!connection) return null;
  
  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
  };
}

// Performance budget checker
export interface PerformanceBudget {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
}

export const DEFAULT_BUDGET: PerformanceBudget = {
  lcp: 2500, // 2.5s
  fid: 100,  // 100ms
  cls: 0.1,  // 0.1
  fcp: 1800, // 1.8s
  ttfb: 800, // 800ms
};

export function checkPerformanceBudget(
  metrics: PerformanceMetrics,
  budget: PerformanceBudget = DEFAULT_BUDGET
) {
  const results = {
    lcp: metrics.lcp ? metrics.lcp <= budget.lcp : null,
    fid: metrics.fid ? metrics.fid <= budget.fid : null,
    cls: metrics.cls ? metrics.cls <= budget.cls : null,
    fcp: metrics.fcp ? metrics.fcp <= budget.fcp : null,
    ttfb: metrics.ttfb ? metrics.ttfb <= budget.ttfb : null,
  };
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.values(results).filter(r => r !== null).length;
  
  return {
    results,
    score: total > 0 ? (passed / total) * 100 : 0,
    passed,
    total,
  };
}

// Global performance monitor instance
export const performanceMonitor = typeof window !== 'undefined' ? new PerformanceMonitor() : null;