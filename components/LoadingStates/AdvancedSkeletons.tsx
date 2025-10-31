'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

// Base skeleton animation variants
const skeletonVariants = {
  loading: {
    opacity: [0.4, 0.8, 0.4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  loaded: {
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
};

// Shimmer effect for more realistic loading
const shimmerVariants = {
  loading: {
    x: ['-100%', '100%'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

interface SkeletonProps {
  className?: string;
  animate?: boolean;
  shimmer?: boolean;
}

// Base Skeleton Component
export const Skeleton = memo(({ className = '', animate = true, shimmer = false }: SkeletonProps) => (
  <motion.div
    className={`bg-gray-200 rounded ${className}`}
    variants={animate ? skeletonVariants : undefined}
    animate={animate ? "loading" : undefined}
    style={{ position: 'relative', overflow: 'hidden' }}
  >
    {shimmer && (
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        variants={shimmerVariants}
        animate="loading"
        style={{ willChange: 'transform' }}
      />
    )}
  </motion.div>
));

Skeleton.displayName = 'Skeleton';

// Product Card Skeleton with enhanced realism
export const ProductCardSkeleton = memo(() => (
  <motion.div
    className="group"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-square mb-4">
      <Skeleton className="w-full h-full" shimmer />
      
      {/* Sale badge skeleton */}
      <div className="absolute top-4 left-4">
        <Skeleton className="w-12 h-6 rounded-full" />
      </div>
      
      {/* Add to cart button skeleton */}
      <div className="absolute bottom-4 left-4 right-4">
        <Skeleton className="w-full h-12 rounded-full" />
      </div>
    </div>
    
    {/* Product info skeleton */}
    <div className="space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="w-3 h-3 rounded-full" />
        ))}
        <Skeleton className="h-3 w-8 ml-2" />
      </div>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  </motion.div>
));

ProductCardSkeleton.displayName = 'ProductCardSkeleton';

// Product Grid Skeleton
export const ProductGridSkeleton = memo(({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[...Array(count)].map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
));

ProductGridSkeleton.displayName = 'ProductGridSkeleton';

// Enhanced Product Detail Skeleton
export const ProductDetailSkeleton = memo(() => (
  <motion.div
    className="container mx-auto px-4 py-8"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Image Gallery Skeleton */}
      <div className="space-y-4">
        <Skeleton className="w-full aspect-square rounded-2xl" shimmer />
        <div className="flex space-x-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="w-20 h-20 rounded-lg flex-shrink-0" />
          ))}
        </div>
      </div>
      
      {/* Product Info Skeleton */}
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="w-4 h-4 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
        
        {/* Description */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
          <Skeleton className="h-5 w-4/5" />
        </div>
        
        {/* Variants */}
        <div className="space-y-4">
          <Skeleton className="h-5 w-20" />
          <div className="flex space-x-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="w-12 h-12 rounded-lg" />
            ))}
          </div>
        </div>
        
        {/* Quantity and Add to Cart */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-12 w-32" />
          </div>
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    </div>
    
    {/* Related Products Section */}
    <div className="mt-16">
      <Skeleton className="h-8 w-48 mb-8" />
      <ProductGridSkeleton count={4} />
    </div>
  </motion.div>
));

ProductDetailSkeleton.displayName = 'ProductDetailSkeleton';

// Header Skeleton
export const HeaderSkeleton = memo(() => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16 lg:h-20">
        <Skeleton className="h-12 w-32" />
        
        <nav className="hidden md:flex items-center space-x-8">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-5 w-20" />
          ))}
        </nav>
        
        <div className="flex items-center space-x-4">
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  </header>
));

HeaderSkeleton.displayName = 'HeaderSkeleton';

// Collections Page Skeleton
export const CollectionsSkeleton = memo(() => (
  <motion.div
    className="container mx-auto px-4 py-8"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    {/* Hero Section */}
    <div className="mb-12">
      <Skeleton className="h-64 w-full rounded-3xl mb-6" shimmer />
      <div className="text-center space-y-4">
        <Skeleton className="h-10 w-64 mx-auto" />
        <Skeleton className="h-5 w-96 mx-auto" />
      </div>
    </div>
    
    {/* Filters */}
    <div className="flex flex-wrap gap-4 mb-8">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-10 w-24 rounded-full" />
      ))}
    </div>
    
    {/* Products Grid */}
    <ProductGridSkeleton count={12} />
  </motion.div>
));

CollectionsSkeleton.displayName = 'CollectionsSkeleton';

// Cart Drawer Skeleton
export const CartDrawerSkeleton = memo(() => (
  <div className="p-6 space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-6 w-6 rounded-full" />
    </div>
    
    {/* Cart Items */}
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
    
    {/* Total and Checkout */}
    <div className="border-t pt-4 space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  </div>
));

CartDrawerSkeleton.displayName = 'CartDrawerSkeleton';

// Page Transition Skeleton
export const PageTransitionSkeleton = memo(() => (
  <motion.div
    className="fixed inset-0 z-50 bg-white flex items-center justify-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    <div className="text-center space-y-4">
      <motion.div
        className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full mx-auto"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <Skeleton className="h-4 w-32 mx-auto" />
    </div>
  </motion.div>
));

PageTransitionSkeleton.displayName = 'PageTransitionSkeleton';

// Progressive Image Skeleton
export const ImageSkeleton = memo(({ 
  aspectRatio = 'aspect-square',
  className = '',
  showShimmer = true 
}: {
  aspectRatio?: string;
  className?: string;
  showShimmer?: boolean;
}) => (
  <div className={`relative overflow-hidden bg-gray-200 rounded ${aspectRatio} ${className}`}>
    <Skeleton className="w-full h-full" shimmer={showShimmer} />
    
    {/* Loading indicator */}
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className="w-8 h-8 border-2 border-gray-300 border-t-gray-500 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  </div>
));

ImageSkeleton.displayName = 'ImageSkeleton';

// Search Results Skeleton
export const SearchResultsSkeleton = memo(() => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-5 w-24" />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  </div>
));

SearchResultsSkeleton.displayName = 'SearchResultsSkeleton';