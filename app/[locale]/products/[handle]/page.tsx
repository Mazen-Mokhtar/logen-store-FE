import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import ProductDetailClient from './ProductDetailClient';
import { config } from '@/lib/config';

interface PageProps {
  params: { 
    locale: string;
    handle: string;
  };
}

// Enable ISR with revalidation every 30 seconds for product pages
export const revalidate = 30;

// Generate static params for all products
export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
    const response = await fetch(`${baseUrl}/products?limit=1000`);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    const products = data.data || [];
    
    // Generate params for all locale/handle combinations
    const params = [];
    for (const locale of config.i18n.locales) {
      for (const product of products) {
        params.push({
          locale,
          handle: product.handle,
        });
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

// Fetch product data at build time for ISR
async function getProductData(handle: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
    
    // Fetch product and related products in parallel
    const [productRes, relatedRes] = await Promise.all([
      fetch(`${baseUrl}/products/handle/${handle}`, {
        next: { revalidate: 30 }
      }),
      fetch(`${baseUrl}/products?limit=8`, {
        next: { revalidate: 60 }
      })
    ]);

    const productData = productRes.ok ? await productRes.json() : null;
    const relatedData = relatedRes.ok ? await relatedRes.json() : { data: [] };

    if (!productData?.success || !productData.data) {
      return null;
    }

    // Filter related products (same category, different product)
    const relatedProducts = (relatedData.data || [])
      .filter((p: any) => 
        p.category?._id === productData.data.category?._id && 
        p._id !== productData.data._id
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
    <Suspense fallback={
      <div className="pt-20 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            {/* Back button skeleton */}
            <div className="h-6 bg-gray-200 rounded w-32 mb-8"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
              {/* Image gallery skeleton */}
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-2xl"></div>
                <div className="flex space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
              
              {/* Product info skeleton */}
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <ProductDetailClient 
        locale={locale}
        product={data.product}
        relatedProducts={data.relatedProducts}
      />
    </Suspense>
  );
}