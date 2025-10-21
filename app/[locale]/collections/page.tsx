import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import CollectionsClient from './CollectionsClient';
import { config } from '@/lib/config';

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

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = params;
  
  if (!config.i18n.locales.includes(locale)) {
    notFound();
  }

  const isRTL = locale === 'ar';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return {
    title: isRTL ? 'المجموعات - لوجين' : 'Collections - Logen',
    description: isRTL 
      ? 'اكتشف مجموعتنا الكاملة من قطع الأزياء المميزة والعصرية'
      : 'Discover our complete collection of premium fashion pieces',
    keywords: isRTL 
      ? ['أزياء', 'ملابس', 'مجموعات', 'لوجين', 'تسوق']
      : ['fashion', 'clothing', 'collections', 'logen', 'shopping'],
    openGraph: {
      title: isRTL ? 'المجموعات - لوجين' : 'Collections - Logen',
      description: isRTL 
        ? 'اكتشف مجموعتنا الكاملة من قطع الأزياء المميزة والعصرية'
        : 'Discover our complete collection of premium fashion pieces',
      url: `${baseUrl}/${locale}/collections`,
      siteName: 'Logen',
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: isRTL ? 'المجموعات - لوجين' : 'Collections - Logen',
      description: isRTL 
        ? 'اكتشف مجموعتنا الكاملة من قطع الأزياء المميزة والعصرية'
        : 'Discover our complete collection of premium fashion pieces',
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/collections`,
      languages: {
        'en': `${baseUrl}/en/collections`,
        'ar': `${baseUrl}/ar/collections`,
      },
    },
  };
}

// Fetch initial data at build time for ISR
async function getInitialData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
    
    // Fetch categories and initial products in parallel
    const [categoriesRes, productsRes] = await Promise.all([
      fetch(`${baseUrl}/category/AllCategory`, {
        next: { revalidate: 60 }
      }),
      fetch(`${baseUrl}/products?limit=20`, {
        next: { revalidate: 60 }
      })
    ]);

    const categories = categoriesRes.ok ? await categoriesRes.json() : { categories: [] };
    const products = productsRes.ok ? await productsRes.json() : { products: [] };

    return {
      categories: categories.categories || categories.data || [],
      initialProducts: products.products || products.data || [],
    };
  } catch (error) {
    console.error('Failed to fetch initial data:', error);
    return {
      categories: [],
      initialProducts: [],
    };
  }
}

export default async function CollectionsPage({ params, searchParams }: PageProps) {
  const { locale } = params;
  
  if (!config.i18n.locales.includes(locale)) {
    notFound();
  }

  // Get initial data for ISR
  const { categories, initialProducts } = await getInitialData();

  return (
    <Suspense fallback={
      <div className="pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-12"></div>
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
    }>
      <CollectionsClient 
        locale={locale}
        initialCategories={categories}
        initialProducts={initialProducts}
        searchParams={searchParams}
      />
    </Suspense>
  );
}