'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { queryKeys } from '@/lib/data-fetching/react-query-config';

interface UseProductPrefetchOptions {
  productHandle: string;
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

interface UseCategoryPrefetchOptions {
  categories?: string[];
  enabled?: boolean;
  prefetchDelay?: number;
}

// Fetch function for products
async function fetchProducts(params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  inStock?: boolean;
  sort?: string;
}) {
  const result = await apiClient.getProducts(params);
  return {
    products: Array.isArray(result.products) ? result.products : [],
    pagination: result.pagination
  };
}

// Fetch function for categories
async function fetchCategories(params: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  sort?: string;
}) {
  const result = await apiClient.getCategories(params);
  return Array.isArray(result) ? result : [];
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
      // Prefetch product data using the new query keys
      await queryClient.prefetchQuery({
        queryKey: queryKeys.products.detail(productHandle),
        queryFn: () => apiClient.getProductByHandle(productHandle),
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

// New hook for category-based prefetching
export function useCategoryPrefetch(options: UseCategoryPrefetchOptions = {}) {
  const queryClient = useQueryClient();
  const { categories = [], enabled = true, prefetchDelay = 1000 } = options;

  useEffect(() => {
    if (!enabled) return;

    const prefetchTimer = setTimeout(() => {
      // Prefetch categories if not already cached
      const categoriesKey = queryKeys.collections.list({
        page: 1,
        limit: 50,
        sort: '-createdAt',
      });

      if (!queryClient.getQueryData(categoriesKey)) {
        queryClient.prefetchQuery({
          queryKey: categoriesKey,
          queryFn: () => fetchCategories({
            page: 1,
            limit: 50,
            sort: '-createdAt',
          }),
          staleTime: 10 * 60 * 1000, // 10 minutes
        });
      }

      // Prefetch products for each category
      categories.forEach((category) => {
        const productsKey = queryKeys.products.list({
          category,
          page: 1,
          limit: 20,
        });

        if (!queryClient.getQueryData(productsKey)) {
          queryClient.prefetchQuery({
            queryKey: productsKey,
            queryFn: () => fetchProducts({
              category,
              page: 1,
              limit: 20,
            }),
            staleTime: 2 * 60 * 1000, // 2 minutes
          });
        }
      });

      // Prefetch "all products" view
      const allProductsKey = queryKeys.products.list({
        page: 1,
        limit: 20,
      });

      if (!queryClient.getQueryData(allProductsKey)) {
        queryClient.prefetchQuery({
          queryKey: allProductsKey,
          queryFn: () => fetchProducts({
            page: 1,
            limit: 20,
          }),
          staleTime: 2 * 60 * 1000,
        });
      }
    }, prefetchDelay);

    return () => clearTimeout(prefetchTimer);
  }, [queryClient, categories, enabled, prefetchDelay]);

  // Prefetch specific category products
  const prefetchCategoryProducts = useCallback((category: string) => {
    const productsKey = queryKeys.products.list({
      category,
      page: 1,
      limit: 20,
    });

    queryClient.prefetchQuery({
      queryKey: productsKey,
      queryFn: () => fetchProducts({
        category,
        page: 1,
        limit: 20,
      }),
      staleTime: 2 * 60 * 1000,
    });
  }, [queryClient]);

  return {
    prefetchCategoryProducts,
  };
}