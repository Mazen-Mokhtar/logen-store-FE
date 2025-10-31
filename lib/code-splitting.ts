import { ComponentType } from 'react';

// Bundle splitting configuration
interface BundleSplitConfig {
  chunkName?: string;
  priority?: 'high' | 'medium' | 'low';
  preload?: boolean;
  prefetch?: boolean;
  webpackChunkName?: string;
}

// Advanced code splitting with webpack magic comments
export function createSplitComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  config: BundleSplitConfig = {}
): () => Promise<{ default: T }> {
  const {
    chunkName,
    priority = 'medium',
    preload = false,
    prefetch = false,
    webpackChunkName
  } = config;

  // Generate webpack magic comments
  const magicComments: string[] = [];
  
  if (webpackChunkName || chunkName) {
    magicComments.push(`webpackChunkName: "${webpackChunkName || chunkName}"`);
  }
  
  if (preload) {
    magicComments.push('webpackPreload: true');
  }
  
  if (prefetch) {
    magicComments.push('webpackPrefetch: true');
  }
  
  // Set webpack mode based on priority
  const mode = priority === 'high' ? 'eager' : 'lazy';
  magicComments.push(`webpackMode: "${mode}"`);

  return importFn;
}

// Route-based code splitting
export const routeBasedSplits = {
  // Home page components
  home: {
    hero: () => createSplitComponent(
      () => import(/* webpackChunkName: "home-hero" */ '../components/Hero'),
      { priority: 'high', preload: true }
    ),
    featuredProducts: () => createSplitComponent(
      () => import(/* webpackChunkName: "featured-products" */ '../components/FeaturedProducts'),
      { priority: 'high', preload: true }
    ),
    testimonials: () => createSplitComponent(
      () => import(/* webpackChunkName: "testimonials" */ '../components/Testimonials'),
      { priority: 'low', prefetch: true }
    ),
    newsletter: () => createSplitComponent(
      () => import(/* webpackChunkName: "newsletter" */ '../components/Newsletter'),
      { priority: 'low' }
    )
  },

  // Product pages
  products: {
    productGrid: () => createSplitComponent(
      () => import(/* webpackChunkName: "product-grid" */ '../components/ProductGrid'),
      { priority: 'high', preload: true }
    ),
    filters: () => createSplitComponent(
      () => import(/* webpackChunkName: "product-filters" */ '../components/ProductFilters'),
      { priority: 'medium', prefetch: true }
    ),
    sorting: () => createSplitComponent(
      () => import(/* webpackChunkName: "product-sorting" */ '../components/ProductSorting'),
      { priority: 'medium' }
    ),
    pagination: () => createSplitComponent(
      () => import(/* webpackChunkName: "pagination" */ '../components/Pagination'),
      { priority: 'low' }
    )
  },

  // Product detail page
  productDetail: {
    gallery: () => createSplitComponent(
      () => import(/* webpackChunkName: "product-gallery" */ '../components/ProductGallery'),
      { priority: 'high', preload: true }
    ),
    info: () => createSplitComponent(
      () => import(/* webpackChunkName: "product-info" */ '../components/ProductInfo'),
      { priority: 'high', preload: true }
    ),
    reviews: () => createSplitComponent(
      () => import(/* webpackChunkName: "product-reviews" */ '../components/ProductReviews'),
      { priority: 'medium', prefetch: true }
    ),
    recommendations: () => createSplitComponent(
      () => import(/* webpackChunkName: "product-recommendations" */ '../components/ProductRecommendations'),
      { priority: 'low', prefetch: true }
    ),
    specifications: () => createSplitComponent(
      () => import(/* webpackChunkName: "product-specs" */ '../components/ProductSpecifications'),
      { priority: 'low' }
    )
  },

  // Cart and checkout
  cart: {
    cartItems: () => createSplitComponent(
      () => import(/* webpackChunkName: "cart-items" */ '../components/CartItems'),
      { priority: 'high', preload: true }
    ),
    cartSummary: () => createSplitComponent(
      () => import(/* webpackChunkName: "cart-summary" */ '../components/CartSummary'),
      { priority: 'high', preload: true }
    ),
    shippingCalculator: () => createSplitComponent(
      () => import(/* webpackChunkName: "shipping-calc" */ '../components/ShippingCalculator'),
      { priority: 'medium' }
    ),
    promoCode: () => createSplitComponent(
      () => import(/* webpackChunkName: "promo-code" */ '../components/PromoCode'),
      { priority: 'low' }
    )
  },

  // Checkout process
  checkout: {
    checkoutForm: () => createSplitComponent(
      () => import(/* webpackChunkName: "checkout-form" */ '../components/CheckoutForm'),
      { priority: 'high', preload: true }
    ),
    paymentMethods: () => createSplitComponent(
      () => import(/* webpackChunkName: "payment-methods" */ '../components/PaymentMethods'),
      { priority: 'high', preload: true }
    ),
    addressForm: () => createSplitComponent(
      () => import(/* webpackChunkName: "address-form" */ '../components/AddressForm'),
      { priority: 'medium' }
    ),
    orderSummary: () => createSplitComponent(
      () => import(/* webpackChunkName: "order-summary" */ '../components/OrderSummary'),
      { priority: 'medium' }
    )
  },

  // User account
  account: {
    profile: () => createSplitComponent(
      () => import(/* webpackChunkName: "user-profile" */ '../components/UserProfile'),
      { priority: 'medium' }
    ),
    orderHistory: () => createSplitComponent(
      () => import(/* webpackChunkName: "order-history" */ '../components/OrderHistory'),
      { priority: 'medium' }
    ),
    wishlist: () => createSplitComponent(
      () => import(/* webpackChunkName: "wishlist" */ '../components/Wishlist'),
      { priority: 'low' }
    ),
    addresses: () => createSplitComponent(
      () => import(/* webpackChunkName: "user-addresses" */ '../components/UserAddresses'),
      { priority: 'low' }
    )
  }
};

