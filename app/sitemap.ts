import { MetadataRoute } from 'next';
import { apiClient } from '@/lib/api';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stylehub.com';
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  // Note: In a production app, you'd want to fetch products from the API
  // For now, we'll return static pages only to avoid build-time API calls
  // You can implement ISR (Incremental Static Regeneration) for dynamic sitemaps

  return staticPages;
}