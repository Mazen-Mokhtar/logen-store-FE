import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, Product, handleApiError } from '@/lib/api';
import { clientCacheUtils } from '@/lib/cache';
import { useOptimizedCallback } from '@/lib/memoization-optimization';
import { queryKeys } from '@/lib/data-fetching/react-query-config';

interface UseProductsOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  inStock?: boolean;
  sort?: string;
  autoFetch?: boolean;
  infinite?: boolean;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  refetch: () => Promise<void>;
  fetchMore: () => Promise<void>;
  hasMore: boolean;
}

// Optimized fetch function with better error handling
async function fetchProducts(params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  inStock?: boolean;
  sort?: string;
}) {
  try {
    const result = await apiClient.getProducts(params);
    return {
      products: Array.isArray(result.products) ? result.products : [],
      pagination: result.pagination
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const queryClient = useQueryClient();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  const {
    page = 1,
    limit = 20,
    search,
    category,
    inStock,
    sort,
    autoFetch = true,
    infinite = false,
  } = options;

  // Memoize query parameters to prevent unnecessary re-renders
  const queryParams = useMemo(() => ({
    page: currentPage,
    limit,
    search: search?.trim() || undefined,
    category: category === 'all' ? undefined : category,
    inStock,
    sort,
  }), [currentPage, limit, search, category, inStock, sort]);

  // Create stable query key
  const queryKey = useMemo(() => 
    clientCacheUtils.getProductCacheKey(queryParams.category, queryParams.page, queryParams.limit, queryParams.search),
    [queryParams]
  );

  // Enhanced query with better caching and prefetching
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetchProducts(queryParams);
      
      // Intelligent prefetching: prefetch next page if current page has full results
      if (response.products.length === limit && response.pagination.totalPages > currentPage) {
        const nextPageKey = clientCacheUtils.getProductCacheKey(
          queryParams.category, 
          currentPage + 1, 
          limit, 
          queryParams.search
        );
        
        // Only prefetch if not already cached
        if (!queryClient.getQueryData(nextPageKey)) {
          queryClient.prefetchQuery({
            queryKey: nextPageKey,
            queryFn: () => fetchProducts({
              ...queryParams,
              page: currentPage + 1
            }),
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
          });
        }
      }
      
      return response;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes - balanced freshness
    gcTime: 10 * 60 * 1000, // 10 minutes - longer cache retention
    enabled: autoFetch,
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: false, // Use cached data on mount
    refetchOnReconnect: true, // Refetch when reconnecting
    retry: (failureCount, error) => {
      // Smart retry logic: don't retry on 4xx errors
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500) return false;
      }
      return failureCount < 2; // Reduced retry attempts
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Faster retry with cap
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });

  // Optimized products state management
  useEffect(() => {
    if (query.data?.products) {
      if (currentPage === 1) {
        // First page - replace all products
        setAllProducts(query.data.products);
      } else {
        // Subsequent pages - append unique products only
        setAllProducts(prev => {
          const existingIds = new Set(prev.map(p => p._id));
          const newProducts = query.data.products.filter(p => !existingIds.has(p._id));
          return newProducts.length > 0 ? [...prev, ...newProducts] : prev;
        });
      }
    } else if (query.data && Array.isArray(query.data.products) && query.data.products.length === 0 && currentPage === 1) {
      // Handle empty results for first page only
      setAllProducts([]);
    }
  }, [query.data, currentPage]);

  // Optimized filter change handling
  useEffect(() => {
    // Only reset if filters actually changed (not on initial load)
    const isInitialLoad = currentPage === 1 && allProducts.length === 0;
    
    if (!isInitialLoad) {
      setCurrentPage(1);
      setAllProducts([]);
      
      // Invalidate related queries more efficiently
      queryClient.invalidateQueries({
        queryKey: ['products'],
        exact: false,
        refetchType: 'active' // Only refetch active queries
      });
    }
  }, [category, search, inStock, sort, queryClient, limit]);

  // Optimized fetchMore function
  const fetchMore = useOptimizedCallback(async () => {
    if (!query.data?.pagination || query.data.pagination.page >= query.data.pagination.totalPages || query.isFetching) {
      return;
    }
    
    setCurrentPage(prev => prev + 1);
  }, [query.data, query.isFetching], 'fetchMore');

  // Optimized refetch function
  const refetch = useOptimizedCallback(async () => {
    // Reset to first page and clear products
    setCurrentPage(1);
    setAllProducts([]);
    
    // Refetch with fresh data
    const result = await query.refetch();
    return result;
  }, [query.refetch], 'refetch');

  // Memoized return values
  const returnValue = useMemo(() => ({
    products: allProducts,
    loading: query.isLoading || (query.isFetching && currentPage === 1),
    error: query.error ? handleApiError(query.error) : null,
    pagination: query.data?.pagination || null,
    refetch,
    fetchMore,
    hasMore: query.data?.pagination ? query.data.pagination.page < query.data.pagination.totalPages : false,
  }), [allProducts, query.isLoading, query.isFetching, currentPage, query.error, query.data, refetch, fetchMore]);

  return returnValue;
}

// Optimized single product hook
export function useProduct(productId?: string, handle?: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useOptimizedCallback(async () => {
    if (!productId && !handle) return;

    setLoading(true);
    setError(null);

    try {
      let result: Product;
      if (handle) {
        result = await apiClient.getProductByHandle(handle);
      } else if (productId) {
        result = await apiClient.getProductById(productId);
      } else {
        throw new Error('Product ID or handle is required');
      }

      setProduct(result);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to fetch product:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [productId, handle], 'fetchProduct');

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return useMemo(() => ({
    product,
    loading,
    error,
    refetch: fetchProduct,
  }), [product, loading, error, fetchProduct]);
}