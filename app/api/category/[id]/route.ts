import { NextRequest, NextResponse } from 'next/server';
import productsData from '@/data/products.json';

// Extract unique categories from products data
function getCategories() {
  const categoryMap = new Map();
  
  // Ensure productsData is an array
  const products = Array.isArray(productsData) ? productsData : [];
  
  // Additional safety check before forEach
  if (Array.isArray(products) && products.length > 0) {
    products.forEach(product => {
    if (!categoryMap.has(product.category)) {
      categoryMap.set(product.category, {
        _id: product.category,
        name: product.category.charAt(0).toUpperCase() + product.category.slice(1),
        type: product.category,
        logo: {
          secure_url: '/mvp-images/category-default.jpg',
          public_id: `category-${product.category}`
        },
        createdAt: new Date().toISOString()
      });
    }
  });
  }

  return Array.from(categoryMap.values());
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = params.id;
    const categories = getCategories();

    // Find category by ID
    const category = categories.find(c => c._id === categoryId);

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Category not found'
          }
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error('Category API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch category'
        }
      },
      { status: 500 }
    );
  }
}