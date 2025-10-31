import { QueryClient, QueryClientConfig, MutationCache, QueryCache } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// Enterprise-grade React Query configuration for e-commerce
export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // Stale-while-revalidate pattern
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - cache time (formerly cacheTime)
      
      // Retry configuration for production resilience
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for network/server errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Network mode for offline support
      networkMode: 'offlineFirst',
      
      // Refetch configuration
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      
      // Performance optimizations
      refetchInterval: false, // Disable automatic refetching by default
      refetchIntervalInBackground: false,
      
      // Suspense support for React 18
      suspense: false, // We'll enable per-query as needed
      
      // Error handling
      throwOnError: false,
    },
    mutations: {
      // Retry mutations once on network errors
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 1;
      },
      
      // Network mode
      networkMode: 'offlineFirst',
    },
  },
  
  // Global query cache for error handling
  queryCache: new QueryCache({
    onError: (error: any, query) => {
      // Only show error toasts for queries that have components actively listening
      if (query.state.data !== undefined) {
        console.error('Query error:', error);
        
        // Don't show toast for background refetches
        if (query.state.fetchStatus !== 'fetching') {
          toast.error(`Something went wrong: ${error.message}`);
        }
      }
    },
    onSuccess: (data, query) => {
      // Log successful cache updates in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Query ${query.queryHash} updated successfully`);
      }
    },
  }),
  
  // Global mutation cache for error handling
  mutationCache: new MutationCache({
    onError: (error: any, variables, context, mutation) => {
      console.error('Mutation error:', error);
      toast.error(`Failed to update: ${error.message}`);
    },
    onSuccess: (data, variables, context, mutation) => {
      // Show success message for mutations
      if (mutation.options.meta?.successMessage) {
        toast.success(mutation.options.meta.successMessage as string);
      }
    },
  }),
};

// Create the query client instance
export const queryClient = new QueryClient(queryClientConfig);

// Query key factories for consistent cache management
export const queryKeys = {
  // Product queries
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (handle: string) => [...queryKeys.products.details(), handle] as const,
    reviews: (handle: string) => [...queryKeys.products.detail(handle), 'reviews'] as const,
    related: (handle: string) => [...queryKeys.products.detail(handle), 'related'] as const,
    recommendations: (handle: string) => [...queryKeys.products.detail(handle), 'recommendations'] as const,
  },
  
  // Collection queries
  collections: {
    all: ['collections'] as const,
    lists: () => [...queryKeys.collections.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.collections.lists(), filters] as const,
    details: () => [...queryKeys.collections.all, 'detail'] as const,
    detail: (handle: string) => [...queryKeys.collections.details(), handle] as const,
    products: (handle: string, filters: Record<string, any>) => 
      [...queryKeys.collections.detail(handle), 'products', filters] as const,
  },
  
  // Cart queries
  cart: {
    all: ['cart'] as const,
    items: () => [...queryKeys.cart.all, 'items'] as const,
    totals: () => [...queryKeys.cart.all, 'totals'] as const,
    shipping: () => [...queryKeys.cart.all, 'shipping'] as const,
  },
  
  // User queries
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    orders: () => [...queryKeys.user.all, 'orders'] as const,
    order: (id: string) => [...queryKeys.user.orders(), id] as const,
    wishlist: () => [...queryKeys.user.all, 'wishlist'] as const,
    addresses: () => [...queryKeys.user.all, 'addresses'] as const,
  },
  
  // Search queries
  search: {
    all: ['search'] as const,
    results: (query: string, filters: Record<string, any>) => 
      [...queryKeys.search.all, 'results', query, filters] as const,
    suggestions: (query: string) => [...queryKeys.search.all, 'suggestions', query] as const,
  },
  
  // Analytics queries
  analytics: {
    all: ['analytics'] as const,
    pageViews: () => [...queryKeys.analytics.all, 'pageViews'] as const,
    events: () => [...queryKeys.analytics.all, 'events'] as const,
  },
} as const;

// Cache invalidation utilities
export const cacheUtils = {
  // Invalidate all product-related queries
  invalidateProducts: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
  },
  
  // Invalidate specific product
  invalidateProduct: (handle: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(handle) });
  },
  
  // Invalidate collections
  invalidateCollections: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.collections.all });
  },
  
  // Invalidate cart
  invalidateCart: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
  },
  
  // Invalidate user data
  invalidateUser: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
  },
  
  // Clear all caches (use sparingly)
  clearAll: () => {
    queryClient.clear();
  },
  
  // Prefetch utilities
  prefetchProduct: async (handle: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.products.detail(handle),
      queryFn: () => fetch(`/api/v1/products/${handle}`).then(res => res.json()),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },
  
  prefetchCollection: async (handle: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.collections.detail(handle),
      queryFn: () => fetch(`/api/v1/collections/${handle}`).then(res => res.json()),
      staleTime: 5 * 60 * 1000,
    });
  },
  
  // Optimistic updates
  updateProductOptimistically: (handle: string, updater: (old: any) => any) => {
    queryClient.setQueryData(queryKeys.products.detail(handle), updater);
  },
  
  updateCartOptimistically: (updater: (old: any) => any) => {
    queryClient.setQueryData(queryKeys.cart.items(), updater);
  },
};

// Performance monitoring for queries
export const queryPerformance = {
  // Track query performance
  trackQuery: (queryKey: string, startTime: number) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Query ${queryKey} took ${duration.toFixed(2)}ms`);
    }
    
    // Send to analytics in production
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'query_performance', {
        event_category: 'performance',
        event_label: queryKey,
        value: Math.round(duration),
      });
    }
  },
  
  // Get cache statistics
  getCacheStats: () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      staleQueries: queries.filter(q => q.isStale()).length,
      fetchingQueries: queries.filter(q => q.state.isFetching).length,
      errorQueries: queries.filter(q => q.state.isError).length,
      cacheSize: JSON.stringify(cache).length,
    };
  },
};

// ISR-like behavior for client-side caching
export const isrConfig = {
  // Revalidate intervals for different data types
  revalidateIntervals: {
    products: 60, // 1 minute
    collections: 300, // 5 minutes
    cart: 30, // 30 seconds
    user: 600, // 10 minutes
    search: 120, // 2 minutes
  },
  
  // Background revalidation
  enableBackgroundRevalidation: (queryKey: readonly unknown[], interval: number) => {
    return setInterval(() => {
      queryClient.invalidateQueries({ queryKey });
    }, interval * 1000);
  },
  
  // Stale-while-revalidate with custom intervals
  createSWRQuery: (queryKey: readonly unknown[], queryFn: () => Promise<any>, revalidateInterval?: number) => ({
    queryKey,
    queryFn,
    staleTime: 0, // Always stale for SWR behavior
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchInterval: revalidateInterval ? revalidateInterval * 1000 : false,
    refetchIntervalInBackground: true,
  }),
};

// Export types for TypeScript support
export type QueryKeys = typeof queryKeys;
export type CacheUtils = typeof cacheUtils;