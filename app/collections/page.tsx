'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { useMessages } from '@/hooks/useMessages';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';

// Lazy load product cards for better performance
const LazyProductCard = dynamic(() => import('@/components/ProductCard'), {
  loading: () => (
    <div className="animate-pulse space-y-4">
      <div className="aspect-square bg-gray-200 rounded-2xl"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  ),
});


export default function CollectionsPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState('');
  const messages = useMessages();
  
  const { categories } = useCategories();
  const { products, loading, error, refetch } = useProducts({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    search: searchTerm || undefined,
    limit: 20,
  });

  const allCategories = [
    { _id: 'all', name: 'All Products', type: 'all' },
    ...categories,
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
            Discover our complete collection of premium fashion pieces
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
            placeholder="Search products..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
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
          {loading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="aspect-square bg-gray-200 rounded-2xl"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-full text-center py-16">
              <p className="text-xl text-red-500 mb-4">Failed to load products</p>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={refetch}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            products.map((product) => (
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

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}