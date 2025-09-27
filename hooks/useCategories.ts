import { useState, useEffect } from 'react';
import { apiClient, Category, handleApiError } from '@/lib/api';

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

export function useCategories(options: UseCategoriesOptions = {}): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    page = 1,
    limit = 50,
    search,
    type,
    sort = '-createdAt',
    autoFetch = true,
  } = options;

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.getCategories({
        page,
        limit,
        search,
        type,
        sort,
      });

      setCategories(result);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchCategories();
    }
  }, [search, type, sort, autoFetch]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
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