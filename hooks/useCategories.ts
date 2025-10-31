import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, Category, handleApiError } from '@/lib/api';
import { queryKeys } from '@/lib/data-fetching/react-query-config';

interface UseCategoriesOptions {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  sort?: string;
  autoFetch?: boolean;
}

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
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

export function useCategories(options: UseCategoriesOptions = {}): UseCategoriesReturn {
  const queryClient = useQueryClient();
  
  const {
    page = 1,
    limit = 50,
    search,
    type,
    sort = '-createdAt',
    autoFetch = true,
  } = options;

  // Create query key based on filters
  const queryKey = queryKeys.collections.list({
    page,
    limit,
    search,
    type,
    sort,
  });

  const query = useQuery({
    queryKey,
    queryFn: () => fetchCategories({
      page,
      limit,
      search,
      type,
      sort,
    }),
    enabled: autoFetch,
    staleTime: 10 * 60 * 1000, // 10 minutes - categories change less frequently
    gcTime: 30 * 60 * 1000, // 30 minutes - keep categories in cache longer
    refetchOnWindowFocus: false, // Categories don't change often
    retry: 2,
  });

  return {
    categories: query.data || [],
    loading: query.isLoading,
    error: query.error ? handleApiError(query.error) : null,
    refetch: query.refetch,
  };
}

export function useCategory(categoryId?: string) {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategory = async () => {
    if (!categoryId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.getCategoryById(categoryId);
      setCategory(result);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [categoryId]);

  return {
    category,
    loading,
    error,
    refetch: fetchCategory,
  };
}