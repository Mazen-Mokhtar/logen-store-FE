'use client';

import { motion } from 'framer-motion';

export default function ProductCardSkeleton() {
  return (
    <div className="group">
      <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-square">
        <motion.div 
          className="w-full h-full bg-gray-200"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
      
      <div className="mt-4 space-y-2">
        <motion.div 
          className="h-4 bg-gray-200 rounded w-3/4"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
        />
        <motion.div 
          className="h-3 bg-gray-200 rounded w-1/2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div 
          className="h-5 bg-gray-200 rounded w-20"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
        />
      </div>
    </div>
  );
}