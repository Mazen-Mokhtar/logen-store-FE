import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { apiClient } from '@/lib/api';

export function useCategoryPrefetch() {
  const queryClient = useQueryClient();

  const prefetchProductsByCategory = useCallback(
    async (categoryId: string) => {
      if (!categoryId) return;

      // Prefetch products for the selected category
      await queryClient.prefetchQuery({
        queryKey: ['products', { category: categoryId, page: 1, limit: 20 }],
        queryFn: () => apiClient.getProducts({
          category: categoryId,
          page: 1,
          limit: 20,
        }),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    },
    [queryClient]
  );

  const prefetchCategory = useCallback(
    async (categoryId: string) => {
      if (!categoryId) return;

      // Prefetch category details if needed
      await queryClient.prefetchQuery({
        queryKey: ['category', categoryId],
        queryFn: () => apiClient.getCategoryById(categoryId),
        staleTime: 10 * 60 * 1000, // 10 minutes
      });
    },
    [queryClient]
  );

  return {
    prefetchProductsByCategory,
    prefetchCategory,
  };
}