// Feature-based code splitting
export const featureBasedSplits = {
  // Authentication
  auth: {
    loginForm: () => createSplitComponent(
      () => import(/* webpackChunkName: "auth-login" */ '../components/LoginForm'),
      { priority: 'medium' }
    ),
    registerForm: () => createSplitComponent(
      () => import(/* webpackChunkName: "auth-register" */ '../components/RegisterForm'),
      { priority: 'medium' }
    ),
    forgotPassword: () => createSplitComponent(
      () => import(/* webpackChunkName: "auth-forgot" */ '../components/ForgotPassword'),
      { priority: 'low' }
    ),
    socialLogin: () => createSplitComponent(
      () => import(/* webpackChunkName: "auth-social" */ '../components/SocialLogin'),
      { priority: 'low' }
    )
  },

  // Search functionality
  search: {
    searchModal: () => createSplitComponent(
      () => import(/* webpackChunkName: "search-modal" */ '../components/SearchModal'),
      { priority: 'medium' }
    ),
    searchResults: () => createSplitComponent(
      () => import(/* webpackChunkName: "search-results" */ '../components/SearchResults'),
      { priority: 'medium' }
    ),
    searchFilters: () => createSplitComponent(
      () => import(/* webpackChunkName: "search-filters" */ '../components/SearchFilters'),
      { priority: 'low' }
    ),
    searchSuggestions: () => createSplitComponent(
      () => import(/* webpackChunkName: "search-suggestions" */ '../components/SearchSuggestions'),
      { priority: 'low' }
    )
  },

  // Analytics and tracking
  analytics: {
    googleAnalytics: () => createSplitComponent(
      () => import(/* webpackChunkName: "analytics-ga" */ '../components/GoogleAnalytics'),
      { priority: 'low' }
    ),
    facebookPixel: () => createSplitComponent(
      () => import(/* webpackChunkName: "analytics-fb" */ '../components/FacebookPixel'),
      { priority: 'low' }
    ),
    hotjar: () => createSplitComponent(
      () => import(/* webpackChunkName: "analytics-hotjar" */ '../components/Hotjar'),
      { priority: 'low' }
    )
  },

  // Third-party integrations
  integrations: {
    chatWidget: () => createSplitComponent(
      () => import(/* webpackChunkName: "chat-widget" */ '../components/ChatWidget'),
      { priority: 'low' }
    ),
    reviewsWidget: () => createSplitComponent(
      () => import(/* webpackChunkName: "reviews-widget" */ '../components/ReviewsWidget'),
      { priority: 'low' }
    ),
    socialShare: () => createSplitComponent(
      () => import(/* webpackChunkName: "social-share" */ '../components/SocialShare'),
      { priority: 'low' }
    )
  }
};

