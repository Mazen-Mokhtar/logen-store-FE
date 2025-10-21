import { useState, useEffect } from 'react';
import { apiClient, Product, handleApiError } from '@/lib/api';

interface UseProductsOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  inStock?: boolean;
  sort?: string;
  autoFetch?: boolean;
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

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const {
    page = 1,
    limit = 20,
    search,
    category,
    inStock,
    sort,
    autoFetch = true,
  } = options;

  const fetchProducts = async (reset = true) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.getProducts({
        page: reset ? 1 : page,
        limit,
        search,
        category,
        inStock,
        sort,
      });

      if (reset) {
        setProducts(Array.isArray(result.products) ? result.products : []);
      } else {
        setProducts(prev => [...prev, ...(Array.isArray(result.products) ? result.products : [])]);
      }
      
      setPagination(result.pagination);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchMore = async () => {
    if (!pagination || pagination.page >= pagination.totalPages) return;
    
    try {
      const result = await apiClient.getProducts({
        page: pagination.page + 1,
        limit,
        search,
        category,
        inStock,
        sort,
      });

      setProducts(prev => [...prev, ...(Array.isArray(result.products) ? result.products : [])]);
      setPagination(result.pagination);
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, [search, category, inStock, sort, autoFetch]);

  return {
    products,
    loading,
    error,
    pagination,
    refetch: () => fetchProducts(true),
    fetchMore,
    hasMore: pagination ? pagination.page < pagination.totalPages : false,
  };
}

export function useProduct(productId?: string, handle?: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
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
  };

  useEffect(() => {
    fetchProduct();
  }, [productId, handle]);

  return {
    product,
    loading,
    error,
    refetch: fetchProduct,
  };
}