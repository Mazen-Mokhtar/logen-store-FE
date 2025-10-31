import { NextRequest, NextResponse } from 'next/server';
import { SEOMetadata } from '@/types';
import { config } from '@/lib/config';

// In-memory storage for demo purposes
// In a real application, this would be stored in a database
const seoData: Record<string, SEOMetadata> = {
  '/': {
    title: 'Home - Premium E-commerce Store',
    description: 'Discover our latest collection of premium products with fast shipping and excellent customer service.',
    keywords: ['ecommerce', 'shopping', 'premium', 'products', 'online store'],
    canonicalUrl: config.site.url,
    openGraph: {
      title: 'Premium E-commerce Store',
      description: 'Discover our latest collection of premium products',
      url: config.site.url,
      type: 'website',
      image: `${config.site.url}/og-home.jpg`,
      siteName: config.site.name,
    },
    twitter: {
      card: 'summary_large_image',
      site: config.social.twitter,
      creator: config.social.twitter,
      title: 'Premium E-commerce Store',
      description: 'Discover our latest collection of premium products',
      image: `${config.site.url}/og-home.jpg`,
    },
  },
  '/health': {
    title: 'System Health Dashboard',
    description: 'Monitor system health, performance metrics, and service status in real-time.',
    keywords: ['health', 'monitoring', 'dashboard', 'system', 'metrics'],
    canonicalUrl: `${config.site.url}/health`,
    openGraph: {
      title: 'System Health Dashboard',
      description: 'Real-time system monitoring and health metrics',
      url: `${config.site.url}/health`,
      type: 'website',
      image: `${config.site.url}/og-health.jpg`,
      siteName: config.site.name,
    },
    twitter: {
      card: 'summary_large_image',
      site: config.social.twitter,
      creator: config.social.twitter,
      title: 'System Health Dashboard',
      description: 'Real-time system monitoring and health metrics',
      image: `${config.site.url}/og-health.jpg`,
    },
  },
  '/seo-demo': {
    title: 'SEO & Internationalization Demo',
    description: 'Comprehensive demonstration of SEO features, internationalization, and health monitoring capabilities.',
    keywords: ['seo', 'internationalization', 'i18n', 'demo', 'features'],
    canonicalUrl: `${config.site.url}/seo-demo`,
    openGraph: {
      title: 'SEO & i18n Demo',
      description: 'Explore advanced SEO and internationalization features',
      url: `${config.site.url}/seo-demo`,
      type: 'website',
      image: `${config.site.url}/og-seo-demo.jpg`,
      siteName: config.site.name,
    },
    twitter: {
      card: 'summary_large_image',
      site: config.social.twitter,
      creator: config.social.twitter,
      title: 'SEO & i18n Demo',
      description: 'Explore advanced SEO and internationalization features',
      image: `${config.site.url}/og-seo-demo.jpg`,
    },
  },
};

// GET - Retrieve SEO data for a specific path
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '/';
  const locale = searchParams.get('locale') || 'en';

  try {
    // Get base SEO data
    let data = seoData[path];
    
    if (!data) {
      // Return default SEO data if path not found
      data = {
        title: config.seo.defaultTitle,
        description: config.seo.defaultDescription,
        keywords: config.seo.defaultKeywords,
        canonicalUrl: `${config.site.url}${path}`,
        openGraph: {
          title: config.seo.defaultTitle,
          description: config.seo.defaultDescription,
          url: `${config.site.url}${path}`,
          type: 'website',
          image: `${config.site.url}/og-default.jpg`,
          siteName: config.site.name,
        },
        twitter: {
          card: 'summary_large_image',
          site: config.social.twitter,
          creator: config.social.twitter,
          title: config.seo.defaultTitle,
          description: config.seo.defaultDescription,
          image: `${config.site.url}/og-default.jpg`,
        },
      };
    }

    // Adjust URLs for locale
    if (locale !== 'en') {
      data = {
        ...data,
        canonicalUrl: `${config.site.url}/${locale}${path}`,
        openGraph: {
          ...data.openGraph,
          url: `${config.site.url}/${locale}${path}`,
          locale: locale,
        },
      };
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('SEO API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve SEO data' },
      { status: 500 }
    );
  }
}

// POST - Update SEO data for a specific path
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, data: newData } = body;

    if (!path) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      );
    }

    // Merge with existing data
    const existingData = seoData[path] || {};
    seoData[path] = {
      ...existingData,
      ...newData,
      // Ensure canonical URL is updated
      canonicalUrl: newData.canonicalUrl || `${config.site.url}${path}`,
    };

    return NextResponse.json({
      success: true,
      data: seoData[path],
    });
  } catch (error) {
    console.error('SEO API POST error:', error);
    return NextResponse.json(
      { error: 'Failed to update SEO data' },
      { status: 500 }
    );
  }
}

// PUT - Replace SEO data for a specific path
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, data: newData } = body;

    if (!path) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      );
    }

    // Replace entire SEO data for the path
    seoData[path] = {
      ...newData,
      canonicalUrl: newData.canonicalUrl || `${config.site.url}${path}`,
    };

    return NextResponse.json({
      success: true,
      data: seoData[path],
    });
  } catch (error) {
    console.error('SEO API PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to replace SEO data' },
      { status: 500 }
    );
  }
}

// DELETE - Remove SEO data for a specific path
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json(
      { error: 'Path is required' },
      { status: 400 }
    );
  }

  try {
    delete seoData[path];
    
    return NextResponse.json({
      success: true,
      message: `SEO data for ${path} has been removed`,
    });
  } catch (error) {
    console.error('SEO API DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete SEO data' },
      { status: 500 }
    );
  }
}