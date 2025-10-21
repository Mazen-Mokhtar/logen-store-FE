# SEO Documentation for Logen Store

## Overview

This documentation explains how to configure and maintain the SEO system for Logen Store, an electronics e-commerce platform. The SEO system is fully automated and environment-based, requiring no hardcoded values.

## Environment Variables Configuration

### Basic Site Configuration

```env
# Site Identity
NEXT_PUBLIC_SITE_NAME=Logen Store
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_DESCRIPTION=Your trusted store for all mobile and computer accessories

# SEO Metadata
NEXT_PUBLIC_DEFAULT_TITLE=Logen Store - Your Trusted Electronics Store in Saudi Arabia
NEXT_PUBLIC_DEFAULT_DESCRIPTION=Discover the latest smartphones, chargers, headphones, keyboards, laptops and all tech accessories at the best prices in Saudi Arabia.
NEXT_PUBLIC_DEFAULT_KEYWORDS=smartphones,chargers,headphones,keyboards,laptops,computer accessories,mobile covers,electronics store,Saudi Arabia

# Internationalization
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
NEXT_PUBLIC_SUPPORTED_LANGUAGES=en,ar
```

### Business Information

```env
# Business Details
NEXT_PUBLIC_BUSINESS_NAME=Logen Store
NEXT_PUBLIC_BUSINESS_TYPE=Electronics Store
NEXT_PUBLIC_BUSINESS_EMAIL=info@logenstore.com
NEXT_PUBLIC_BUSINESS_PHONE=+966123456789
NEXT_PUBLIC_BUSINESS_ADDRESS=Riyadh, Saudi Arabia
```

### Social Media & Open Graph

```env
# Open Graph
NEXT_PUBLIC_OG_IMAGE=https://your-domain.com/og-image.jpg
NEXT_PUBLIC_OG_IMAGE_WIDTH=1200
NEXT_PUBLIC_OG_IMAGE_HEIGHT=630

# Social Media
NEXT_PUBLIC_TWITTER_HANDLE=@logenstore
NEXT_PUBLIC_FACEBOOK_PAGE=https://facebook.com/logenstore
NEXT_PUBLIC_INSTAGRAM_HANDLE=@logenstore
NEXT_PUBLIC_LINKEDIN_COMPANY=https://linkedin.com/company/logenstore
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
```

### SEO Tools & Analytics

```env
# Site Verification
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_google_verification_code
NEXT_PUBLIC_BING_SITE_VERIFICATION=your_bing_verification_code

# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

## SEO Features Implemented

### 1. Localized Metadata Generation

The system automatically generates localized metadata for both English and Arabic:

- **Titles**: Dynamically generated based on page type and locale
- **Descriptions**: Contextual descriptions for products, categories, and pages
- **Keywords**: Relevant keywords for electronics store content
- **Open Graph**: Complete Open Graph metadata for social sharing
- **Twitter Cards**: Optimized Twitter Card metadata

### 2. Structured Data (JSON-LD)

Comprehensive structured data implementation:

- **Website Schema**: Basic website information
- **Organization Schema**: Business details and contact information
- **LocalBusiness Schema**: Electronics store with opening hours and services
- **Product Schema**: Detailed product information with pricing and availability
- **BreadcrumbList Schema**: Navigation breadcrumbs
- **SearchAction Schema**: Site search functionality

### 3. Multilingual SEO

Complete multilingual support:

- **Hreflang Tags**: Proper hreflang implementation for English and Arabic
- **Canonical URLs**: Correct canonical URLs for each locale
- **RTL Support**: Right-to-left text direction for Arabic
- **Localized URLs**: Language-specific URL structures

### 4. Performance Optimization

SEO-friendly performance features:

- **Image Optimization**: Lazy loading with proper SEO attributes
- **Core Web Vitals Monitoring**: FCP, LCP, FID, CLS, and TTFB tracking
- **Critical Resource Preloading**: Fonts, images, and CSS
- **Service Worker**: Caching for improved performance

## File Structure

```
lib/
├── config.ts                 # Environment variable configuration
├── seo-utils.ts              # SEO utility functions
├── structured-data-utils.ts  # JSON-LD structured data generators
└── performance-seo.ts        # Performance optimization utilities

components/
├── SEOHead.tsx              # Main SEO component
├── StructuredData.tsx       # Structured data component
└── FallbackSEO.tsx         # Fallback SEO for pages without data

app/
├── layout.tsx               # Global layout with SEO
└── [locale]/layout.tsx      # Localized layout with SEO
```

## Usage Examples

### Basic Page SEO

```tsx
import { SEOHead } from '@/components/SEOHead';

export default function ProductPage({ product }) {
  return (
    <>
      <SEOHead
        title={`${product.name} - ${config.site.name}`}
        description={product.description}
        type="product"
        image={product.image}
        path={`/products/${product.slug}`}
        productId={product.id}
      />
      {/* Page content */}
    </>
  );
}
```

### Fallback SEO

```tsx
import { FallbackSEO } from '@/components/FallbackSEO';

