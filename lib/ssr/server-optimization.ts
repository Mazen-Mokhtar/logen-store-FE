import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { CACHE_TAGS, ISR_CONFIG } from '../data-fetching/isr-patterns';

// Server-side data fetching utilities with caching
export const serverDataFetcher = {
  // Cached product fetcher for SSR/SSG
  getProduct: cache(async (handle: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/products/handle/${handle}`, {
        next: { 
          revalidate: ISR_CONFIG.products.revalidate,
          tags: [CACHE_TAGS.PRODUCT(handle), CACHE_TAGS.PRODUCTS]
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          notFound();
        }
        throw new Error(`Failed to fetch product: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Error fetching product ${handle}:`, error);
      throw error;
    }
  }),
  
  // Cached collection fetcher
  getCollection: cache(async (handle: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/collections/${handle}`, {
        next: { 
          revalidate: ISR_CONFIG.collections.revalidate,
          tags: [CACHE_TAGS.COLLECTION(handle), CACHE_TAGS.COLLECTIONS]
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          notFound();
        }
        throw new Error(`Failed to fetch collection: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Error fetching collection ${handle}:`, error);
      throw error;
    }
  }),
  
  // Cached collection products
  getCollectionProducts: cache(async (handle: string, params: Record<string, any> = {}) => {
    try {
      const searchParams = new URLSearchParams(params);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/collections/${handle}/products?${searchParams}`,
        {
          next: {
            revalidate: ISR_CONFIG.collections.revalidate,
            tags: [CACHE_TAGS.COLLECTION_PRODUCTS(handle), CACHE_TAGS.COLLECTIONS],
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch collection products: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Error fetching collection products for ${handle}:`, error);
      throw error;
    }
  }),
  
  // Cached product reviews
  getProductReviews: cache(async (handle: string) => {
    try {
      // First get the product to get its ID
      const productResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/products/handle/${handle}`, {
        next: {
          revalidate: ISR_CONFIG.products.revalidate,
          tags: [CACHE_TAGS.PRODUCT(handle)],
        },
      });
      
      if (!productResponse.ok) {
        throw new Error(`Failed to fetch product: ${productResponse.statusText}`);
      }
      
      const productData = await productResponse.json();
      const productId = productData.data._id;
      
      // Then fetch reviews using the product ID - call backend directly
      const backendApiUrl = process.env.BACKEND_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${backendApiUrl}/v1/ratings/product/${productId}`, {
        next: {
          revalidate: ISR_CONFIG.products.revalidate,
          tags: [CACHE_TAGS.PRODUCT_REVIEWS(handle)],
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch product reviews: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Error fetching reviews for ${handle}:`, error);
      // Don't throw for reviews - they're not critical
      return { reviews: [], averageRating: 0, totalReviews: 0 };
    }
  }),
  
  // Cached related products
  getRelatedProducts: cache(async (handle: string, limit = 4) => {
    try {
      // For now, fetch all products and filter similar ones
      // This is a temporary solution until a proper related products endpoint is available
      const backendApiUrl = process.env.BACKEND_API_URL || 'http://localhost:3000/api';
      const response = await fetch(
        `${backendApiUrl}/products?limit=${limit * 2}`,
        {
          next: {
            revalidate: ISR_CONFIG.products.revalidate,
            tags: [CACHE_TAGS.PRODUCT(handle), CACHE_TAGS.PRODUCTS],
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch related products: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Simple related products logic - return random products excluding the current one
      const relatedProducts = data.data?.filter((product: any) => product.handle !== handle).slice(0, limit) || [];
      
      return {
        success: true,
        data: relatedProducts
      };
    } catch (error) {
      console.error(`Error fetching related products for ${handle}:`, error);
      // Return empty array for related products if fetch fails
      return [];
    }
  }),
  
  // Cached homepage data
  getHomepageData: cache(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/homepage`, {
        next: { 
          revalidate: ISR_CONFIG.homepage.revalidate,
          tags: [CACHE_TAGS.HOMEPAGE, CACHE_TAGS.FEATURED, CACHE_TAGS.PROMOTIONS]
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch homepage data: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      throw error;
    }
  }),
  
  // Batch fetch multiple products (for collections, related products, etc.)
  batchGetProducts: cache(async (handles: string[]) => {
    try {
      const promises = handles.map(handle => serverDataFetcher.getProduct(handle));
      const results = await Promise.allSettled(promises);
      
      return results
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value);
    } catch (error) {
      console.error('Error batch fetching products:', error);
      return [];
    }
  }),
};

// SEO metadata generators with performance optimization
export const seoGenerators = {
  // Generate product metadata
  generateProductMetadata: async (handle: string, locale: string = 'en'): Promise<Metadata> => {
    try {
      const product = await serverDataFetcher.getProduct(handle);
      
      // Get localized title and description
      const productTitle = locale === 'ar' 
        ? (product.data?.title?.ar || product.data?.title?.en || product.data?.title || 'Product')
        : (product.data?.title?.en || product.data?.title?.ar || product.data?.title || 'Product');
      
      const productDescription = locale === 'ar'
        ? (product.data?.description?.ar || product.data?.description?.en || product.data?.description || '')
        : (product.data?.description?.en || product.data?.description?.ar || product.data?.description || '');
      
      const title = product.data?.seo?.title || `${productTitle} | ${process.env.NEXT_PUBLIC_SITE_NAME}`;
      const description = product.data?.seo?.description || productDescription?.substring(0, 160);
      const images = product.data?.images?.map((image: any) => ({
        url: image.secure_url || image,
        width: 1200,
        height: 630,
        alt: productTitle,
      })) || [];
      
      return {
        title,
        description,
        openGraph: {
          title,
          description,
          type: 'website',
          images,
          url: `/products/${handle}`,
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: images[0]?.url ? [images[0].url] : [],
        },
        alternates: {
          canonical: `/products/${handle}`,
        },
        other: {
          'product:price:amount': product.data?.price?.toString() || '0',
          'product:price:currency': 'USD',
          'product:availability': product.data?.inStock ? 'in stock' : 'out of stock',
        },
      };
    } catch (error) {
      console.error(`Error generating metadata for product ${handle}:`, error);
      return {
        title: 'Product Not Found',
        description: 'The requested product could not be found.',
      };
    }
  },
  
  // Generate collection metadata
  generateCollectionMetadata: async (handle: string): Promise<Metadata> => {
    try {
      const collection = await serverDataFetcher.getCollection(handle);
      
      const title = collection.seo?.title || `${collection.title} | ${process.env.NEXT_PUBLIC_SITE_NAME}`;
      const description = collection.seo?.description || collection.description?.substring(0, 160);
      const image = collection.image ? {
        url: collection.image,
        width: 1200,
        height: 630,
        alt: collection.title,
      } : null;
      
      return {
        title,
        description,
        openGraph: {
          title,
          description,
          type: 'website',
          images: image ? [image] : [],
          url: `/collections/${handle}`,
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: image ? [image.url] : [],
        },
        alternates: {
          canonical: `/collections/${handle}`,
        },
      };
    } catch (error) {
      console.error(`Error generating metadata for collection ${handle}:`, error);
      return {
        title: 'Collection Not Found',
        description: 'The requested collection could not be found.',
      };
    }
  },
};

// Static generation helpers
export const staticGenerationHelpers = {
  // Generate static params for products
  generateProductStaticParams: async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/v1/products/handles`, {
        next: { revalidate: 3600 }, // Revalidate every hour
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch product handles');
      }
      
      const { handles } = await response.json();
      return handles.map((handle: string) => ({ handle }));
    } catch (error) {
      console.error('Error generating product static params:', error);
      return [];
    }
  },
  
  // Generate static params for collections
  generateCollectionStaticParams: async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/collections/handles`, {
        next: { revalidate: 3600 },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch collection handles');
      }
      
      const { handles } = await response.json();
      return handles.map((handle: string) => ({ handle }));
    } catch (error) {
      console.error('Error generating collection static params:', error);
      return [];
    }
  },
  
  // Generate sitemap data
  generateSitemapData: async () => {
    try {
      const [productHandles, collectionHandles] = await Promise.all([
        staticGenerationHelpers.generateProductStaticParams(),
        staticGenerationHelpers.generateCollectionStaticParams(),
      ]);
      
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourstore.com';
      
      const urls = [
        // Static pages
        { url: baseUrl, lastModified: new Date(), priority: 1.0 },
        { url: `${baseUrl}/collections`, lastModified: new Date(), priority: 0.8 },
        
        // Product pages
        ...productHandles.map((params: { handle: string }) => ({
          url: `${baseUrl}/products/${params.handle}`,
          lastModified: new Date(),
          priority: 0.7,
        })),
        
        // Collection pages
        ...collectionHandles.map((params: { handle: string }) => ({
          url: `${baseUrl}/collections/${params.handle}`,
          lastModified: new Date(),
          priority: 0.6,
        })),
      ];
      
      return urls;
    } catch (error) {
      console.error('Error generating sitemap data:', error);
      return [];
    }
  },
};

