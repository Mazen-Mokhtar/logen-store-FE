// SEO Types
export interface SEOMetadata {
  title?: string;
  description?: string;
  keywords?: string | string[];
  canonical?: string;
  canonicalUrl?: string;
  robots?: string;
  author?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  locale?: string;
  alternateLocales?: string[];
  openGraph?: OpenGraphData;
  twitter?: TwitterCardData;
  structuredData?: StructuredData[];
  hreflang?: HreflangLink[];
}

export interface OpenGraphData {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  siteName?: string;
  locale?: string;
}

export interface TwitterCardData {
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  site?: string;
  creator?: string;
  title?: string;
  description?: string;
  image?: string;
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export interface HreflangLink {
  hreflang: string;
  href: string;
}

// Health Monitoring Types
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'warning' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
}

export interface DetailedHealthStatus extends HealthStatus {
  checks: {
    [key: string]: {
      status: 'pass' | 'fail' | 'warn' | 'healthy' | 'warning' | 'error';
      message?: string;
      duration?: number;
    };
  };
  system: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
      cores?: number;
    };
    disk: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

export interface HealthMetrics {
  requests: {
    total: number;
    success: number;
    error: number;
    averageResponseTime: number;
  };
  database: {
    connections: number;
    queries: number;
    averageQueryTime: number;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
  };
}

// Internationalization Types
export interface LocaleConfig {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  flag: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  decimals: number;
}

export interface LocalizedContent {
  [locale: string]: {
    [key: string]: string;
  };
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Product Types (for SEO structured data)
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  category: string;
  brand?: string;
  sku?: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  rating?: {
    value: number;
    count: number;
  };
  reviewCount?: number;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  productCount?: number;
}

// Analytics Types
export interface AnalyticsEvent {
  event: string;
  category?: string;
  action?: string;
  label?: string;
  value?: number;
  customParameters?: Record<string, any>;
}