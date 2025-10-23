'use client';

import { motion } from 'framer-motion';

export default function ProductDetailSkeleton() {
  return (
    <div className="pt-20 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          {/* Back button skeleton */}
          <div className="h-6 bg-gray-200 rounded w-32 mb-8"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Image gallery skeleton */}
            <div className="space-y-4">
              <motion.div 
                className="aspect-square bg-gray-200 rounded-2xl"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div className="flex space-x-2">
                {[...Array(4)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    className="w-20 h-20 bg-gray-200 rounded-lg"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
            </div>
            
            {/* Product info skeleton */}
            <div className="space-y-6">
              <motion.div 
                className="h-8 bg-gray-200 rounded w-3/4"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div 
                className="h-6 bg-gray-200 rounded w-1/2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              />
              
              {/* Rating skeleton */}
              <div className="flex items-center space-x-2">
                {[...Array(5)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    className="w-5 h-5 bg-gray-200 rounded"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.05 }}
                  />
                ))}
                <motion.div 
                  className="h-4 bg-gray-200 rounded w-16 ml-2"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                />
              </div>
              
              {/* Description skeleton */}
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    className="h-4 bg-gray-200 rounded"
                    style={{ width: `${100 - i * 10}%` }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
              
              {/* Price skeleton */}
              <motion.div 
                className="h-8 bg-gray-200 rounded w-32"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              />
              
              {/* Quantity and Add to Cart skeleton */}
              <div className="space-y-4">
                <motion.div 
                  className="h-12 bg-gray-200 rounded-full w-32"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                />
                <motion.div 
                  className="h-14 bg-gray-200 rounded-full w-full"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}