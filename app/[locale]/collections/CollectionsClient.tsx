'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, usePathname } from 'next/navigation';
import { useMessages } from '@/hooks/useMessages';
import { useProducts } from '@/hooks/useProducts';

// Lazy load components for better performance
const LazyProductCard = dynamic(() => import('@/components/ProductCard'), {
  loading: () => (
    <div className="animate-pulse space-y-4">
      <div className="aspect-square bg-gray-200 rounded-2xl"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  ),
});

interface CollectionsClientProps {
  locale: string;
  initialCategories: any[];
  initialProducts: any[];
  searchParams: { category?: string; search?: string };
}

// Fetch categories with React Query
async function fetchCategories() {
  const response = await fetch('/api/category/AllCategory');
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  
  const data = await response.json();
  const categories = data.categories || data.data || data || [];
  return Array.isArray(categories) ? categories : [];
}

export default function CollectionsClient({
  locale,
  initialCategories,
  initialProducts,
  searchParams,
}: CollectionsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const initialCategory = searchParams.category || 'all';
  const initialSearch = searchParams.search || '';
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  
  const messages = useMessages();

  // Use the useProducts hook with pagination support
  const { 
    products, 
    loading: productsLoading, 
    error: productsError, 
    pagination,
    fetchMore,
    hasMore,
    refetch: refetchProducts
  } = useProducts({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    search: debouncedSearch || undefined,
    limit: 20,
    autoFetch: true,
  });
  
  // Update URL when category or search changes
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (selectedCategory && selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }
    
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    }
    
    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    
    // Only update if URL is different
    const currentUrl = window.location.pathname + window.location.search;
    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [selectedCategory, debouncedSearch, pathname, router]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch categories with React Query
  const { data: categoriesData = initialCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    initialData: initialCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Ensure categories is always an array
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const allCategories = [
    { _id: 'all', name: 'All Products', type: 'all' },
    ...(Array.isArray(categories) ? categories : []),
  ];

  return (
    <div className="pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {messages.nav.collections}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {locale === 'ar' 
              ? 'اكتشف مجموعتنا الكاملة من قطع الأزياء المميزة'
              : 'Discover our complete collection of premium fashion pieces'
            }
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-md mx-auto mb-8"
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={locale === 'ar' ? 'البحث عن المنتجات...' : 'Search products...'}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          />
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {allCategories.map((category) => (
            <button
              key={category._id}
              onClick={() => setSelectedCategory(category._id)}
              className={`px-6 py-3 rounded-full font-medium transition-colors ${
                selectedCategory === category._id
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="products-section grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
        >
          {productsLoading && products.length === 0 ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="aspect-square bg-gray-200 rounded-2xl"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
          ) : productsError ? (
            <div className="col-span-full text-center py-16">
              <p className="text-xl text-red-500 mb-4">
                {locale === 'ar' ? 'فشل في تحميل المنتجات' : 'Failed to load products'}
              </p>
              <p className="text-gray-600 mb-4">{productsError}</p>
              <button
                onClick={() => refetchProducts()}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                {locale === 'ar' ? 'حاول مرة أخرى' : 'Try Again'}
              </button>
            </div>
          ) : (
            Array.isArray(products) && products.map((product: any) => (
              <div
                key={product._id}
                className="product-card"
              >
                <Suspense fallback={
                  <div className="animate-pulse space-y-4">
                    <div className="aspect-square bg-gray-200 rounded-2xl"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                }>
                  <LazyProductCard product={product} />
                </Suspense>
              </div>
            ))
          )}
        </motion.div>

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
}