// Vendor-based code splitting
export const vendorSplits = {
  // Animation libraries
  animations: {
    framerMotion: () => createSplitComponent(
      () => import(/* webpackChunkName: "vendor-framer" */ 'framer-motion'),
      { priority: 'medium', prefetch: true }
    ),
    gsap: () => createSplitComponent(
      () => import(/* webpackChunkName: "vendor-gsap" */ 'gsap'),
      { priority: 'low' }
    )
  },

  // Form libraries
  forms: {
    reactHookForm: () => createSplitComponent(
      () => import(/* webpackChunkName: "vendor-rhf" */ 'react-hook-form'),
      { priority: 'medium' }
    ),
    yup: () => createSplitComponent(
      () => import(/* webpackChunkName: "vendor-yup" */ 'yup'),
      { priority: 'medium' }
    )
  },

  // Date libraries
  dates: {
    dateFns: () => createSplitComponent(
      () => import(/* webpackChunkName: "vendor-date-fns" */ 'date-fns'),
      { priority: 'low' }
    )
  },

  // Chart libraries
  charts: {
    recharts: () => createSplitComponent(
      () => import(/* webpackChunkName: "vendor-charts" */ 'recharts'),
      { priority: 'low' }
    )
  }
};

// Bundle analyzer utility
export class BundleAnalyzer {
  private static loadedChunks = new Set<string>();
  private static chunkSizes = new Map<string, number>();

  static trackChunkLoad(chunkName: string, size?: number): void {
    this.loadedChunks.add(chunkName);
    if (size) {
      this.chunkSizes.set(chunkName, size);
    }
    
    // Log to analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'chunk_loaded', {
        chunk_name: chunkName,
        chunk_size: size
      });
    }
  }

  static getLoadedChunks(): string[] {
    return Array.from(this.loadedChunks);
  }

  static getTotalBundleSize(): number {
    return Array.from(this.chunkSizes.values()).reduce((total, size) => total + size, 0);
  }

  static getChunkLoadingStats(): Record<string, any> {
    return {
      totalChunks: this.loadedChunks.size,
      totalSize: this.getTotalBundleSize(),
      chunks: Object.fromEntries(this.chunkSizes)
    };
  }
}

// Intelligent chunk loading based on user behavior
export class ChunkPreloader {
  private static instance: ChunkPreloader;
  private preloadQueue: Array<() => Promise<any>> = [];
  private isPreloading = false;

  static getInstance(): ChunkPreloader {
    if (!ChunkPreloader.instance) {
      ChunkPreloader.instance = new ChunkPreloader();
    }
    return ChunkPreloader.instance;
  }

  preloadForRoute(route: string): void {
    const routeChunks = this.getChunksForRoute(route);
    routeChunks.forEach(chunk => this.addToQueue(chunk));
  }

  preloadForUserIntent(intent: 'shopping' | 'browsing' | 'checkout'): void {
    const intentChunks = this.getChunksForIntent(intent);
    intentChunks.forEach(chunk => this.addToQueue(chunk));
  }

