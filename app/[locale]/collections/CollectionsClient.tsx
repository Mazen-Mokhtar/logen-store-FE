'use client';

import { useState, useEffect, memo, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, usePathname } from 'next/navigation';
import { useMessages } from '@/hooks/useMessages';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useCategoryPrefetch } from '@/hooks/useCategoryPrefetch';
import { 
  useOptimizedCallback, 
  useOptimizedMemo, 
  useConcurrentFeatures, 
  useComponentPerformance,
  useVirtualizedList,
  memoizationUtils 
} from '@/lib/memoization-optimization';

// Lazy load components for better performance
const LazyOptimizedProductCard = dynamic(() => import('@/components/OptimizedProductCard'), {
  loading: () => (
    <div className="animate-pulse space-y-4">
      <div className="aspect-square bg-gray-200 rounded-2xl"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  ),
});

// Memoized OptimizedProductCard component
const MemoizedProductCard = memo(LazyOptimizedProductCard, (prevProps, nextProps) => {
  return prevProps.product._id === nextProps.product._id &&
         prevProps.product.title === nextProps.product.title &&
         prevProps.product.price === nextProps.product.price &&
         prevProps.product.images?.[0]?.secure_url === nextProps.product.images?.[0]?.secure_url;
});

MemoizedProductCard.displayName = 'MemoizedProductCard';

// Memoized Category Button component
const CategoryButton = memo(({ 
  category, 
  isSelected, 
  onClick 
}: { 
  category: any; 
  isSelected: boolean; 
  onClick: () => void; 
}) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 rounded-full font-medium transition-colors ${
      isSelected
        ? 'bg-black text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    {category.name}
  </button>
));

CategoryButton.displayName = 'CategoryButton';

// Memoized Product Grid component
const ProductGrid = memo(({ 
  products, 
  productsLoading, 
  productsError, 
  locale, 
  refetchProducts 
}: {
  products: any[];
  productsLoading: boolean;
  productsError: string | null;
  locale: string;
  refetchProducts: () => void;
}) => {
  if (productsLoading && products.length === 0) {
    return (
      <>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse space-y-4">
            <div className="aspect-square bg-gray-200 rounded-2xl"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </>
    );
  }

  if (productsError) {
    return (
      <div className="col-span-full text-center py-16">
        <p className="text-xl text-red-500 mb-4">
          {locale === 'ar' ? 'فشل في تحميل المنتجات' : 'Failed to load products'}
        </p>
        <p className="text-gray-600 mb-4">{productsError}</p>
        <button
          onClick={refetchProducts}
          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          {locale === 'ar' ? 'حاول مرة أخرى' : 'Try Again'}
        </button>
      </div>
    );
  }

  return (
    <>
      {Array.isArray(products) && products.map((product: any, index: number) => (
        <MemoizedProductCard 
          key={product._id}
          product={product} 
          priority={index < 4}
          className="product-card"
        />
      ))}
    </>
  );
});

ProductGrid.displayName = 'ProductGrid';

interface CollectionsClientProps {
  locale: string;
  initialCategories: any[];
  initialProducts: any[];
  searchParams: { category?: string; search?: string };
}

// Remove the manual fetchCategories function since we're using the hook

