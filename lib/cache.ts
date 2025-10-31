import { unstable_cache } from 'next/cache';

// Cache configuration
export const CACHE_TAGS = {
  SEO: 'seo',
  HEALTH: 'health',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  TRANSLATIONS: 'translations',
} as const;

export const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;

// Generic cache wrapper
export function createCachedFunction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyParts: string[],
  options: {
    revalidate?: number;
    tags?: string[];
  } = {}
) {
  return unstable_cache(
    fn as any,
    keyParts,
    {
      revalidate: options.revalidate || CACHE_DURATIONS.MEDIUM,
      tags: options.tags || [],
    }
  );
}

// SEO data caching
export const getCachedSEOData = createCachedFunction(
  async (path: string, locale: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'}/seo?path=${encodeURIComponent(path)}&locale=${locale}`);
    if (!response.ok) {
      throw new Error('Failed to fetch SEO data');
    }
    return response.json();
  },
  ['seo-data'],
  {
    revalidate: CACHE_DURATIONS.LONG,
    tags: [CACHE_TAGS.SEO],
  }
);

// Health data caching
export const getCachedHealthData = createCachedFunction(
  async (type: 'basic' | 'detailed' | 'metrics' = 'basic') => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'}/health?type=${type}`);
    if (!response.ok) {
      throw new Error('Failed to fetch health data');
    }
    return response.json();
  },
  ['health-data'],
  {
    revalidate: CACHE_DURATIONS.SHORT,
    tags: [CACHE_TAGS.HEALTH],
  }
);

// Translation caching
export const getCachedTranslations = createCachedFunction(
  async (locale: string) => {
    try {
      const messages = await import(`../messages/${locale}.json`);
      return messages.default;
    } catch (error) {
      console.warn(`Failed to load translations for locale: ${locale}`);
      // Fallback to English
      const fallback = await import('../messages/en.json');
      return fallback.default;
    }
  },
  ['translations'],
  {
    revalidate: CACHE_DURATIONS.VERY_LONG,
    tags: [CACHE_TAGS.TRANSLATIONS],
  }
);

// Product data caching (placeholder for future implementation)
export const getCachedProducts = createCachedFunction(
  async (category?: string, limit?: number) => {
    // This would typically fetch from your product API
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (limit) params.append('limit', limit.toString());
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'}/products?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return response.json();
  },
  ['products'],
  {
    revalidate: CACHE_DURATIONS.MEDIUM,
    tags: [CACHE_TAGS.PRODUCTS],
  }
);

// Category data caching (placeholder for future implementation)
export const getCachedCategories = createCachedFunction(
  async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'}/categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    return response.json();
  },
  ['categories'],
  {
    revalidate: CACHE_DURATIONS.LONG,
    tags: [CACHE_TAGS.CATEGORIES],
  }
);

// Cache invalidation utilities
export async function revalidateCache(tags: string[]) {
  if (typeof window === 'undefined' && Array.isArray(tags) && tags.length > 0) {
    // Server-side cache revalidation
    const { revalidateTag } = await import('next/cache');
    tags.forEach(tag => revalidateTag(tag));
  }
}

export async function revalidatePath(path: string) {
  if (typeof window === 'undefined') {
    const { revalidatePath: nextRevalidatePath } = await import('next/cache');
    nextRevalidatePath(path);
  }
}

// Memory cache for client-side caching
class MemoryCache {
  private cache = new Map<string, { data: any; expiry: number }>();

  set(key: string, data: any, ttl: number = CACHE_DURATIONS.MEDIUM * 1000) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // Clean expired entries
  cleanup() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    for (const [key, item] of entries) {
      if (item.expiry < now) {
        this.cache.delete(key);
      }
    }
  }
}

// Client-side cache utilities for React Query
export const clientCacheUtils = {
  // Generate cache keys for products
  getProductCacheKey: (category?: string, page?: number, limit?: number, search?: string) => {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.set('category', category);
    if (page && page > 0) params.set('page', page.toString());
    if (limit && limit > 0) params.set('limit', limit.toString());
    if (search && search.trim()) params.set('search', search.trim());
    
    // Sort parameters for consistent cache keys
    const sortedParams = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    return ['products', sortedParams];
  },

  // Generate cache keys for categories
  getCategoryCacheKey: () => ['categories'],

  // Cache invalidation helpers
  invalidateProducts: (queryClient: any) => {
    queryClient.invalidateQueries({ 
      queryKey: ['products'],
      exact: false // Invalidate all product-related queries
    });
  },

  invalidateCategories: (queryClient: any) => {
    queryClient.invalidateQueries({ 
      queryKey: ['categories'],
      exact: false // Invalidate all category-related queries
    });
  },

  // Prefetch products for a category
  prefetchCategoryProducts: async (queryClient: any, category: string, apiClient: any) => {
    const cacheKey = clientCacheUtils.getProductCacheKey(category, 1, 12);
    await queryClient.prefetchQuery({
      queryKey: cacheKey,
      queryFn: () => apiClient.getProducts({ 
        category: category === 'all' ? undefined : category, 
        page: 1, 
        limit: 12 
      }),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    });
  },
};

export const memoryCache = new MemoryCache();

// Cleanup expired cache entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    memoryCache.cleanup();
  }, 5 * 60 * 1000);
}