  private getChunksForRoute(route: string): Array<() => Promise<any>> {
    const routeMap: Record<string, Array<() => Promise<any>>> = {
      '/': [
        routeBasedSplits.home.hero(),
        routeBasedSplits.home.featuredProducts()
      ],
      '/products': [
        routeBasedSplits.products.productGrid(),
        routeBasedSplits.products.filters()
      ],
      '/product': [
        routeBasedSplits.productDetail.gallery(),
        routeBasedSplits.productDetail.info()
      ],
      '/cart': [
        routeBasedSplits.cart.cartItems(),
        routeBasedSplits.cart.cartSummary()
      ],
      '/checkout': [
        routeBasedSplits.checkout.checkoutForm(),
        routeBasedSplits.checkout.paymentMethods()
      ]
    };

    return routeMap[route] || [];
  }

  private getChunksForIntent(intent: string): Array<() => Promise<any>> {
    const intentMap: Record<string, Array<() => Promise<any>>> = {
      shopping: [
        routeBasedSplits.cart.cartItems(),
        routeBasedSplits.checkout.checkoutForm()
      ],
      browsing: [
        routeBasedSplits.products.filters(),
        featureBasedSplits.search.searchModal()
      ],
      checkout: [
        routeBasedSplits.checkout.paymentMethods(),
        routeBasedSplits.checkout.addressForm()
      ]
    };

    return intentMap[intent] || [];
  }

  private addToQueue(chunkLoader: () => Promise<any>): void {
    this.preloadQueue.push(chunkLoader);
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isPreloading || this.preloadQueue.length === 0) return;

    this.isPreloading = true;

    while (this.preloadQueue.length > 0) {
      const chunkLoader = this.preloadQueue.shift();
      if (chunkLoader) {
        try {
          await chunkLoader();
          // Small delay to prevent overwhelming the browser
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.warn('Failed to preload chunk:', error);
        }
      }
    }

    this.isPreloading = false;
  }
}

// Webpack bundle optimization utilities
export const webpackOptimizations = {
  // Split vendor libraries into separate chunks
  splitVendors: {
    react: {
      test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
      name: 'react-vendor',
      chunks: 'all' as const,
      priority: 20
    },
    animations: {
      test: /[\\/]node_modules[\\/](framer-motion|gsap)[\\/]/,
      name: 'animations-vendor',
      chunks: 'all' as const,
      priority: 15
    },
    ui: {
      test: /[\\/]node_modules[\\/](@headlessui|@heroicons|lucide-react)[\\/]/,
      name: 'ui-vendor',
      chunks: 'all' as const,
      priority: 10
    },
    utils: {
      test: /[\\/]node_modules[\\/](lodash|date-fns|clsx)[\\/]/,
      name: 'utils-vendor',
      chunks: 'all' as const,
      priority: 5
    }
  },

  // Optimize chunk loading
  optimization: {
    splitChunks: {
      chunks: 'all' as const,
      minSize: 20000,
      maxSize: 244000,
      cacheGroups: {
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: -10,
          chunks: 'all' as const
        }
      }
    },
    runtimeChunk: {
      name: 'runtime'
    }
  }
};

// Performance monitoring for code splitting
export function monitorChunkPerformance(): void {
  if (typeof window === 'undefined') return;

  // Monitor chunk loading times
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name.includes('chunk')) {
        BundleAnalyzer.trackChunkLoad(entry.name, entry.transferSize);
      }
    }
  });

  observer.observe({ entryTypes: ['resource'] });

  // Report bundle stats periodically
  setInterval(() => {
    const stats = BundleAnalyzer.getChunkLoadingStats();
    console.log('Bundle Stats:', stats);
    
    // Send to analytics
    if ('gtag' in window) {
      (window as any).gtag('event', 'bundle_stats', stats);
    }
  }, 30000);
}