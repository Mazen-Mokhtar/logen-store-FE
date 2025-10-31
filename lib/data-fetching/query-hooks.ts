import { useQuery, useMutation, useQueryClient, useSuspenseQuery, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys, cacheUtils, isrConfig } from './react-query-config';
import { useCallback, useMemo } from 'react';

// Types for our e-commerce data
interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  variants: ProductVariant[];
  collections: string[];
  tags: string[];
  seo: {
    title: string;
    description: string;
  };
}

interface ProductVariant {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
}

interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image?: string;
  products: Product[];
  seo: {
    title: string;
    description: string;
  };
}

interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  product: Product;
  variant: ProductVariant;
}

// Product hooks with enterprise-grade caching
export const useProducts = (filters: Record<string, any> = {}) => {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/v1/products?${params}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

export const useProduct = (handle: string, options?: { suspense?: boolean; prefetch?: boolean }) => {
  const queryClient = useQueryClient();
  
  // Prefetch related data when product is fetched
  const queryFn = useCallback(async () => {
    const response = await fetch(`/api/v1/products/${handle}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    const product = await response.json();
    
    // Prefetch related products in the background
    if (options?.prefetch && product.collections?.length > 0) {
      setTimeout(() => {
        cacheUtils.prefetchCollection(product.collections[0]);
      }, 100);
    }
    
    return product;
  }, [handle, options?.prefetch]);
  
  if (options?.suspense) {
    return useSuspenseQuery({
      queryKey: queryKeys.products.detail(handle),
      queryFn,
    });
  }
  
  return useQuery({
    queryKey: queryKeys.products.detail(handle),
    queryFn,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000, // Keep product data longer
    refetchOnWindowFocus: false,
    enabled: !!handle,
  });
};

export const useProductReviews = (handle: string) => {
  return useQuery({
    queryKey: queryKeys.products.reviews(handle),
    queryFn: async () => {
      // First get the product to get its ID
      const productResponse = await fetch(`/api/v1/products/handle/${handle}`);
      if (!productResponse.ok) throw new Error('Failed to fetch product');
      const productData = await productResponse.json();
      const productId = productData.data._id;
      
      // Then fetch reviews using the product ID
      const response = await fetch(`/api/v1/ratings/product/${productId}/ratings`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // Reviews don't change often
    gcTime: 30 * 60 * 1000,
    enabled: !!handle,
  });
};

export const useRelatedProducts = (handle: string, limit = 4) => {
  return useQuery({
    queryKey: queryKeys.products.related(handle),
    queryFn: async () => {
      // For now, fetch all products and filter similar ones
      // This is a temporary solution until a proper related products endpoint is available
      const response = await fetch(`/api/v1/products?limit=${limit * 2}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      
      // Simple related products logic - return random products excluding the current one
      const relatedProducts = data.data?.filter((product: any) => product.handle !== handle).slice(0, limit) || [];
      
      return {
        success: true,
        data: relatedProducts
      };
    },
    staleTime: 15 * 60 * 1000, // Related products are fairly stable
    gcTime: 30 * 60 * 1000,
    enabled: !!handle,
  });
};

// Collection hooks
export const useCollections = (filters: Record<string, any> = {}) => {
  return useQuery({
    queryKey: queryKeys.collections.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/v1/collections?${params}`);
      if (!response.ok) throw new Error('Failed to fetch collections');
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // Collections change less frequently
    gcTime: 20 * 60 * 1000,
  });
};

export const useCollection = (handle: string, options?: { suspense?: boolean }) => {
  const queryFn = useCallback(async () => {
    const response = await fetch(`/api/v1/collections/${handle}`);
    if (!response.ok) throw new Error('Failed to fetch collection');
    return response.json();
  }, [handle]);
  
  if (options?.suspense) {
    return useSuspenseQuery({
      queryKey: queryKeys.collections.detail(handle),
      queryFn,
    });
  }
  
  return useQuery({
    queryKey: queryKeys.collections.detail(handle),
    queryFn,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    enabled: !!handle,
  });
};

export const useCollectionProducts = (
  handle: string, 
  filters: Record<string, any> = {},
  options?: { infinite?: boolean }
) => {
  if (options?.infinite) {
    return useInfiniteQuery({
      queryKey: queryKeys.collections.products(handle, filters),
      queryFn: async ({ pageParam = 1 }) => {
        const params = new URLSearchParams({ ...filters, page: pageParam.toString() });
        const response = await fetch(`/api/collections/${handle}/products?${params}`);
        if (!response.ok) throw new Error('Failed to fetch collection products');
        return response.json();
      },
      getNextPageParam: (lastPage, pages) => {
        return lastPage.hasNextPage ? pages.length + 1 : undefined;
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      enabled: !!handle,
    });
  }
  
  return useQuery({
    queryKey: queryKeys.collections.products(handle, filters),
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/collections/${handle}/products?${params}`);
      if (!response.ok) throw new Error('Failed to fetch collection products');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: !!handle,
  });
};

