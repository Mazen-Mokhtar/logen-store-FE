'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import OptimizedProductCard from './OptimizedProductCard';
import { useMessages } from '@/hooks/useMessages';
import { useProducts } from '@/hooks/useProducts';

export default function ProductGrid() {
  const messages = useMessages();
  const { products, loading, error, fetchMore, hasMore } = useProducts({
    limit: 8,
    inStock: true,
  });

  return (
    <section className="products-section py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {messages.products.title}
          </h2>
        </div>

        {loading && products.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="aspect-square bg-gray-200 rounded-2xl"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-xl text-red-500 mb-4">Failed to load products</p>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {products && products.length > 0 ? products.map((product, index) => (
                <OptimizedProductCard 
                  key={product._id} 
                  product={product} 
                  priority={index < 4}
                  className="product-card"
                />
              )) : (
                <div className="col-span-full text-center py-16">
                  <p className="text-xl text-gray-500">No products found</p>
                </div>
              )}
            </div>
            
            {hasMore && products && products.length > 0 && (
              <div className="text-center mt-12">
                <button
                  onClick={fetchMore}
                  disabled={loading}
                  className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More Products'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}