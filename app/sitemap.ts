import { MetadataRoute } from 'next';
import { config } from '@/lib/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = config.site.url;
  const currentDate = new Date();

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/health`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/seo-demo`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  // Add localized versions
  const localizedPages: MetadataRoute.Sitemap = [];
  
  const locales = Array.isArray(config.i18n.locales) ? config.i18n.locales : [];
  if (locales.length > 0) {
    locales.forEach(locale => {
      if (Array.isArray(staticPages) && staticPages.length > 0) {
        staticPages.forEach(page => {
          localizedPages.push({
            ...page,
            url: locale === 'en' ? page.url : `${baseUrl}/${locale}${page.url.replace(baseUrl, '')}`,
          });
        });
      }
    });
  }

  // Product pages (mock data - in real app, fetch from database)
  const productPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/products/premium-t-shirt`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/products/classic-hoodie`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/products/denim-jeans`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/collections/t-shirts`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/collections/hoodies`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/collections/pants`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/collections/jackets`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/collections/shoes`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
  ];

  return [...localizedPages, ...productPages, ...categoryPages];
}