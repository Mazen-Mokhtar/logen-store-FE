import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import CollectionsClient from './CollectionsClient';
import { config } from '@/lib/config';
import { apiClient } from '@/lib/api';

interface PageProps {
  params: { locale: string };
  searchParams: { category?: string; search?: string };
}

// Enable ISR with revalidation every 60 seconds
export const revalidate = 60;

// Generate static params for supported locales
export async function generateStaticParams() {
  return config.i18n.locales.map((locale) => ({
    locale,
  }));
}



// Fetch initial data at build time for ISR
async function getInitialData() {
  try {
    // Fetch both categories and initial products in parallel for better performance
    const [categoriesResponse, productsResponse] = await Promise.allSettled([
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1'}/category/AllCategory?limit=50`, {
        next: { 
          revalidate: 300, // 5 minutes ISR
          tags: ['categories'] 
        },
        headers: {
          'Content-Type': 'application/json',
        }
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1'}/products?limit=20&page=1`, {
        next: { 
          revalidate: 180, // 3 minutes ISR for products (more frequent updates)
          tags: ['products', 'collections'] 
        },
        headers: {
          'Content-Type': 'application/json',
        }
      })
    ]);

    // Handle categories response
    let categories = [];
    if (categoriesResponse.status === 'fulfilled' && categoriesResponse.value.ok) {
      const categoriesData = await categoriesResponse.value.json();
      categories = Array.isArray(categoriesData.categories) ? categoriesData.categories : 
                  Array.isArray(categoriesData.data) ? categoriesData.data : [];
    }

    // Handle products response
    let initialProducts = [];
    if (productsResponse.status === 'fulfilled' && productsResponse.value.ok) {
      const productsData = await productsResponse.value.json();
      initialProducts = Array.isArray(productsData.data) ? productsData.data : 
                       Array.isArray(productsData.products) ? productsData.products : [];
    }

    return {
      categories,
      initialProducts,
    };
  } catch (error) {
    console.error('Error fetching initial data:', error);
    // Return empty arrays as fallback to prevent page crashes
    return {
      categories: [],
      initialProducts: [],
    };
  }
}

// Enhanced metadata generation with better SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
  
  return {
    title: locale === 'ar' 
      ? `المجموعات - ${config.business.name}`
      : `Collections - ${config.business.name}`,
    description: locale === 'ar'
      ? 'اكتشف مجموعتنا الكاملة من قطع الأزياء المميزة والعصرية'
      : 'Discover our complete collection of premium fashion pieces',
    keywords: locale === 'ar' 
      ? ['مجموعات', 'أزياء', 'ملابس', 'تسوق', config.business.name]
      : ['collections', 'fashion', 'clothing', 'shopping', config.business.name],
    openGraph: {
      title: locale === 'ar' 
        ? `المجموعات - ${config.business.name}`
        : `Collections - ${config.business.name}`,
      description: locale === 'ar'
        ? 'اكتشف مجموعتنا الكاملة من قطع الأزياء المميزة والعصرية'
        : 'Discover our complete collection of premium fashion pieces',
      type: 'website',
      locale: locale,
      url: `${baseUrl}/${locale}/collections`,
      images: [
        {
          url: `${baseUrl}/mvp-images/3.jpg`,
          width: 1200,
          height: 630,
          alt: locale === 'ar' ? 'مجموعات الأزياء' : 'Fashion Collections',
        },
      ],
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/collections`,
      languages: {
        'en': `${baseUrl}/en/collections`,
        'ar': `${baseUrl}/ar/collections`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// Enhanced loading component with better UX
function CollectionsLoading({ locale }: { locale: string }) {
  return (
    <div className="pt-20 animate-in fade-in duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header skeleton */}
        <div className="text-center mb-12">
          <div className="h-12 bg-gray-200 rounded-lg w-1/2 mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded-lg w-1/3 mx-auto animate-pulse"></div>
        </div>

        {/* Search bar skeleton */}
        <div className="max-w-md mx-auto mb-8">
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Category buttons skeleton */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded-full w-24 animate-pulse"></div>
          ))}
        </div>

        {/* Products grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-4 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-2xl"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function CollectionsPage({ params, searchParams }: PageProps) {
  const { locale } = params;
  
  if (!config.i18n.locales.includes(locale)) {
    notFound();
  }

  // Get initial data with ISR for better performance
  const { categories, initialProducts } = await getInitialData();

  return (
    <Suspense fallback={<CollectionsLoading locale={locale} />}>
      <CollectionsClient 
        locale={locale}
        initialCategories={categories}
        initialProducts={initialProducts}
        searchParams={searchParams}
      />
    </Suspense>
  );
}