import { config } from './config';
import { Metadata } from 'next';

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string | string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'collection';
  locale?: string;
  alternateLocales?: string[];
  noIndex?: boolean;
  noFollow?: boolean;
  productData?: {
    price?: string;
    currency?: string;
    availability?: string;
    brand?: string;
    category?: string;
  };
}

export interface LocalizedSEOData {
  en: {
    title: string;
    description: string;
    keywords: string[];
  };
  ar: {
    title: string;
    description: string;
    keywords: string[];
  };
}

// Electronics store specific SEO templates
export const seoTemplates = {
  homepage: {
    en: {
      title: `${config.business.name} - Electronics & Mobile Accessories Store`,
      description: `Shop premium electronics, mobile phones, computer accessories, headphones, chargers, and tech gear at ${config.business.name}. Fast shipping, quality products, and excellent customer service.`,
      keywords: ['electronics store', 'mobile accessories', 'computer accessories', 'headphones', 'chargers', 'tech gear', 'smartphones', 'laptops']
    },
    ar: {
      title: `${config.business.name} - متجر الإلكترونيات وإكسسوارات الهواتف المحمولة`,
      description: `تسوق الإلكترونيات المتميزة والهواتف المحمولة وإكسسوارات الكمبيوتر وسماعات الرأس والشواحن والمعدات التقنية في ${config.business.name}. شحن سريع ومنتجات عالية الجودة وخدمة عملاء ممتازة.`,
      keywords: ['متجر إلكترونيات', 'إكسسوارات الهواتف', 'إكسسوارات الكمبيوتر', 'سماعات رأس', 'شواحن', 'معدات تقنية', 'هواتف ذكية', 'أجهزة لابتوب']
    }
  },
  products: {
    en: {
      title: `Products - ${config.business.name}`,
      description: `Browse our extensive collection of electronics and mobile accessories. Find phones, chargers, headphones, keyboards, and more tech products.`,
      keywords: ['products', 'electronics', 'mobile accessories', 'tech products', 'gadgets']
    },
    ar: {
      title: `المنتجات - ${config.business.name}`,
      description: `تصفح مجموعتنا الواسعة من الإلكترونيات وإكسسوارات الهواتف المحمولة. اعثر على الهواتف والشواحن وسماعات الرأس ولوحات المفاتيح والمزيد من المنتجات التقنية.`,
      keywords: ['منتجات', 'إلكترونيات', 'إكسسوارات الهواتف', 'منتجات تقنية', 'أدوات ذكية']
    }
  },
  collections: {
    en: {
      title: `Collections - ${config.business.name}`,
      description: `Explore our curated collections of electronics and accessories. Mobile phones, computer gear, audio equipment, and charging solutions.`,
      keywords: ['collections', 'mobile phones', 'computer accessories', 'audio equipment', 'charging solutions']
    },
    ar: {
      title: `المجموعات - ${config.business.name}`,
      description: `استكشف مجموعاتنا المنتقاة من الإلكترونيات والإكسسوارات. الهواتف المحمولة ومعدات الكمبيوتر ومعدات الصوت وحلول الشحن.`,
      keywords: ['مجموعات', 'هواتف محمولة', 'إكسسوارات الكمبيوتر', 'معدات صوتية', 'حلول الشحن']
    }
  }
};

// Generate localized metadata
export function generateLocalizedMetadata(
  pageType: keyof typeof seoTemplates,
  locale: string = config.i18n.defaultLocale,
  customData?: Partial<SEOConfig>
): Metadata {
  const template = seoTemplates[pageType]?.[locale as keyof LocalizedSEOData] || seoTemplates[pageType]?.en;
  
  const title = customData?.title || template?.title || config.seo.defaultTitle;
  const description = customData?.description || template?.description || config.seo.defaultDescription;
  const keywords = customData?.keywords || template?.keywords || config.seo.defaultKeywords.split(',');
  
  const keywordsArray = Array.isArray(keywords) ? keywords : keywords.split(',');
  
  return {
    title,
    description,
    keywords: keywordsArray,
    openGraph: {
      title,
      description,
      url: customData?.url || config.site.url,
      siteName: config.business.name,
      images: [
        {
          url: customData?.image || config.seo.ogImage,
          width: config.seo.ogImageWidth,
          height: config.seo.ogImageHeight,
          alt: `${config.business.name} - ${title}`,
        },
      ],
      locale,
      type: (customData?.type === 'product' || customData?.type === 'collection') ? 'website' : (customData?.type || 'website'),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: config.social.twitterHandle,
      images: [customData?.image || config.seo.ogImage],
    },
    robots: {
      index: !customData?.noIndex,
      follow: !customData?.noFollow,
      googleBot: {
        index: !customData?.noIndex,
        follow: !customData?.noFollow,
      },
    },
    alternates: {
      canonical: customData?.url || config.site.url,
      languages: generateHreflangAlternates(customData?.url || '/', customData?.alternateLocales),
    },
  };
}

