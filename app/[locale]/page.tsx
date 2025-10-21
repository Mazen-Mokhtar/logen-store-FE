import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/LoadingSpinner';
import SEOHead from '@/components/SEOHead';

// Lazy load heavy components for better performance
const HeroCarousel = dynamic(() => import('@/components/HeroCarousel'), {
  loading: () => (
    <div className="h-screen bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
        <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-48 mx-auto"></div>
      </div>
    </div>
  ),
  ssr: false,
});

const CategoryStrip = dynamic(() => import('@/components/CategoryStrip'), {
  loading: () => (
    <div className="w-full h-32 bg-gray-100 animate-pulse rounded-lg" />
  ),
});

const ProductGrid = dynamic(() => import('@/components/ProductGrid'), {
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="loading-skeleton h-80 rounded-lg" />
      ))}
    </div>
  ),
});

interface HomePageProps {
  params: {
    locale: string;
  };
}

export default function HomePage({ params }: HomePageProps) {
  const { locale } = params;

  return (
    <>
      <SEOHead
        title="Home"
        description="Discover our latest collection of premium products with fast shipping and excellent customer service."
        path={`/${locale}`}
        type="website"
      />
      
      <main className="min-h-screen">
        {/* Hero Section - Critical above-the-fold content */}
        <section className="relative">
          <HeroCarousel />
        </section>

        {/* Category Strip */}
        <section className="py-8 px-4 max-w-7xl mx-auto">
          <Suspense fallback={
            <div className="w-full h-32 bg-gray-100 animate-pulse rounded-lg" />
          }>
            <CategoryStrip />
          </Suspense>
        </section>

        {/* Featured Products */}
        <section className="py-8 px-4 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Featured Products
          </h2>
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="loading-skeleton h-80 rounded-lg" />
              ))}
            </div>
          }>
            <ProductGrid />
          </Suspense>
        </section>
      </main>
    </>
  );
}