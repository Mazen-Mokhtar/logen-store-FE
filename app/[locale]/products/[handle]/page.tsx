import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import ProductDetailClient from './ProductDetailClient';
import ProductDetailSkeleton from '@/components/LoadingStates/ProductDetailSkeleton';
import { config } from '@/lib/config';

interface PageProps {
  params: { 
    locale: string;
    handle: string;
  };
}

// Enable ISR with revalidation every 60 seconds for product pages (optimized for performance)
export const revalidate = 60;

// Generate static params for popular products first
export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
    
    // Fetch popular/featured products first for better performance
    const response = await fetch(`${baseUrl}/products?limit=50&sort=popular`, {
      next: { revalidate: 3600 } // Cache for 1 hour during build
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    const products = data.data || [];
    
    // Generate params for all locale/handle combinations for popular products
    const params = [];
    for (const locale of config.i18n.locales) {
      for (const product of products) {
        if (product.handle) {
          params.push({
            locale,
            handle: product.handle,
          });
        }
      }
    }
    
    return params;
  } catch (error) {
    console.error('Failed to generate static params:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, handle } = params;
  
  if (!config.i18n.locales.includes(locale)) {
    notFound();
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/products/handle/${handle}`, {
      next: { revalidate: 30 }
    });

    if (!response.ok) {
      return {
        title: locale === 'ar' ? 'المنتج غير موجود - لوجين' : 'Product Not Found - Logen',
        description: locale === 'ar' 
          ? 'المنتج المطلوب غير موجود أو تم حذفه'
          : 'The requested product could not be found or has been removed.',
      };
    }

    const data = await response.json();
    const product = data.data;

    if (!product) {
      return {
        title: locale === 'ar' ? 'المنتج غير موجود - لوجين' : 'Product Not Found - Logen',
        description: locale === 'ar' 
          ? 'المنتج المطلوب غير موجود أو تم حذفه'
          : 'The requested product could not be found or has been removed.',
      };
    }

    const isRTL = locale === 'ar';
    const title = isRTL ? product.title?.ar || product.title?.en : product.title?.en || product.title?.ar;
    const description = isRTL ? product.description?.ar || product.description?.en : product.description?.en || product.description?.ar;
    const image = product.images?.[0]?.secure_url || '/mvp-images/1.jpg';
    const price = product.price;
    const currency = isRTL ? 'ر.س' : 'SAR';

    return {
      title: `${title} - ${isRTL ? 'لوجين' : 'Logen'}`,
      description: description,
      keywords: isRTL 
        ? [title, product.category?.name, 'أزياء', 'ملابس', 'لوجين', 'تسوق', ...(Array.isArray(product.tags) ? product.tags : [])].filter(Boolean).join(', ')
        : [title, product.category?.name, 'fashion', 'clothing', 'logen', 'shopping', ...(Array.isArray(product.tags) ? product.tags : [])].filter(Boolean).join(', '),
      openGraph: {
        title: `${title} - ${isRTL ? 'لوجين' : 'Logen'}`,
        description: description,
        url: `${baseUrl}/${locale}/products/${handle}`,
        siteName: isRTL ? 'لوجين' : 'Logen',
        locale: locale,
        type: 'website',
        images: [
          {
            url: image,
            width: 800,
            height: 800,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} - ${isRTL ? 'لوجين' : 'Logen'}`,
        description: `${description} - ${price} ${currency}`,
        images: [image],
      },
      alternates: {
        canonical: `${baseUrl}/${locale}/products/${handle}`,
        languages: {
          'en': `${baseUrl}/en/products/${handle}`,
          'ar': `${baseUrl}/ar/products/${handle}`,
        },
      },
    };
  } catch (error) {
    console.error('Failed to generate metadata:', error);
    return {
      title: locale === 'ar' ? 'خطأ - لوجين' : 'Error - Logen',
      description: locale === 'ar' 
        ? 'حدث خطأ أثناء تحميل المنتج'
        : 'An error occurred while loading the product.',
    };
  }
}

// Fetch product data at build time for ISR with optimized caching
async function getProductData(handle: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
    
    // Fetch product and related products in parallel with optimized caching
    const [productRes, relatedRes] = await Promise.all([
      fetch(`${baseUrl}/products/handle/${handle}`, {
        next: { 
          revalidate: 60, // Cache product data for 1 minute
          tags: [`product-${handle}`] // Enable tag-based revalidation
        }
      }),
      fetch(`${baseUrl}/products?limit=8&sort=popular`, {
        next: { 
          revalidate: 300, // Cache related products for 5 minutes
          tags: ['related-products']
        }
      })
    ]);

    const productData = productRes.ok ? await productRes.json() : null;
    const relatedData = relatedRes.ok ? await relatedRes.json() : { data: [] };

    if (!productData?.success || !productData.data) {
      return null;
    }

    // Filter related products (same category, different product) with better logic
    const relatedProducts = (relatedData.data || [])
      .filter((p: any) => 
        p.category?._id === productData.data.category?._id && 
        p._id !== productData.data._id &&
        p.inStock // Only show in-stock related products
      )
      .slice(0, 4);

    return {
      product: productData.data,
      relatedProducts,
    };
  } catch (error) {
    console.error('Failed to fetch product data:', error);
    return null;
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { locale, handle } = params;
  
  if (!config.i18n.locales.includes(locale)) {
    notFound();
  }

  // Get product data for ISR
  const data = await getProductData(handle);

  if (!data) {
    notFound();
  }

  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailClient 
        locale={locale}
        product={data.product}
        relatedProducts={data.relatedProducts}
      />
    </Suspense>
  );
}