const CollectionsClient = memo(({
  locale,
  initialCategories,
  initialProducts,
  searchParams,
}: CollectionsClientProps) => {
  // Performance monitoring
  useComponentPerformance('CollectionsClient');
  
  // React 18 concurrency features
  const { startTransition, isPending, deferredValue } = useConcurrentFeatures();
  
  const router = useRouter();
  const pathname = usePathname();
  const initialCategory = searchParams.category || 'all';
  const initialSearch = searchParams.search || '';
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  
  // Add state to track if this is the initial render
  const [hasAnimated, setHasAnimated] = useState(false);
  const isInitialRender = useRef(true);
  
  // Deferred search term for better performance
  const deferredSearchTerm = deferredValue(searchTerm);
  
  const messages = useMessages();

  // Set hasAnimated to true after initial render
  useEffect(() => {
    if (isInitialRender.current) {
      const timer = setTimeout(() => {
        setHasAnimated(true);
        isInitialRender.current = false;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // Memoized search parameters
  const searchParamsOptimized = useOptimizedMemo(() => ({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    search: debouncedSearch || undefined,
    limit: 20,
    autoFetch: true,
  }), [selectedCategory, debouncedSearch], 'searchParams');

  // Use the useProducts hook with pagination support
  const { 
    products, 
    loading: productsLoading, 
    error: productsError, 
    pagination,
    fetchMore,
    hasMore,
    refetch: refetchProducts
  } = useProducts(searchParamsOptimized);

  // Debug logging for development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('CollectionsClient - Category changed:', selectedCategory);
      console.log('CollectionsClient - Products count:', products?.length || 0);
      console.log('CollectionsClient - Loading:', productsLoading);
      console.log('CollectionsClient - Error:', productsError);
    }
  }, [selectedCategory, products, productsLoading, productsError]);
  
  // Update URL when category or search changes
  useEffect(() => {
    // Skip URL update during initial render to prevent conflicts
    if (selectedCategory === initialCategory && debouncedSearch === initialSearch) {
      return;
    }

    const params = new URLSearchParams();
    
    if (selectedCategory && selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }
    
    if (debouncedSearch && debouncedSearch.trim()) {
      params.set('search', debouncedSearch.trim());
    }
    
    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    
    // Only update if URL is different and we're in the browser
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.pathname + window.location.search;
      if (newUrl !== currentUrl) {
        // Use startTransition for better performance
        startTransition(() => {
          router.replace(newUrl, { scroll: false });
        });
      }
    }
  }, [selectedCategory, debouncedSearch, pathname, router, initialCategory, initialSearch, startTransition]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch categories with React Query - using the new cached hook
  const { 
    categories: categoriesData = initialCategories,
    loading: categoriesLoading,
    error: categoriesError 
  } = useCategories({
    autoFetch: true,
    limit: 50,
  });

  // Ensure categories is always an array with fallback to initial data
  const categories = Array.isArray(categoriesData) ? categoriesData : (Array.isArray(initialCategories) ? initialCategories : []);

  // Memoized categories processing
  const allCategories = useOptimizedMemo(() => [
    { _id: 'all', name: 'All Products', type: 'all' },
    ...(Array.isArray(categories) ? categories : []),
  ], [categories], 'allCategories');

  // Extract category IDs for prefetching
  const categoryIds = useOptimizedMemo(() => 
    categories.map(cat => cat._id).filter(Boolean), 
    [categories], 
    'categoryIds'
  );

  // Use category prefetching for better performance
  const { prefetchCategoryProducts } = useCategoryPrefetch({
    categories: categoryIds,
    enabled: true,
    prefetchDelay: 500, // Prefetch after 500ms
  });

  // Optimized callbacks
  const handleCategorySelect = useOptimizedCallback((categoryId: string) => {
    startTransition(() => {
      setSelectedCategory(categoryId);
      // Don't force refetch here, let the useEffect handle it naturally
    });
  }, [startTransition], 'handleCategorySelect');

  const handleSearchChange = useOptimizedCallback((value: string) => {
    startTransition(() => {
      setSearchTerm(value);
    });
  }, [startTransition], 'handleSearchChange');

  return (
    <div className="pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {messages.nav.collections}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {locale === 'ar' 
              ? 'اكتشف مجموعتنا الكاملة من قطع الأزياء المميزة'
              : 'Discover our complete collection of premium fashion pieces'
            }
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={locale === 'ar' ? 'البحث عن المنتجات...' : 'Search products...'}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {allCategories.map((category) => (
            <CategoryButton
              key={category._id}
              category={category}
              isSelected={selectedCategory === category._id}
              onClick={() => handleCategorySelect(category._id)}
            />
          ))}
        </div>

        {/* Products Grid */}
        <section className="products-section py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              <ProductGrid
                products={products}
                productsLoading={productsLoading}
                productsError={productsError}
                locale={locale}
                refetchProducts={refetchProducts}
              />
            </div>
          </div>
        </section>

        {/* Load More Button */}
        {hasMore && products && products.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={fetchMore}
              disabled={productsLoading}
              className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {productsLoading ? (locale === 'ar' ? 'جاري التحميل...' : 'Loading...') : (locale === 'ar' ? 'تحميل المزيد' : 'Load More Products')}
            </button>
          </div>
        )}

        {/* Pagination Info */}
        {pagination && products.length > 0 && (
          <div className="text-center mt-6 text-sm text-gray-500">
            {locale === 'ar' 
              ? `عرض ${products.length} من ${pagination.total || 0} منتج`
              : `Showing ${products.length} of ${pagination.total || 0} products`
            }
          </div>
        )}

        {!productsLoading && !productsError && products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">
              {locale === 'ar' 
                ? 'لم يتم العثور على منتجات في هذه الفئة.'
                : 'No products found in this category.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

CollectionsClient.displayName = 'CollectionsClient';

export default CollectionsClient;