// Generate hreflang alternates
export function generateHreflangAlternates(path: string, locales?: string[]) {
  const supportedLocales = locales || config.i18n.supportedLocales;
  const alternates: Record<string, string> = {};
  
  if (Array.isArray(supportedLocales) && supportedLocales.length > 0) {
    supportedLocales.forEach(locale => {
      const hreflang = locale === 'en' ? 'en-US' : 'ar-SA';
      alternates[hreflang] = `${config.site.url}/${locale}${path}`;
    });
  }
  
  // Add x-default for the default locale
  alternates['x-default'] = `${config.site.url}${path}`;
  
  return alternates;
}

// Generate canonical URL
export function generateCanonicalUrl(path: string, locale?: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const localePrefix = locale && locale !== config.i18n.defaultLocale ? `/${locale}` : '';
  return `${config.site.url}${localePrefix}${cleanPath}`;
}

// Generate product-specific SEO
export function generateProductSEO(
  product: {
    name: string;
    description?: string;
    price?: number;
    currency?: string;
    category?: string;
    brand?: string;
    images?: string[];
  },
  locale: string = config.i18n.defaultLocale
): SEOConfig {
  const isArabic = locale === 'ar';
  
  const title = isArabic 
    ? `${product.name} - ${config.business.name}`
    : `${product.name} - ${config.business.name}`;
    
  const description = product.description || 
    (isArabic 
      ? `اشتري ${product.name} من ${config.business.name}. منتجات إلكترونية عالية الجودة مع شحن سريع وخدمة عملاء ممتازة.`
      : `Buy ${product.name} from ${config.business.name}. High-quality electronics with fast shipping and excellent customer service.`
    );
  
  const keywords = isArabic
    ? [product.name, product.category || 'إلكترونيات', product.brand || '', 'متجر إلكترونيات', 'إكسسوارات']
    : [product.name, product.category || 'electronics', product.brand || '', 'electronics store', 'accessories'];

  return {
    title,
    description,
    keywords: keywords.filter(Boolean),
    image: product.images?.[0],
    type: 'product',
    productData: {
      price: product.price?.toString(),
      currency: product.currency || config.business.currency,
      availability: 'in_stock',
      brand: product.brand,
      category: product.category,
    },
  };
}

// Generate collection-specific SEO
export function generateCollectionSEO(
  collection: {
    name: string;
    description?: string;
    productCount?: number;
    image?: string;
  },
  locale: string = config.i18n.defaultLocale
): SEOConfig {
  const isArabic = locale === 'ar';
  
  const title = isArabic
    ? `${collection.name} - ${config.business.name}`
    : `${collection.name} - ${config.business.name}`;
    
  const description = collection.description ||
    (isArabic
      ? `تصفح مجموعة ${collection.name} في ${config.business.name}. ${collection.productCount || 'العديد من'} المنتجات الإلكترونية عالية الجودة.`
      : `Browse ${collection.name} collection at ${config.business.name}. ${collection.productCount || 'Many'} high-quality electronics products.`
    );
  
  const keywords = isArabic
    ? [collection.name, 'مجموعة', 'إلكترونيات', 'متجر', config.business.name]
    : [collection.name, 'collection', 'electronics', 'store', config.business.name];

  return {
    title,
    description,
    keywords,
    image: collection.image,
    type: 'website',
  };
}

// SEO utility for dynamic pages
export function generateDynamicSEO(
  pageData: {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    path?: string;
  },
  locale: string = config.i18n.defaultLocale
): Metadata {
  return generateLocalizedMetadata('homepage', locale, {
    title: pageData.title,
    description: pageData.description,
    keywords: pageData.keywords,
    image: pageData.image,
    url: pageData.path ? generateCanonicalUrl(pageData.path, locale) : undefined,
  });
}