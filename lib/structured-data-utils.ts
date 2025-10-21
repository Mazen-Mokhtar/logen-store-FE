import { config } from '@/lib/config';

export interface StructuredDataConfig {
  locale: string;
  baseUrl: string;
  siteName: string;
  businessName: string;
}

export function generateWebsiteStructuredData(locale: string = 'en') {
  const baseUrl = config.site.url;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    name: config.site.name,
    url: baseUrl,
    description: config.seo.defaultDescription,
    inLanguage: locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/${locale}/collections?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
    },
  };
}

export function generateOrganizationStructuredData() {
  const baseUrl = config.site.url;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: config.business.name,
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/logo.png`,
      width: 512,
      height: 512,
    },
    description: config.seo.defaultDescription,
    sameAs: [
      config.social.facebook,
      config.social.twitter,
      config.social.instagram,
      config.social.linkedin,
    ].filter(Boolean),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: config.business.phone,
        contactType: 'customer service',
        availableLanguage: ['English', 'Arabic'],
        areaServed: 'SA',
      },
      {
        '@type': 'ContactPoint',
        email: config.business.email,
        contactType: 'customer service',
        availableLanguage: ['English', 'Arabic'],
        areaServed: 'SA',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'SA',
      addressLocality: 'Riyadh',
    },
  };
}

export function generateElectronicsStoreStructuredData() {
  const baseUrl = config.site.url;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'ElectronicsStore',
    '@id': `${baseUrl}/#business`,
    name: config.business.name,
    url: baseUrl,
    description: config.seo.defaultDescription,
    image: `${baseUrl}/logo.png`,
    telephone: config.business.phone,
    email: config.business.email,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'SA',
      addressLocality: 'Riyadh',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '00:00',
      closes: '23:59',
    },
    currenciesAccepted: 'SAR',
    paymentAccepted: ['Credit Card', 'Debit Card', 'Cash on Delivery', 'Apple Pay', 'Google Pay'],
    priceRange: '$',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Electronics and Accessories',
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: 'Mobile Phones & Accessories',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Mobile Phones' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Phone Cases' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Screen Protectors' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Chargers' } },
          ],
        },
        {
          '@type': 'OfferCatalog',
          name: 'Audio & Headphones',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Headphones' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Earbuds' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Bluetooth Speakers' } },
          ],
        },
        {
          '@type': 'OfferCatalog',
          name: 'Computer Accessories',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Keyboards' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Mice' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Laptops' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Tablets' } },
          ],
        },
      ],
    },
    sameAs: [
      config.social.facebook,
      config.social.twitter,
      config.social.instagram,
      config.social.linkedin,
    ].filter(Boolean),
  };
}

export function generateProductStructuredData(product: any, locale: string = 'en') {
  const baseUrl = config.site.url;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${baseUrl}/products/${product.handle}`,
    name: product.title?.[locale] || product.title,
    description: product.description?.[locale] || product.description,
    image: product.images?.map((img: any) => 
      img.secure_url ? `${baseUrl}${img.secure_url}` : img
    ) || [],
    brand: {
      '@type': 'Brand',
      name: product.brand || config.business.name,
    },
    manufacturer: {
      '@type': 'Organization',
      name: product.manufacturer || config.business.name,
    },
    category: product.category?.name || product.category || 'Electronics',
    sku: product.sku || product._id,
    mpn: product.mpn || product._id,
    gtin: product.gtin || product.ean || product.upc,
    offers: {
      '@type': 'Offer',
      '@id': `${baseUrl}/products/${product.handle}#offer`,
      price: product.price?.toString(),
      priceCurrency: 'SAR',
      availability: product.inStock 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      url: `${baseUrl}/${locale}/products/${product.handle}`,
      seller: {
        '@type': 'Organization',
        name: config.business.name,
        '@id': `${baseUrl}/#organization`,
      },
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'SAR',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 3,
            unitCode: 'DAY',
          },
        },
      },
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating.toString(),
      reviewCount: product.reviewCount?.toString() || '1',
      bestRating: '5',
      worstRating: '1',
    } : undefined,
    review: product.reviews?.map((review: any) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: '5',
      },
      author: {
        '@type': 'Person',
        name: review.author || 'Anonymous',
      },
      reviewBody: review.comment,
      datePublished: review.date || new Date().toISOString(),
    })) || [],
  };
}

export function generateCollectionStructuredData(
  collection: any, 
  locale: string = 'en',
  breadcrumbs?: Array<{ name: string; url: string }>
) {
  const baseUrl = config.site.url;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${baseUrl}/${locale}/collections/${collection.handle}`,
    name: collection.title?.[locale] || collection.title,
    description: collection.description?.[locale] || collection.description,
    url: `${baseUrl}/${locale}/collections/${collection.handle}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: collection.products?.length || 0,
      itemListElement: collection.products?.map((product: any, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          '@id': `${baseUrl}/products/${product.handle}`,
          name: product.title?.[locale] || product.title,
          image: product.images?.[0]?.secure_url ? `${baseUrl}${product.images[0].secure_url}` : undefined,
          offers: {
            '@type': 'Offer',
            price: product.price?.toString(),
            priceCurrency: 'SAR',
            availability: product.inStock 
              ? 'https://schema.org/InStock' 
              : 'https://schema.org/OutOfStock',
          },
        },
      })) || [],
    },
    breadcrumb: breadcrumbs ? {
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    } : undefined,
  };
}

export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

export function generateSearchActionStructuredData(locale: string = 'en') {
  const baseUrl = config.site.url;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/${locale}/collections?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// Combined structured data for homepage
export function generateHomepageStructuredData(locale: string = 'en') {
  return [
    generateWebsiteStructuredData(locale),
    generateOrganizationStructuredData(),
    generateElectronicsStoreStructuredData(),
  ];
}