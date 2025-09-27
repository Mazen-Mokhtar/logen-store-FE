import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Critical above-the-fold component loaded immediately
import HeroCarousel from '@/components/HeroCarousel';

// Lazy load below-the-fold components
const CategoryStrip = dynamic(() => import('@/components/CategoryStrip'), {
  loading: () => (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-12"></div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
});

const ProductGrid = dynamic(() => import('@/components/ProductGrid'), {
  loading: () => (
    <div className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-12"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-2xl"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <>
      <HeroCarousel />
      <Suspense fallback={null}>
        <CategoryStrip />
      </Suspense>
      <Suspense fallback={null}>
        <ProductGrid />
      </Suspense>
    </>
  );
}
