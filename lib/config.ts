import { LocaleConfig, CurrencyConfig } from '@/types';

// Environment Configuration
export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
    version: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
    endpoints: {
      products: '/products',
      categories: '/category/AllCategory',
      seo: '/seo',
      health: '/health',
    },
  },
  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    name: process.env.NEXT_PUBLIC_SITE_NAME || 'Logen Store',
    phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+1-555-0123',
    email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'info@logenstore.com',
    address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || '',
    country: process.env.NEXT_PUBLIC_BUSINESS_COUNTRY || 'US',
    currency: process.env.NEXT_PUBLIC_BUSINESS_CURRENCY || 'USD',
  },
  business: {
    name: process.env.NEXT_PUBLIC_BUSINESS_NAME || process.env.NEXT_PUBLIC_SITE_NAME || 'Logen Store',
    type: process.env.NEXT_PUBLIC_BUSINESS_TYPE || 'Electronics Store',
    description: process.env.NEXT_PUBLIC_BUSINESS_DESCRIPTION || 'Modern e-commerce platform specializing in electronics, mobile devices, and computer accessories',
    phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+1-555-LOGEN-01',
    email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'info@logenstore.com',
    address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || '123 Tech Street, Digital City, TC 12345',
    country: process.env.NEXT_PUBLIC_BUSINESS_COUNTRY || 'US',
    currency: process.env.NEXT_PUBLIC_BUSINESS_CURRENCY || 'USD',
  },
  seo: {
    defaultTitle: process.env.NEXT_PUBLIC_DEFAULT_TITLE || 'Logen Store - Electronics & Mobile Accessories',
    defaultDescription: process.env.NEXT_PUBLIC_DEFAULT_DESCRIPTION || 'Shop premium electronics, mobile phones, computer accessories, headphones, chargers, and tech gear at Logen Store. Fast shipping, quality products, and excellent customer service.',
    defaultKeywords: process.env.NEXT_PUBLIC_DEFAULT_KEYWORDS || 'mobile phones,smartphones,phone cases,screen protectors,headphones,earbuds,bluetooth speakers,chargers,cables,adapters,power banks,keyboards,mice,computer accessories,laptops,tablets,tech gear,electronics store,mobile accessories',
    siteDescription: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Your trusted store for all mobile and computer accessories',
    siteKeywords: process.env.NEXT_PUBLIC_SITE_KEYWORDS || 'phones, chargers, headphones, keyboards, laptops, computer accessories, mobile covers',
    ogImage: process.env.NEXT_PUBLIC_OG_IMAGE || '/images/og-logen-store.jpg',
    ogImageWidth: parseInt(process.env.NEXT_PUBLIC_OG_IMAGE_WIDTH || '1200'),
    ogImageHeight: parseInt(process.env.NEXT_PUBLIC_OG_IMAGE_HEIGHT || '630'),
  },
  social: {
    twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE || '@logenstore',
    twitter: process.env.NEXT_PUBLIC_TWITTER_HANDLE || '@logenstore',
    facebook: 'logen.ecommerce',
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || '@logenstore',
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_COMPANY || 'logen-store',
    facebookAppId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
  },
  i18n: {
    defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en',
    supportedLocales: (process.env.NEXT_PUBLIC_SUPPORTED_LOCALES || process.env.NEXT_PUBLIC_SUPPORTED_LANGUAGES || 'en,ar').split(','),
    locales: (process.env.NEXT_PUBLIC_SUPPORTED_LOCALES || process.env.NEXT_PUBLIC_SUPPORTED_LANGUAGES || 'en,ar').split(','),
    rtlLocales: ['ar'],
  },
  analytics: {
    id: process.env.NEXT_PUBLIC_ANALYTICS_ID || '',
    googleAnalytics: {
      trackingId: process.env.NEXT_PUBLIC_ANALYTICS_ID || '',
    },
  },
  health: {
    checkInterval: parseInt(process.env.NEXT_PUBLIC_HEALTH_CHECK_INTERVAL || '30000'),
  },
} as const;

// Locale Configuration
export const locales: LocaleConfig[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    flag: '🇺🇸',
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    flag: '🇸🇦',
  },
];

// Currency Configuration
export const currencies: CurrencyConfig[] = [
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimals: 2,
  },
  {
    code: 'SAR',
    symbol: 'ر.س',
    name: 'Saudi Riyal',
    decimals: 2,
  },
  {
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    decimals: 2,
  },
];

// API Endpoints
export const endpoints = {
  seo: {
    metadata: '/seo/metadata',
    structuredData: '/seo/structured-data',
    sitemap: '/seo/sitemap',
    hreflang: '/seo/hreflang',
  },
  health: {
    basic: '/health',
    detailed: '/health/detailed',
    metrics: '/health/metrics',
  },
  products: {
    list: '/products',
    detail: '/products',
    categories: '/categories',
  },
  orders: {
    list: '/orders',
    detail: '/orders',
    create: '/orders',
  },
} as const;

// SEO Constants
export const seoDefaults = {
  titleTemplate: '%s | ' + config.site.name,
  openGraph: {
    type: 'website' as const,
    siteName: config.site.name,
    locale: config.i18n.defaultLocale,
  },
  twitter: {
    card: 'summary_large_image' as const,
    site: config.social.twitterHandle,
  },
} as const;

// Health Status Colors
export const healthColors = {
  healthy: '#10b981', // green-500
  degraded: '#f59e0b', // amber-500
  unhealthy: '#ef4444', // red-500
} as const;

// Animation Durations
export const animations = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;