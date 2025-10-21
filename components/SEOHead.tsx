'use client';

import Head from 'next/head';
import { useSEO } from '@/hooks/useSEO';
import { useLocale } from '@/hooks/useLocale';
import { SEOMetadata, OpenGraphData, TwitterCardData, StructuredData } from '@/types';
import { config } from '@/lib/config';
import { generateHreflangAlternates, generateCanonicalUrl } from '@/lib/seo-utils';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  path?: string;
  productId?: string;
  categoryId?: string;
  structuredData?: StructuredData[];
  noIndex?: boolean;
  noFollow?: boolean;
  customMeta?: Array<{
    name?: string;
    property?: string;
    content: string;
  }>;
}

export function SEOHead({
  title,
  description,
  keywords,
  image,
  type = 'website',
  path,
  productId,
  categoryId,
  structuredData = [],
  noIndex = false,
  noFollow = false,
  customMeta = [],
}: SEOHeadProps) {
  const { locale } = useLocale();
  const { seoData } = useSEO(path, locale);

  // Merge props with fetched SEO data
  const finalTitle = title || seoData.title || config.seo.defaultTitle;
  const finalDescription = description || seoData.description || config.seo.defaultDescription;
  const finalKeywords = keywords || 
    (Array.isArray(seoData.keywords) ? seoData.keywords.join(',') : seoData.keywords) || 
    config.seo.defaultKeywords;
  const finalImage = image || seoData.openGraph?.image || `${config.site.url}/og-default.jpg`;
  
  // Generate canonical URL and hreflang alternates using new utilities
  const canonicalUrl = generateCanonicalUrl(path || '/', locale);
  // Generate hreflang alternates - now returns an object
  const hreflangAlternates = generateHreflangAlternates(path || '/') || {};

  // Generate robots meta content
  const robotsContent = (() => {
    const robots = [];
    if (noIndex) robots.push('noindex');
    else robots.push('index');
    
    if (noFollow) robots.push('nofollow');
    else robots.push('follow');
    
    return robots.join(',');
  })();

  // Combine structured data - ensure both are arrays
  const seoStructuredData = Array.isArray(seoData.structuredData) ? seoData.structuredData : [];
  const propsStructuredData = Array.isArray(structuredData) ? structuredData : [];
  const allStructuredData = [...seoStructuredData, ...propsStructuredData];

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {finalKeywords && <meta name="keywords" content={finalKeywords} />}
      <meta name="robots" content={robotsContent} />
      <meta name="author" content={config.business.name} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Business Information */}
      <meta name="business:contact_data:street_address" content="Riyadh, Saudi Arabia" />
      <meta name="business:contact_data:locality" content="Riyadh" />
      <meta name="business:contact_data:region" content="Riyadh Province" />
      <meta name="business:contact_data:postal_code" content="11564" />
      <meta name="business:contact_data:country_name" content="Saudi Arabia" />
      <meta name="business:contact_data:email" content={config.business.email} />
      <meta name="business:contact_data:phone_number" content={config.business.phone} />
      <meta name="business:contact_data:website" content={config.site.url} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Hreflang Alternates */}
      {Object.entries(hreflangAlternates).map(([hreflang, href]) => (
        <link
          key={hreflang}
          rel="alternate"
          hrefLang={hreflang}
          href={href}
        />
      ))}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={config.site.name} />
      <meta property="og:locale" content={locale === 'ar' ? 'ar_SA' : 'en_US'} />
      {locale === 'ar' && <meta property="og:locale:alternate" content="en_US" />}
      {locale === 'en' && <meta property="og:locale:alternate" content="ar_SA" />}
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:alt" content={finalTitle} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      
      {/* Additional Open Graph for E-commerce */}
      {type === 'product' && productId && (
        <>
          <meta property="product:brand" content={config.business.name} />
          <meta property="product:availability" content="in stock" />
          <meta property="product:condition" content="new" />
          <meta property="product:price:currency" content="SAR" />
        </>
      )}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={config.social.twitter} />
      <meta name="twitter:creator" content={config.social.twitter} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      <meta name="twitter:image:alt" content={finalTitle} />
      
      {/* Facebook App ID */}
      {config.social.facebookAppId && (
        <meta property="fb:app_id" content={config.social.facebookAppId} />
      )}
      
      {/* Theme and App Meta Tags */}
      <meta name="theme-color" content="#ffffff" />
      <meta name="color-scheme" content="light dark" />
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={config.site.name} />
      
      {/* Favicon and Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/manifest.json" />
      
      {/* DNS Prefetch and Preconnect */}
      <link rel="dns-prefetch" href={config.api.baseUrl} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
      
      {/* Site Verification */}
      {/* Commented out until verification properties are added to config
      {config.seo.googleSiteVerification && (
        <meta name="google-site-verification" content={config.seo.googleSiteVerification} />
      )}
      {config.seo.bingSiteVerification && (
        <meta name="msvalidate.01" content={config.seo.bingSiteVerification} />
      )}
      */}
      
      {/* Custom Meta Tags */}
      {Array.isArray(customMeta) && customMeta.map((meta, index) => (
        <meta
          key={index}
          {...(meta.name && { name: meta.name })}
          {...(meta.property && { property: meta.property })}
          content={meta.content}
        />
      ))}
      
      {/* Structured Data */}
      {Array.isArray(allStructuredData) && allStructuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data, null, 2),
          }}
        />
      ))}
      
      {/* Analytics */}
      {config.analytics.id && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${config.analytics.id}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${config.analytics.id}', {
                  page_title: '${finalTitle}',
                  page_location: '${canonicalUrl}',
                  custom_map: {
                    'custom_parameter_1': 'locale',
                    'custom_parameter_2': 'page_type'
                  },
                  locale: '${locale}',
                  page_type: '${type}'
                });
              `,
            }}
          />
        </>
      )}
    </Head>
  );
}

// Higher-order component for pages that need SEO
export function withSEO<P extends object>(
  Component: React.ComponentType<P>,
  seoProps?: Partial<SEOHeadProps>
) {
  const WrappedComponent = (props: P) => {
    return (
      <>
        <SEOHead {...seoProps} />
        <Component {...props} />
      </>
    );
  };

  WrappedComponent.displayName = `withSEO(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default SEOHead;