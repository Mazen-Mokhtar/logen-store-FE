import { NextRequest, NextResponse } from 'next/server';
import productsData from '@/data/products.json';

// Transform the JSON data to match the expected API format
function transformProduct(product: any) {
  return {
    _id: product.id,
    handle: product.handle,
    title: {
      en: product.title_en,
      ar: product.title_ar
    },
    description: {
      en: product.description_en,
      ar: product.description_ar
    },
    price: product.price,
    currency: product.currency,
    images: product.images.map((img: string) => ({
      secure_url: img,
      public_id: img.split('/').pop()?.split('.')[0] || ''
    })),
    tags: product.tags,
    category: {
      _id: product.category,
      name: product.category,
      type: product.category
    },
    inStock: product.inStock,
    promotion: product.sale ? {
      isOnSale: true,
      originalPrice: product.originalPrice,
      salePrice: product.price,
      saleEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    } : undefined,
    sizes: product.sizes?.map((size: string) => ({
      name: size,
      available: true
    })),
    colors: product.colors?.map((color: string) => ({
      name: color,
      available: true
    })),
    warranty: product.warranty,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { handle: string } }
) {
  try {
    const handle = params.handle;

    // Find product by handle
    const product = productsData.find(p => p.handle === handle);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Product not found'
          }
        },
        { status: 404 }
      );
    }

    // Transform product to match API format
    const transformedProduct = transformProduct(product);

    return NextResponse.json({
      success: true,
      data: transformedProduct
    });

  } catch (error) {
    console.error('Product Handle API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch product'
        }
      },
      { status: 500 }
    );
  }
}