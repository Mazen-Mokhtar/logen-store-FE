'use client';

import useSWR from 'swr';
import { SEOMetadata, StructuredData, Product, Category } from '@/types';
import { config } from '@/lib/config';
import { getCachedSEOData, memoryCache } from '@/lib/cache';

const fetcher = async (url: string) => {
  // Try memory cache first
  const cached = memoryCache.get(url);
  if (cached) return cached;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch SEO data');
  }
  
  const data = await response.json();
  // Cache for 5 minutes
  memoryCache.set(url, data, 5 * 60 * 1000);
  return data;
};

export function useSEO(path?: string, locale?: string) {
  const currentPath = path || (typeof window !== 'undefined' ? window.location.pathname : '/');
  const currentLocale = locale || config.i18n.defaultLocale;
  
  const apiUrl = `${config.api.endpoints.seo}?path=${encodeURIComponent(currentPath)}&locale=${currentLocale}`;
  
  const { data, error, isLoading, mutate } = useSWR<SEOMetadata>(
    apiUrl,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  );

  // Generate canonical URL
  const canonicalUrl = data?.canonicalUrl || `${config.site.url}${currentPath}`;
  
  // Generate Open Graph URL
  const ogUrl = data?.openGraph?.url || canonicalUrl;

  // Merge with default SEO data
  const seoData: SEOMetadata = {
    title: data?.title || config.seo.defaultTitle,
    description: data?.description || config.seo.defaultDescription,
    keywords: data?.keywords || config.seo.defaultKeywords,
    canonicalUrl,
    openGraph: {
      title: data?.openGraph?.title || data?.title || config.seo.defaultTitle,
      description: data?.openGraph?.description || data?.description || config.seo.defaultDescription,
      url: ogUrl,
      type: data?.openGraph?.type || 'website',
      image: data?.openGraph?.image || 
        `${config.site.url}/og-default.jpg`,
      siteName: data?.openGraph?.siteName || config.site.name,
      locale: data?.openGraph?.locale || currentLocale,
      ...data?.openGraph,
    },
    twitter: {
      card: data?.twitter?.card || 'summary_large_image',
      site: data?.twitter?.site || config.social.twitter,
      creator: data?.twitter?.creator || config.social.twitter,
      title: data?.twitter?.title || data?.title || config.seo.defaultTitle,
      description: data?.twitter?.description || data?.description || config.seo.defaultDescription,
      image: data?.twitter?.image || `${config.site.url}/og-default.jpg`,
      ...data?.twitter,
    },
    structuredData: data?.structuredData,
    hreflang: data?.hreflang,
  };

  // Update SEO data
  const updateSEO = async (newData: Partial<SEOMetadata>) => {
    try {
      const response = await fetch(config.api.endpoints.seo, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: currentPath,
          data: newData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update SEO data');
      }

      // Clear cache and revalidate
      memoryCache.delete(apiUrl);
      mutate();
      
      return await response.json();
    } catch (error) {
      console.error('Error updating SEO data:', error);
      throw error;
    }
  };

  // Generate structured data for products
  const generateStructuredData = (type: 'product' | 'category' | 'organization', data: Product | Category | any): StructuredData => {
    const baseUrl = config.site.url;
    
    switch (type) {
      case 'product':
        const product = data as Product;
        return {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          image: product.image ? `${baseUrl}${product.image}` : undefined,
          brand: {
            '@type': 'Brand',
            name: product.brand || config.site.name,
          },
          offers: {
            '@type': 'Offer',
            price: product.price.toString(),
            priceCurrency: product.currency || 'USD',
            availability: `https://schema.org/${product.availability || 'InStock'}`,
            url: `${baseUrl}/products/${product.id}`,
          },
          aggregateRating: product.rating ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating.toString(),
            reviewCount: product.reviewCount?.toString() || '1',
          } : undefined,
        };

      case 'category':
        const category = data as Category;
        return {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: category.name,
          description: category.description,
          url: `${baseUrl}/categories/${category.slug}`,
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: category.productCount || 0,
          },
        };

      case 'organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: config.site.name,
          url: baseUrl,
          logo: `${baseUrl}/logo.png`,
          sameAs: [
            config.social.facebook,
            config.social.twitter,
            config.social.instagram,
          ].filter(Boolean),
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: config.site.phone,
            contactType: 'customer service',
          },
        };

      default:
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: config.site.name,
          url: baseUrl,
        };
    }
  };

  // Generate canonical URL function
  const generateCanonicalUrl = (pathOverride?: string) => {
    const targetPath = pathOverride || currentPath;
    return `${config.site.url}${targetPath}`;
  };

  return {
    seoData,
    isLoading,
    error,
    updateSEO,
    generateStructuredData,
    generateCanonicalUrl,
    canonicalUrl,
    ogUrl,
  };
}