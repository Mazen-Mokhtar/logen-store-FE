import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { apiClient } from '@/lib/api';
import { prefetchRelatedProducts, prefetchProductReviews } from '@/lib/prefetch-utils';
import ProductDetailClient from './ProductDetailClient';
import ProductDetailSkeleton from '@/components/LoadingStates/ProductDetailSkeleton';

// Increase revalidation time to reduce rebuilds
export const revalidate = 3600; // 1 hour

interface ProductPageProps {
  params: {
    handle: string;
    locale: string;
  };
}

// Generate static params for popular products
export async function generateStaticParams() {
  // Pre-render only the most popular products
  const popularHandles = [
    'soundcore-q11i-wireless-over-ear',
    'anker-powercore-10000',
    'eufy-robovac-11s',
    'soundcore-liberty-air-2-pro',
    'anker-powerport-iii-nano'
  ];
  
  return popularHandles.map((handle) => ({
    handle,
  }));
}

// Generate metadata
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const product = await apiClient.getProductByHandle(params.handle);
    
    if (!product) {
      return {
        title: 'Product Not Found',
        description: 'The requested product could not be found.',
      };
    }

    const title = params.locale === 'ar' 
      ? product.title?.ar || product.title?.en 
      : product.title?.en || product.title?.ar;
    
    const description = params.locale === 'ar'
      ? product.description?.ar || product.description?.en
      : product.description?.en || product.description?.ar;

    return {
      title,
      description: description?.substring(0, 160),
      openGraph: {
        title,
        description: description?.substring(0, 160),
        images: product.images?.[0]?.secure_url ? [product.images[0].secure_url] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    const product = await apiClient.getProductByHandle(params.handle);
    
    if (!product) {
      notFound();
    }

    // Prefetch related data in parallel (don't await to avoid blocking)
    prefetchRelatedProducts(product._id).catch(() => {});
    prefetchProductReviews(product._id).catch(() => {});

    return (
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetailClient 
          locale={params.locale}
          product={product} 
          relatedProducts={[]}
        />
      </Suspense>
    );
  } catch (error) {
    console.error('Error loading product:', error);
    notFound();
  }
}