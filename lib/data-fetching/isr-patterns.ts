import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

// ISR configuration for different content types
export const ISR_CONFIG = {
  // Product pages - balance between freshness and performance
  products: {
    revalidate: 3600, // 1 hour
    tags: ['products', 'inventory'],
  },
  
  // Collection pages - less frequent updates
  collections: {
    revalidate: 7200, // 2 hours
    tags: ['collections', 'products'],
  },
  
  // Home page - frequent updates for promotions
  homepage: {
    revalidate: 1800, // 30 minutes
    tags: ['homepage', 'featured', 'promotions'],
  },
  
  // Category pages
  categories: {
    revalidate: 3600, // 1 hour
    tags: ['categories', 'products'],
  },
  
  // Blog/content pages
  content: {
    revalidate: 86400, // 24 hours
    tags: ['content', 'blog'],
  },
  
  // User-specific pages (no ISR, use client-side caching)
  user: {
    revalidate: false,
    tags: ['user'],
  },
} as const;

// Cache tags for granular invalidation
export const CACHE_TAGS = {
  // Product-related tags
  PRODUCTS: 'products',
  PRODUCT: (handle: string) => `product:${handle}`,
  PRODUCT_REVIEWS: (handle: string) => `product-reviews:${handle}`,
  PRODUCT_VARIANTS: (handle: string) => `product-variants:${handle}`,
  
  // Collection-related tags
  COLLECTIONS: 'collections',
  COLLECTION: (handle: string) => `collection:${handle}`,
  COLLECTION_PRODUCTS: (handle: string) => `collection-products:${handle}`,
  
  // Inventory and pricing
  INVENTORY: 'inventory',
  PRICING: 'pricing',
  
  // Content tags
  HOMEPAGE: 'homepage',
  FEATURED: 'featured',
  PROMOTIONS: 'promotions',
  BLOG: 'blog',
  
  // User-specific (for targeted invalidation)
  USER_CART: (userId: string) => `user-cart:${userId}`,
  USER_ORDERS: (userId: string) => `user-orders:${userId}`,
  USER_WISHLIST: (userId: string) => `user-wishlist:${userId}`,
} as const;

// Stale-while-revalidate response headers
export const SWR_HEADERS = {
  // Aggressive caching for static assets
  STATIC_ASSETS: {
    'Cache-Control': 'public, max-age=31536000, immutable',
  },
  
  // Product pages - stale while revalidate
  PRODUCT_PAGE: {
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    'CDN-Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    'Vercel-CDN-Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
  },
  
  // Collection pages
  COLLECTION_PAGE: {
    'Cache-Control': 'public, s-maxage=7200, stale-while-revalidate=86400',
    'CDN-Cache-Control': 'public, s-maxage=7200, stale-while-revalidate=86400',
  },
  
  // API responses - shorter cache with SWR
  API_RESPONSE: {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
    'CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
  },
  
  // Dynamic content - minimal caching
  DYNAMIC: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
  },
  
  // No cache for user-specific content
  NO_CACHE: {
    'Cache-Control': 'private, no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
} as const;

// ISR utilities for API routes
export class ISRManager {
  // Revalidate specific product
  static async revalidateProduct(handle: string) {
    try {
      await revalidateTag(CACHE_TAGS.PRODUCT(handle));
      await revalidateTag(CACHE_TAGS.PRODUCTS);
      await revalidatePath(`/products/${handle}`);
      
      console.log(`Revalidated product: ${handle}`);
      return { success: true };
    } catch (error) {
      console.error(`Failed to revalidate product ${handle}:`, error);
      return { success: false, error };
    }
  }
  
  // Revalidate collection and its products
  static async revalidateCollection(handle: string) {
    try {
      await revalidateTag(CACHE_TAGS.COLLECTION(handle));
      await revalidateTag(CACHE_TAGS.COLLECTION_PRODUCTS(handle));
      await revalidateTag(CACHE_TAGS.COLLECTIONS);
      await revalidatePath(`/collections/${handle}`);
      
      console.log(`Revalidated collection: ${handle}`);
      return { success: true };
    } catch (error) {
      console.error(`Failed to revalidate collection ${handle}:`, error);
      return { success: false, error };
    }
  }
  
  // Revalidate inventory across all products
  static async revalidateInventory() {
    try {
      await revalidateTag(CACHE_TAGS.INVENTORY);
      await revalidateTag(CACHE_TAGS.PRODUCTS);
      
      console.log('Revalidated inventory');
      return { success: true };
    } catch (error) {
      console.error('Failed to revalidate inventory:', error);
      return { success: false, error };
    }
  }
  
  // Revalidate pricing
  static async revalidatePricing() {
    try {
      await revalidateTag(CACHE_TAGS.PRICING);
      await revalidateTag(CACHE_TAGS.PRODUCTS);
      
      console.log('Revalidated pricing');
      return { success: true };
    } catch (error) {
      console.error('Failed to revalidate pricing:', error);
      return { success: false, error };
    }
  }
  
  // Revalidate homepage and featured content
  static async revalidateHomepage() {
    try {
      await revalidateTag(CACHE_TAGS.HOMEPAGE);
      await revalidateTag(CACHE_TAGS.FEATURED);
      await revalidatePath('/');
      
      console.log('Revalidated homepage');
      return { success: true };
    } catch (error) {
      console.error('Failed to revalidate homepage:', error);
      return { success: false, error };
    }
  }
  