// Server component optimization utilities
export const serverComponentOptimizations = {
  // Preload critical data for a page
  preloadPageData: async (pageType: 'product' | 'collection' | 'homepage', identifier?: string) => {
    const preloadPromises: Promise<any>[] = [];
    
    switch (pageType) {
      case 'product':
        if (identifier) {
          preloadPromises.push(
            serverDataFetcher.getProduct(identifier),
            serverDataFetcher.getProductReviews(identifier),
            serverDataFetcher.getRelatedProducts(identifier)
          );
        }
        break;
        
      case 'collection':
        if (identifier) {
          preloadPromises.push(
            serverDataFetcher.getCollection(identifier),
            serverDataFetcher.getCollectionProducts(identifier, { limit: 20 })
          );
        }
        break;
        
      case 'homepage':
        preloadPromises.push(serverDataFetcher.getHomepageData());
        break;
    }
    
    // Start all requests in parallel but don't wait for them
    preloadPromises.forEach(promise => {
      promise.catch(error => {
        console.error('Preload error:', error);
      });
    });
  },
  
  // Streaming data loader for progressive enhancement
  createStreamingLoader: <T>(
    dataFetcher: () => Promise<T>,
    fallback: T
  ) => {
    return async function* () {
      yield fallback; // Immediate fallback
      
      try {
        const data = await dataFetcher();
        yield data; // Real data when available
      } catch (error) {
        console.error('Streaming loader error:', error);
        yield fallback; // Fallback on error
      }
    };
  },
};

// Performance monitoring for SSR
export const ssrPerformanceMonitor = {
  // Track SSR timing
  trackSSRTiming: (pageName: string, startTime: number) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`SSR ${pageName} took ${duration.toFixed(2)}ms`);
    
    // In production, send to analytics
    if (process.env.NODE_ENV === 'production') {
      // Send to your analytics service
      console.log(`Analytics: SSR timing for ${pageName}: ${duration}ms`);
    }
  },
  
  // Monitor data fetching performance
  trackDataFetching: async <T>(
    operation: string,
    fetcher: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await fetcher();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`Data fetch ${operation} took ${duration.toFixed(2)}ms`);
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.error(`Data fetch ${operation} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  },
};

// Export types
export type ServerDataFetcher = typeof serverDataFetcher;
export type SEOGenerators = typeof seoGenerators;