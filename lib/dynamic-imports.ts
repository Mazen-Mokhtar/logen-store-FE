import { lazy, ComponentType, LazyExoticComponent } from 'react';
import { ComponentProps } from 'react';

// Dynamic import configuration
interface DynamicImportConfig {
  ssr?: boolean;
  loading?: ComponentType;
  timeout?: number;
  retries?: number;
  preload?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

// Enhanced dynamic import with retry logic and preloading
export function createDynamicImport<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  config: DynamicImportConfig = {}
): LazyExoticComponent<T> {
  const {
    ssr = false,
    timeout = 10000,
    retries = 3,
    preload = false,
    priority = 'medium'
  } = config;

  // Retry logic for failed imports
  const importWithRetry = async (attempt = 1): Promise<{ default: T }> => {
    try {
      const module = await Promise.race([
        importFn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Import timeout')), timeout)
        )
      ]);
      return module;
    } catch (error) {
      if (attempt < retries) {
        console.warn(`Import failed, retrying... (${attempt}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        return importWithRetry(attempt + 1);
      }
      throw error;
    }
  };

  const LazyComponent = lazy(importWithRetry);

  // Preload the component if requested
  if (preload && typeof window !== 'undefined') {
    const preloadTimer = priority === 'high' ? 0 : priority === 'medium' ? 1000 : 3000;
    setTimeout(() => {
      importWithRetry().catch(() => {
        // Silently fail preload attempts
      });
    }, preloadTimer);
  }

  return LazyComponent;
}

// Preload a dynamic component
export function preloadComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): Promise<void> {
  return importFn()
    .then(() => {})
    .catch(() => {
      // Silently handle preload failures
    });
}

// Batch preload multiple components
export function batchPreloadComponents(
  imports: Array<() => Promise<any>>,
  delay = 0
): Promise<void[]> {
  return new Promise(resolve => {
    setTimeout(() => {
      const promises = imports.map(importFn =>
        importFn().catch(() => {})
      );
      Promise.allSettled(promises).then(() => resolve([]));
    }, delay);
  });
}

// Dynamic component definitions for the e-commerce platform

// Product-related components
export const DynamicOptimizedProductCard = createDynamicImport(
  () => import('../components/OptimizedProductCard'),
  { priority: 'high', preload: true }
);

export const DynamicProductDetail = createDynamicImport(
  () => import('../components/ProductDetail'),
  { priority: 'high', ssr: true }
);

export const DynamicProductGallery = createDynamicImport(
  () => import('../components/ProductGallery'),
  { priority: 'medium' }
);

export const DynamicProductReviews = createDynamicImport(
  () => import('../components/ProductReviews'),
  { priority: 'low' }
);

export const DynamicRelatedProducts = createDynamicImport(
  () => import('../components/RelatedProducts'),
  { priority: 'low' }
);

// Cart and checkout components
export const DynamicCartDrawer = createDynamicImport(
  () => import('../components/CartDrawer'),
  { priority: 'high' }
);

export const DynamicCheckoutForm = createDynamicImport(
  () => import('../components/CheckoutForm'),
  { priority: 'high', ssr: true }
);

export const DynamicPaymentForm = createDynamicImport(
  () => import('../components/PaymentForm'),
  { priority: 'high' }
);

// User interface components
export const DynamicUserMenu = createDynamicImport(
  () => import('../components/UserMenu'),
  { priority: 'medium' }
);

export const DynamicAuthModal = createDynamicImport(
  () => import('../components/AuthModal'),
  { priority: 'medium' }
);

export const DynamicWishlist = createDynamicImport(
  () => import('../components/Wishlist'),
  { priority: 'low' }
);

// Search and filters
export const DynamicSearchModal = createDynamicImport(
  () => import('../components/SearchModal'),
  { priority: 'medium' }
);

export const DynamicFilters = createDynamicImport(
  () => import('../components/Filters'),
  { priority: 'medium' }
);

export const DynamicSortOptions = createDynamicImport(
  () => import('../components/SortOptions'),
  { priority: 'low' }
);

// Heavy third-party integrations
export const DynamicAnalytics = createDynamicImport(
  () => import('../components/Analytics'),
  { priority: 'low', ssr: false }
);

export const DynamicChatWidget = createDynamicImport(
  () => import('../components/ChatWidget'),
  { priority: 'low', ssr: false }
);

export const DynamicNewsletterModal = createDynamicImport(
  () => import('../components/NewsletterModal'),
  { priority: 'low', ssr: false }
);

// Admin and dashboard components
export const DynamicAdminPanel = createDynamicImport(
  () => import('../components/AdminPanel'),
  { priority: 'low', ssr: false }
);

export const DynamicInventoryManager = createDynamicImport(
  () => import('../components/InventoryManager'),
  { priority: 'low', ssr: false }
);

// Utility function to get component bundle info
export function getComponentBundleInfo() {
  return {
    critical: [
      'DynamicOptimizedProductCard',
      'DynamicProductDetail',
      'DynamicCartDrawer',
      'DynamicCheckoutForm'
    ],
    important: [
      'DynamicProductGallery',
      'DynamicUserMenu',
      'DynamicAuthModal',
      'DynamicSearchModal',
      'DynamicFilters'
    ],
    deferred: [
      'DynamicProductReviews',
      'DynamicRelatedProducts',
      'DynamicWishlist',
      'DynamicAnalytics',
      'DynamicChatWidget',
      'DynamicNewsletterModal'
    ],
    admin: [
      'DynamicAdminPanel',
      'DynamicInventoryManager'
    ]
  };
}

// Preload critical components based on route
export function preloadCriticalComponents(route: string): Promise<void[]> {
  const componentMap: Record<string, Array<() => Promise<any>>> = {
    '/': [
      () => import('../components/OptimizedProductCard'),
      () => import('../components/CartDrawer')
    ],
    '/products': [
      () => import('../components/OptimizedProductCard'),
      () => import('../components/Filters'),
      () => import('../components/SortOptions')
    ],
    '/product': [
      () => import('../components/ProductDetail'),
      () => import('../components/ProductGallery'),
      () => import('../components/RelatedProducts')
    ],
    '/cart': [
      () => import('../components/CartDrawer'),
      () => import('../components/CheckoutForm')
    ],
    '/checkout': [
      () => import('../components/CheckoutForm'),
      () => import('../components/PaymentForm')
    ]
  };

  const routeKey = Object.keys(componentMap).find(key => route.startsWith(key)) || '/';
  const imports = componentMap[routeKey] || [];

  return batchPreloadComponents(imports, 100);
}

// Intelligent component loading based on user behavior
export class ComponentPreloader {
  private static instance: ComponentPreloader;
  private preloadedComponents = new Set<string>();
  private preloadQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;

  static getInstance(): ComponentPreloader {
    if (!ComponentPreloader.instance) {
      ComponentPreloader.instance = new ComponentPreloader();
    }
    return ComponentPreloader.instance;
  }

  addToQueue(importFn: () => Promise<any>, componentName: string): void {
    if (this.preloadedComponents.has(componentName)) return;

    this.preloadQueue.push(importFn);
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.preloadQueue.length === 0) return;

    this.isProcessing = true;

    // Process queue with idle callback for better performance
    const processNext = () => {
      if (this.preloadQueue.length === 0) {
        this.isProcessing = false;
        return;
      }

      const importFn = this.preloadQueue.shift();
      if (importFn) {
        importFn()
          .then(() => {
            if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
              window.requestIdleCallback(processNext);
            } else {
              setTimeout(processNext, 16);
            }
          })
          .catch(() => {
            // Continue processing even if one fails
            if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
              window.requestIdleCallback(processNext);
            } else {
              setTimeout(processNext, 16);
            }
          });
      }
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(processNext);
    } else {
      setTimeout(processNext, 16);
    }
  }

  preloadBasedOnScroll(scrollDepth: number): void {
    if (scrollDepth > 0.3) {
      this.addToQueue(
        () => import('../components/ProductReviews'),
        'ProductReviews'
      );
    }

    if (scrollDepth > 0.6) {
      this.addToQueue(
        () => import('../components/RelatedProducts'),
        'RelatedProducts'
      );
    }

    if (scrollDepth > 0.8) {
      this.addToQueue(
        () => import('../components/NewsletterModal'),
        'NewsletterModal'
      );
    }
  }

  preloadBasedOnHover(componentType: string): void {
    const hoverMap: Record<string, () => Promise<any>> = {
      cart: () => import('../components/CartDrawer'),
      user: () => import('../components/UserMenu'),
      search: () => import('../components/SearchModal'),
      wishlist: () => import('../components/Wishlist')
    };

    const importFn = hoverMap[componentType];
    if (importFn) {
      this.addToQueue(importFn, componentType);
    }
  }

  preloadBasedOnIntent(intent: string): void {
    const intentMap: Record<string, Array<() => Promise<any>>> = {
      shopping: [
        () => import('../components/CartDrawer'),
        () => import('../components/CheckoutForm')
      ],
      browsing: [
        () => import('../components/Filters'),
        () => import('../components/SortOptions')
      ],
      comparing: [
        () => import('../components/ProductComparison'),
        () => import('../components/ProductReviews')
      ]
    };

    const imports = intentMap[intent] || [];
    imports.forEach((importFn, index) => {
      this.addToQueue(importFn, `${intent}-${index}`);
    });
  }
}

// Hook for using the component preloader
export function useComponentPreloader() {
  return ComponentPreloader.getInstance();
}