// Cart hooks with optimistic updates
export const useCart = () => {
  return useQuery({
    queryKey: queryKeys.cart.items(),
    queryFn: async () => {
      const response = await fetch('/api/v1/cart');
      if (!response.ok) throw new Error('Failed to fetch cart');
      return response.json();
    },
    staleTime: 30 * 1000, // Cart data is very dynamic
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, variantId, quantity }: { 
      productId: string; 
      variantId: string; 
      quantity: number; 
    }) => {
      const response = await fetch('/api/v1/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, variantId, quantity }),
      });
      if (!response.ok) throw new Error('Failed to add to cart');
      return response.json();
    },
    
    // Optimistic update
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.items() });
      
      const previousCart = queryClient.getQueryData(queryKeys.cart.items());
      
      // Optimistically update cart
      queryClient.setQueryData(queryKeys.cart.items(), (old: any) => {
        if (!old) return { items: [newItem] };
        
        const existingItemIndex = old.items.findIndex(
          (item: CartItem) => item.variantId === newItem.variantId
        );
        
        if (existingItemIndex >= 0) {
          const newItems = [...old.items];
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + newItem.quantity,
          };
          return { ...old, items: newItems };
        } else {
          return { ...old, items: [...old.items, newItem] };
        }
      });
      
      return { previousCart };
    },
    
    onError: (err, newItem, context) => {
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(queryKeys.cart.items(), context.previousCart);
      }
    },
    
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.items() });
    },
    
    meta: {
      successMessage: 'Added to cart!',
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const response = await fetch(`/api/v1/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      if (!response.ok) throw new Error('Failed to update cart item');
      return response.json();
    },
    
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.items() });
      
      const previousCart = queryClient.getQueryData(queryKeys.cart.items());
      
      queryClient.setQueryData(queryKeys.cart.items(), (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          items: old.items.map((item: CartItem) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        };
      });
      
      return { previousCart };
    },
    
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(queryKeys.cart.items(), context.previousCart);
      }
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.items() });
    },
  });
};

// Search hooks with debouncing
export const useSearch = (query: string, filters: Record<string, any> = {}) => {
  const debouncedQuery = useMemo(() => {
    if (query.length < 2) return '';
    return query;
  }, [query]);
  
  return useQuery({
    queryKey: queryKeys.search.results(debouncedQuery, filters),
    queryFn: async () => {
      const params = new URLSearchParams({ q: debouncedQuery, ...filters });
      const response = await fetch(`/api/v1/search?${params}`);
      if (!response.ok) throw new Error('Failed to search');
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // Search results are moderately fresh
    gcTime: 5 * 60 * 1000,
    enabled: debouncedQuery.length >= 2,
  });
};

export const useSearchSuggestions = (query: string) => {
  return useQuery({
    queryKey: queryKeys.search.suggestions(query),
    queryFn: async () => {
      const response = await fetch(`/api/v1/search/suggestions?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: query.length >= 1,
  });
};

// User hooks
export const useUser = () => {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: async () => {
      const response = await fetch('/api/v1/user/profile');
      if (!response.ok) {
        if (response.status === 401) return null; // Not authenticated
        throw new Error('Failed to fetch user profile');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: false, // Don't retry auth failures
  });
};

export const useUserOrders = () => {
  return useQuery({
    queryKey: queryKeys.user.orders(),
    queryFn: async () => {
      const response = await fetch('/api/v1/user/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Prefetch utilities for performance
export const usePrefetchProduct = () => {
  const queryClient = useQueryClient();
  
  return useCallback((handle: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.detail(handle),
      queryFn: async () => {
        const response = await fetch(`/api/v1/products/${handle}`);
        if (!response.ok) throw new Error('Failed to prefetch product');
        return response.json();
      },
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);
};

export const usePrefetchCollection = () => {
  const queryClient = useQueryClient();
  
  return useCallback((handle: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.collections.detail(handle),
      queryFn: async () => {
        const response = await fetch(`/api/collections/${handle}`);
        if (!response.ok) throw new Error('Failed to prefetch collection');
        return response.json();
      },
      staleTime: 10 * 60 * 1000,
    });
  }, [queryClient]);
};

// Batch prefetch for performance
export const useBatchPrefetch = () => {
  const prefetchProduct = usePrefetchProduct();
  const prefetchCollection = usePrefetchCollection();
  
  return useCallback(async (items: Array<{ type: 'product' | 'collection'; handle: string }>) => {
    const promises = items.map(item => {
      if (item.type === 'product') {
        return prefetchProduct(item.handle);
      } else {
        return prefetchCollection(item.handle);
      }
    });
    
    await Promise.allSettled(promises);
  }, [prefetchProduct, prefetchCollection]);
};

// Export types
export type { Product, ProductVariant, Collection, CartItem };