export default function CategoryPage() {
  return (
    <>
      <FallbackSEO 
        pageType="category" 
        path="/categories/smartphones"
      />
      {/* Page content */}
    </>
  );
}
```

### Higher-Order Component

```tsx
import { withSEO } from '@/components/SEOHead';

const AboutPage = () => {
  return <div>About content</div>;
};

export default withSEO(AboutPage, {
  title: 'About Us - Logen Store',
  description: 'Learn about our electronics store',
  type: 'website'
});
```

## Customization Guide

### Adding New Languages

1. Update `NEXT_PUBLIC_SUPPORTED_LANGUAGES` in `.env`:
```env
NEXT_PUBLIC_SUPPORTED_LANGUAGES=en,ar,fr
```

2. Add translations in `lib/seo-utils.ts`:
```typescript
const seoTemplates = {
  // ... existing templates
  fr: {
    homepage: {
      title: 'Logen Store - Votre magasin d\'électronique de confiance',
      description: 'Découvrez les derniers smartphones, chargeurs...',
      keywords: 'smartphones,chargeurs,écouteurs,claviers'
    }
  }
};
```

### Adding New Page Types

1. Extend the `FallbackSEO` component:
```tsx
// Add new page type
pageType?: 'home' | 'category' | 'search' | 'blog' | 'news' | 'about' | 'contact' | 'error' | 'generic';

// Add fallback content
const fallbackTitles = {
  // ... existing titles
  blog: isArabic ? 'المدونة - متجر لوجن' : 'Blog - Logen Store',
  news: isArabic ? 'الأخبار - متجر لوجن' : 'News - Logen Store'
};
```

### Custom Structured Data

```tsx
import { generateProductStructuredData } from '@/lib/structured-data-utils';

const customStructuredData = [
  generateProductStructuredData(product, locale),
  {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "Product",
      "name": product.name
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": product.rating
    }
  }
];

<SEOHead structuredData={customStructuredData} />
```

## Best Practices

### 1. Environment Variables

- Always use environment variables for configurable values
- Never hardcode URLs, titles, or descriptions
- Use descriptive variable names with `NEXT_PUBLIC_` prefix for client-side access
- Keep sensitive data (like API keys) server-side only

### 2. Content Guidelines

- **Titles**: Keep under 60 characters, include primary keywords
- **Descriptions**: 150-160 characters, compelling and descriptive
- **Keywords**: Focus on relevant, high-intent keywords for electronics
- **Images**: Always include alt text, use descriptive filenames

### 3. Performance

- Implement lazy loading for images below the fold
- Use WebP format for images when possible
- Monitor Core Web Vitals regularly
- Minimize JavaScript execution time

### 4. Multilingual SEO

- Use proper hreflang tags for all language versions
- Ensure consistent URL structure across languages
- Translate all metadata, not just content
- Consider cultural differences in keyword usage

## Monitoring and Maintenance

### 1. Regular Checks

- Monitor Google Search Console for crawl errors
- Check Core Web Vitals in PageSpeed Insights
- Verify structured data with Google's Rich Results Test
- Test hreflang implementation with international SEO tools

### 2. Performance Monitoring

The system includes automatic performance monitoring:

```typescript
// Initialize performance monitoring
import { initPerformanceOptimizations } from '@/lib/performance-seo';

// In your app initialization
initPerformanceOptimizations();
```

### 3. SEO Auditing

Regular SEO audits should include:

- Meta tag completeness and accuracy
- Structured data validation
- Image optimization and alt text
- Internal linking structure
- Page load speed optimization

## Troubleshooting

### Common Issues

1. **Missing Meta Tags**: Check environment variables are properly set
2. **Incorrect Hreflang**: Verify supported languages configuration
3. **Structured Data Errors**: Use Google's Structured Data Testing Tool
4. **Performance Issues**: Monitor Core Web Vitals and optimize images

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will log SEO metadata generation and performance metrics to the console.

## Updates and Maintenance

### Updating SEO Content

1. Modify environment variables in `.env.local`
2. Restart the development server
3. Test changes in different locales
4. Deploy to production

### Adding New Products/Categories

The SEO system automatically handles new products and categories. Ensure:

- Product data includes proper titles and descriptions
- Images have appropriate alt text
- Category pages use the fallback SEO system

### Seasonal Updates

Update seasonal keywords and descriptions:

```env
# Example: Holiday season updates
NEXT_PUBLIC_DEFAULT_KEYWORDS=smartphones,chargers,headphones,keyboards,laptops,holiday gifts,electronics deals,Black Friday,Cyber Monday
```

## Support

For technical support or questions about the SEO implementation:

1. Check this documentation first
2. Review the code comments in the SEO utility files
3. Test changes in development before deploying
4. Monitor Google Search Console for any issues

Remember: The SEO system is designed to be maintenance-free once properly configured. Most updates only require changing environment variables.