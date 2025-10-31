import { cache } from 'react';

// Cache for prefetched data
const prefetchCache = new Map<string, Promise<any>>();

// Prefetch product data
export const prefetchProduct = cache(async (handle: string) => {
  const cacheKey = `product-${handle}`;
  
  if (prefetchCache.has(cacheKey)) {
    return prefetchCache.get(cacheKey);
  }

  const promise = fetch(`/api/v1/products/handle/${handle}`, {
    next: { 
      revalidate: 3600, // 1 hour cache
      tags: [`product-${handle}`] 
    }
  }).then(res => res.json());

  prefetchCache.set(cacheKey, promise);
  return promise;
});

// Prefetch related products
export const prefetchRelatedProducts = cache(async (productId: string) => {
  const cacheKey = `related-${productId}`;
  
  if (prefetchCache.has(cacheKey)) {
    return prefetchCache.get(cacheKey);
  }

  const promise = fetch(`/api/v1/products/${productId}/related`, {
    next: { 
      revalidate: 1800, // 30 minutes cache
      tags: [`related-${productId}`] 
    }
  }).then(res => res.json());

  prefetchCache.set(cacheKey, promise);
  return promise;
});

// Prefetch product reviews
export const prefetchProductReviews = cache(async (productId: string) => {
  const cacheKey = `reviews-${productId}`;
  
  if (prefetchCache.has(cacheKey)) {
    return prefetchCache.get(cacheKey);
  }

  const promise = fetch(`/api/v1/products/${productId}/reviews`, {
    next: { 
      revalidate: 900, // 15 minutes cache
      tags: [`reviews-${productId}`] 
    }
  }).then(res => res.json());

  prefetchCache.set(cacheKey, promise);
  return promise;
});

// Intelligent link prefetching based on user behavior
export class IntelligentPrefetcher {
  private static instance: IntelligentPrefetcher;
  private prefetchQueue: Set<string> = new Set();
  private prefetchTimeout: NodeJS.Timeout | null = null;

  static getInstance(): IntelligentPrefetcher {
    if (!IntelligentPrefetcher.instance) {
      IntelligentPrefetcher.instance = new IntelligentPrefetcher();
    }
    return IntelligentPrefetcher.instance;
  }

  // Queue a URL for prefetching
  queuePrefetch(url: string) {
    if (this.prefetchQueue.has(url)) return;
    
    this.prefetchQueue.add(url);
    
    // Debounce prefetching to avoid overwhelming the network
    if (this.prefetchTimeout) {
      clearTimeout(this.prefetchTimeout);
    }
    
    this.prefetchTimeout = setTimeout(() => {
      this.processPrefetchQueue();
    }, 100);
  }

  // Process the prefetch queue
  private processPrefetchQueue() {
    const urls = Array.from(this.prefetchQueue);
    this.prefetchQueue.clear();

    // Limit concurrent prefetches
    const maxConcurrent = 3;
    const batches = [];
    
    for (let i = 0; i < urls.length; i += maxConcurrent) {
      batches.push(urls.slice(i, i + maxConcurrent));
    }

    batches.forEach((batch, index) => {
      setTimeout(() => {
        batch.forEach(url => this.prefetchUrl(url));
      }, index * 200); // Stagger batches
    });
  }

  // Prefetch a single URL
  private prefetchUrl(url: string) {
    if (typeof window === 'undefined') return;

    // Use the browser's prefetch API if available
    if ('prefetch' in document.createElement('link')) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    } else {
      // Fallback to fetch with low priority
      fetch(url, { 
        method: 'HEAD',
        priority: 'low' as RequestPriority
      }).catch(() => {
        // Ignore prefetch errors
      });
    }
  }

  // Prefetch based on mouse hover with delay
  onHover(url: string, delay: number = 300) {
    const timeoutId = setTimeout(() => {
      this.queuePrefetch(url);
    }, delay);

    return () => clearTimeout(timeoutId);
  }

  // Prefetch based on intersection observer
  onIntersect(url: string, threshold: number = 0.1) {
    if (typeof window === 'undefined') return () => {};

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.queuePrefetch(url);
            observer.disconnect();
          }
        });
      },
      { threshold }
    );

    return observer;
  }
}

// Export singleton instance
export const prefetcher = IntelligentPrefetcher.getInstance();

// Hook for using prefetcher in React components
export const usePrefetch = () => {
  return {
    prefetchOnHover: (url: string, delay?: number) => prefetcher.onHover(url, delay),
    prefetchOnIntersect: (url: string, threshold?: number) => prefetcher.onIntersect(url, threshold),
    queuePrefetch: (url: string) => prefetcher.queuePrefetch(url),
  };
};

// Clear cache utility
export const clearPrefetchCache = (pattern?: string) => {
  if (pattern) {
    const keysToDelete = Array.from(prefetchCache.keys()).filter(key => 
      key.includes(pattern)
    );
    keysToDelete.forEach(key => prefetchCache.delete(key));
  } else {
    prefetchCache.clear();
  }
};