  // Batch revalidation for multiple items
  static async batchRevalidate(items: Array<{ type: 'product' | 'collection'; handle: string }>) {
    const results = await Promise.allSettled(
      items.map(item => {
        if (item.type === 'product') {
          return this.revalidateProduct(item.handle);
        } else {
          return this.revalidateCollection(item.handle);
        }
      })
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Batch revalidation: ${successful} successful, ${failed} failed`);
    return { successful, failed, results };
  }
}

// Response helpers with proper caching headers
export class CacheResponseHelper {
  // Create response with SWR headers for product pages
  static productPage(data: any, options?: { maxAge?: number; staleWhileRevalidate?: number }) {
    const maxAge = options?.maxAge || 3600;
    const swr = options?.staleWhileRevalidate || 86400;
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`,
        'CDN-Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`,
        'Vary': 'Accept-Encoding',
      },
    });
  }
  
  // Create response with SWR headers for collection pages
  static collectionPage(data: any, options?: { maxAge?: number; staleWhileRevalidate?: number }) {
    const maxAge = options?.maxAge || 7200;
    const swr = options?.staleWhileRevalidate || 86400;
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`,
        'CDN-Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`,
        'Vary': 'Accept-Encoding',
      },
    });
  }
  
  // Create response for API endpoints
  static apiResponse(data: any, options?: { maxAge?: number; staleWhileRevalidate?: number }) {
    const maxAge = options?.maxAge || 300;
    const swr = options?.staleWhileRevalidate || 3600;
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`,
        'CDN-Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`,
        'Vary': 'Accept-Encoding',
      },
    });
  }
  
  // Create response for dynamic content
  static dynamicResponse(data: any) {
    return NextResponse.json(data, {
      headers: SWR_HEADERS.DYNAMIC,
    });
  }
  
  // Create response for user-specific content (no cache)
  static userResponse(data: any) {
    return NextResponse.json(data, {
      headers: SWR_HEADERS.NO_CACHE,
    });
  }
}

// Webhook handler for external revalidation
export class WebhookRevalidationHandler {
  // Handle Shopify webhook for product updates
  static async handleProductUpdate(payload: any) {
    const { handle, id } = payload;
    
    if (!handle) {
      console.error('Product webhook missing handle');
      return { success: false, error: 'Missing handle' };
    }
    
    // Revalidate product and related collections
    const productResult = await ISRManager.revalidateProduct(handle);
    
    // If product has collections, revalidate them too
    if (payload.collections) {
      const collectionPromises = payload.collections.map((collection: any) =>
        ISRManager.revalidateCollection(collection.handle)
      );
      await Promise.allSettled(collectionPromises);
    }
    
    return productResult;
  }
  
  // Handle inventory updates
  static async handleInventoryUpdate(payload: any) {
    const { product_id, variant_id } = payload;
    
    // Revalidate inventory for all products or specific product
    if (product_id) {
      // Get product handle from ID and revalidate
      // This would require a database lookup in a real implementation
      return await ISRManager.revalidateInventory();
    }
    
    return await ISRManager.revalidateInventory();
  }
  
  // Handle collection updates
  static async handleCollectionUpdate(payload: any) {
    const { handle } = payload;
    
    if (!handle) {
      console.error('Collection webhook missing handle');
      return { success: false, error: 'Missing handle' };
    }
    
    return await ISRManager.revalidateCollection(handle);
  }
}

// Performance monitoring for ISR
export class ISRPerformanceMonitor {
  private static metrics: Map<string, { hits: number; misses: number; lastRevalidation: Date }> = new Map();
  
  // Track cache hit/miss
  static trackCacheHit(key: string, isHit: boolean) {
    const current = this.metrics.get(key) || { hits: 0, misses: 0, lastRevalidation: new Date() };
    
    if (isHit) {
      current.hits++;
    } else {
      current.misses++;
    }
    
    this.metrics.set(key, current);
  }
  
  // Track revalidation
  static trackRevalidation(key: string) {
    const current = this.metrics.get(key) || { hits: 0, misses: 0, lastRevalidation: new Date() };
    current.lastRevalidation = new Date();
    this.metrics.set(key, current);
  }
  
  // Get cache statistics
  static getStats() {
    const stats = Array.from(this.metrics.entries()).map(([key, metrics]) => ({
      key,
      hitRate: metrics.hits / (metrics.hits + metrics.misses),
      totalRequests: metrics.hits + metrics.misses,
      lastRevalidation: metrics.lastRevalidation,
    }));
    
    return stats.sort((a, b) => b.totalRequests - a.totalRequests);
  }
  
  // Clear metrics (for testing or reset)
  static clearStats() {
    this.metrics.clear();
  }
}

// Export utilities for use in API routes
export const createISRApiRoute = (
  handler: (request: NextRequest) => Promise<any>,
  cacheConfig: { maxAge?: number; staleWhileRevalidate?: number; tags?: string[] } = {}
) => {
  return async (request: NextRequest) => {
    try {
      const data = await handler(request);
      
      // Apply appropriate caching headers based on route
      const url = new URL(request.url);
      
      if (url.pathname.includes('/products/')) {
        return CacheResponseHelper.productPage(data, cacheConfig);
      } else if (url.pathname.includes('/collections/')) {
        return CacheResponseHelper.collectionPage(data, cacheConfig);
      } else {
        return CacheResponseHelper.apiResponse(data, cacheConfig);
      }
    } catch (error) {
      console.error('ISR API route error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500, headers: SWR_HEADERS.NO_CACHE }
      );
    }
  };
};

// Export types
export type ISRConfig = typeof ISR_CONFIG;
export type CacheTags = typeof CACHE_TAGS;