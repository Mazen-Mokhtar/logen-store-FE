'use client';

import { 
  forwardRef, 
  useRef, 
  useCallback, 
  useEffect, 
  useState,
  useMemo,
  memo
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

interface OptimizedLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
  prefetchOnHover?: boolean;
  prefetchOnViewport?: boolean;
  prefetchPredictive?: boolean;
  prefetchDelay?: number;
  viewportThreshold?: number;
  rootMargin?: string;
  priority?: 'high' | 'medium' | 'low';
  onClick?: (e: React.MouseEvent) => void;
  onPrefetch?: (href: string) => void;
  [key: string]: any;
}

// Cache for prefetched routes to avoid duplicate requests
const prefetchCache = new Set<string>();
const hoverTimeouts = new Map<string, NodeJS.Timeout>();

const OptimizedLink = memo(forwardRef<HTMLAnchorElement, OptimizedLinkProps>(({
  href,
  children,
  className,
  prefetch = true,
  prefetchOnHover = true,
  prefetchOnViewport = true,
  prefetchPredictive = true,
  prefetchDelay = 100,
  viewportThreshold = 0.2,
  rootMargin = '100px',
  priority = 'medium',
  onClick,
  onPrefetch,
  ...props
}, ref) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPrefetched, setIsPrefetched] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);
  
  // Viewport-based prefetching
  const { ref: inViewRef, inView } = useInView({
    threshold: viewportThreshold,
    rootMargin,
    triggerOnce: true,
    skip: !prefetchOnViewport,
  });

  // Memoized prefetch function to avoid recreating on every render
  const performPrefetch = useCallback(async (reason: string) => {
    if (prefetchCache.has(href) || isPrefetched) return;
    
    try {
      // Mark as prefetched immediately to prevent duplicate requests
      prefetchCache.add(href);
      setIsPrefetched(true);
      
      // Prefetch the route
      router.prefetch(href);
      
      // Extract potential API endpoints from href for data prefetching
      if (href.includes('/products/')) {
        const productHandle = href.split('/products/')[1]?.split('?')[0];
        if (productHandle) {
          // Prefetch product data
          await queryClient.prefetchQuery({
            queryKey: ['product', productHandle],
            queryFn: async () => {
              const response = await fetch(`/api/v1/products/${productHandle}`);
              return response.json();
            },
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
          });
          
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
        }
      }
      
      // Prefetch collections data
      if (href.includes('/collections')) {
        queryClient.prefetchQuery({
          queryKey: ['collections'],
          queryFn: async () => {
            const response = await fetch('/api/v1/category');
            return response.json();
          },
          staleTime: 15 * 60 * 1000,
        });
      }
      
      onPrefetch?.(href);
      
      // Performance tracking
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'prefetch', {
          event_category: 'navigation',
          event_label: href,
          custom_parameter_1: reason,
        });
      }
      
    } catch (error) {
      console.warn(`Failed to prefetch ${href}:`, error);
      prefetchCache.delete(href);
      setIsPrefetched(false);
    }
  }, [href, router, queryClient, onPrefetch, isPrefetched]);

  // Hover-based prefetching with debouncing
  const handleMouseEnter = useCallback(() => {
    if (!prefetchOnHover || isPrefetched) return;
    
    // Clear any existing timeout
    const existingTimeout = hoverTimeouts.get(href);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Set new timeout for delayed prefetch
    const timeout = setTimeout(() => {
      performPrefetch('hover');
      hoverTimeouts.delete(href);
    }, prefetchDelay);
    
    hoverTimeouts.set(href, timeout);
  }, [href, prefetchOnHover, prefetchDelay, performPrefetch, isPrefetched]);

  const handleMouseLeave = useCallback(() => {
    // Cancel prefetch if user leaves quickly
    const timeout = hoverTimeouts.get(href);
    if (timeout) {
      clearTimeout(timeout);
      hoverTimeouts.delete(href);
    }
  }, [href]);

  // Viewport-based prefetching
  useEffect(() => {
    if (inView && prefetchOnViewport && !isPrefetched) {
      performPrefetch('viewport');
    }
  }, [inView, prefetchOnViewport, performPrefetch, isPrefetched]);

  // Predictive prefetching based on user behavior patterns
  useEffect(() => {
    if (!prefetchPredictive || isPrefetched) return;
    
    const predictivePrefetch = () => {
      // Prefetch based on priority and user patterns
      const delay = priority === 'high' ? 0 : priority === 'medium' ? 2000 : 5000;
      
      setTimeout(() => {
        if (!isPrefetched && document.visibilityState === 'visible') {
          performPrefetch('predictive');
        }
      }, delay);
    };
    
    // Only prefetch when page is idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(predictivePrefetch, { timeout: 10000 });
    } else {
      setTimeout(predictivePrefetch, 1000);
    }
  }, [prefetchPredictive, priority, performPrefetch, isPrefetched]);

  // Optimized click handler with instant navigation
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    // Call custom onClick if provided
    onClick?.(e);
    
    // Don't interfere with default Link behavior
    if (e.defaultPrevented) return;
    
    // Track navigation performance
    const startTime = performance.now();
    
    // Use router.push for instant navigation feel
    e.preventDefault();
    router.push(href);
    
    // Performance tracking
    if (typeof window !== 'undefined' && window.gtag) {
      const endTime = performance.now();
      window.gtag('event', 'navigation_click', {
        event_category: 'navigation',
        event_label: href,
        value: Math.round(endTime - startTime),
        custom_parameter_1: isPrefetched ? 'prefetched' : 'not_prefetched',
      });
    }
  }, [onClick, router, href, isPrefetched]);

  // Combine refs
  const combinedRef = useCallback((node: HTMLAnchorElement) => {
    linkRef.current = node;
    inViewRef(node);
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref, inViewRef]);

  // Memoize props to prevent unnecessary re-renders
  const linkProps = useMemo(() => ({
    href,
    className,
    prefetch: prefetch && !isPrefetched, // Don't prefetch again if already done
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onClick: handleClick,
    ...props,
  }), [href, className, prefetch, isPrefetched, handleMouseEnter, handleMouseLeave, handleClick, props]);

  return (
    <Link ref={combinedRef} {...linkProps}>
      {children}
    </Link>
  );
}));

OptimizedLink.displayName = 'OptimizedLink';

export default OptimizedLink;

// Utility function for batch prefetching
export const batchPrefetch = async (hrefs: string[], router: any, queryClient: any) => {
  const promises = hrefs
    .filter(href => !prefetchCache.has(href))
    .map(async (href) => {
      prefetchCache.add(href);
      router.prefetch(href);
      
      // Prefetch associated data based on route patterns
      if (href.includes('/products/')) {
        const productHandle = href.split('/products/')[1]?.split('?')[0];
        if (productHandle) {
          return queryClient.prefetchQuery({
            queryKey: ['product', productHandle],
            queryFn: async () => {
              const response = await fetch(`/api/v1/products/${productHandle}`);
              return response.json();
            },
            staleTime: 5 * 60 * 1000,
          });
        }
      }
    });
  
  await Promise.allSettled(promises);
};

// Clear prefetch cache utility
export const clearPrefetchCache = () => {
  prefetchCache.clear();
  hoverTimeouts.forEach(timeout => clearTimeout(timeout));
  hoverTimeouts.clear();
};