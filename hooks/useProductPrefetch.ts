'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface UseProductPrefetchOptions {
  productHandle: string;
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

export function useProductPrefetch({
  productHandle,
  threshold = 0.1,
  rootMargin = '50px',
  enabled = true,
}: UseProductPrefetchOptions) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);
  const prefetchedRef = useRef(false);

  const prefetchProductData = useCallback(async () => {
    if (prefetchedRef.current || !enabled) return;
    
    try {
      // Prefetch product data
      await queryClient.prefetchQuery({
        queryKey: ['product', productHandle],
        queryFn: () => apiClient.getProduct(productHandle),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });

      // Prefetch the route
      router.prefetch(`/products/${productHandle}`);
      
      prefetchedRef.current = true;
    } catch (error) {
      console.warn('Failed to prefetch product data:', error);
    }
  }, [productHandle, queryClient, router, enabled]);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && !prefetchedRef.current) {
        prefetchProductData();
      }
    },
    [prefetchProductData]
  );

  const setRef = useCallback(
    (element: HTMLElement | null) => {
      if (!enabled) return;

      // Cleanup previous observer
      if (observerRef.current && elementRef.current) {
        observerRef.current.unobserve(elementRef.current);
      }

      elementRef.current = element;

      if (element) {
        // Create new observer if needed
        if (!observerRef.current) {
          observerRef.current = new IntersectionObserver(handleIntersection, {
            threshold,
            rootMargin,
          });
        }

        observerRef.current.observe(element);
      }
    },
    [handleIntersection, threshold, rootMargin, enabled]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    ref: setRef,
    prefetch: prefetchProductData,
    isPrefetched: prefetchedRef.current,
  };
}