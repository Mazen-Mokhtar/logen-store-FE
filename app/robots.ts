import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stylehub.com';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/checkout/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}