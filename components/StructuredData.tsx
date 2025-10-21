import { config } from '@/lib/config';
import { StructuredData } from '@/types';

interface StructuredDataProps {
  type: 'website' | 'organization' | 'product' | 'breadcrumb' | 'searchbox' | 'ecommerce' | 'collection' | 'localBusiness';
  data?: any;
  breadcrumbs?: Array<{ name: string; url: string }>;
  locale?: string;
}

export function StructuredDataComponent({ type, data, breadcrumbs, locale = 'en' }: StructuredDataProps) {
  const baseUrl = config.site.url;

  const generateStructuredData = (): StructuredData | StructuredData[] => {
    switch (type) {
      case 'website':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
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
            name: config.business.name,
            url: baseUrl,
            logo: {
              '@type': 'ImageObject',
              url: `${baseUrl}/logo.png`,
              width: 512,
              height: 512,
            },
            sameAs: [
              config.social.facebook,
              config.social.twitter,
              config.social.instagram,
              config.social.linkedin,
            ].filter(Boolean),
          },
        };

      case 'organization':
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

      case 'localBusiness':
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

      case 'product':
        if (!data) return {} as StructuredData;
        return {
          '@context': 'https://schema.org',
          '@type': 'Product',
          '@id': `${baseUrl}/products/${data.handle}`,
          name: data.title?.en || data.title,
          description: data.description?.en || data.description,
          image: data.images?.map((img: any) => 
            img.secure_url ? `${baseUrl}${img.secure_url}` : img
          ) || [],
          brand: {
            '@type': 'Brand',
            name: data.brand || config.business.name,
          },
          manufacturer: {
            '@type': 'Organization',
            name: data.manufacturer || config.business.name,
          },
          category: data.category?.name || data.category || 'Electronics',
          sku: data.sku || data._id,
          mpn: data.mpn || data._id,
          gtin: data.gtin || data.ean || data.upc,
          offers: {
            '@type': 'Offer',
            '@id': `${baseUrl}/products/${data.handle}#offer`,
            price: data.price?.toString(),
            priceCurrency: 'SAR',
            availability: data.inStock 
              ? 'https://schema.org/InStock' 
              : 'https://schema.org/OutOfStock',
            url: `${baseUrl}/${locale}/products/${data.handle}`,
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
          aggregateRating: data.rating ? {
            '@type': 'AggregateRating',
            ratingValue: data.rating.toString(),
            reviewCount: data.reviewCount?.toString() || '1',
            bestRating: '5',
            worstRating: '1',
          } : undefined,
          review: Array.isArray(data.reviews) ? data.reviews.map((review: any) => ({
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
          })) : [],
        };

      case 'collection':
        if (!data) return {} as StructuredData;
        return {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': `${baseUrl}/${locale}/collections/${data.handle}`,
          name: data.title?.en || data.title,
          description: data.description?.en || data.description,
          url: `${baseUrl}/${locale}/collections/${data.handle}`,
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: data.products?.length || 0,
            itemListElement: Array.isArray(data.products) ? data.products.map((product: any, index: number) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'Product',
                '@id': `${baseUrl}/products/${product.handle}`,
                name: product.title?.en || product.title,
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
            })) : [],
          },
          breadcrumb: Array.isArray(breadcrumbs) ? {
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs.map((crumb, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: crumb.name,
              item: crumb.url,
            })),
          } : undefined,
        };

      case 'breadcrumb':
        if (!Array.isArray(breadcrumbs) || breadcrumbs.length === 0) return {} as StructuredData;
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

      case 'searchbox':
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

      case 'ecommerce':
        return {
          '@context': 'https://schema.org',
          '@type': 'Store',
          '@id': `${baseUrl}/#store`,
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
          sameAs: [
            config.social.facebook,
            config.social.twitter,
            config.social.instagram,
            config.social.linkedin,
          ].filter(Boolean),
        };

      default:
        return {} as StructuredData;
    }
  };

  const structuredData = generateStructuredData();
  
  if (!structuredData || (typeof structuredData === 'object' && Object.keys(structuredData).length === 0)) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  );
}

export default StructuredDataComponent;