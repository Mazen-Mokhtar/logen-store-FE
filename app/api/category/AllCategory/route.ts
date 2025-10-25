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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const sort = searchParams.get('sort');

    let categories = getCategories();

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      categories = categories.filter(category => 
        category.name.toLowerCase().includes(searchLower) ||
        category.type.toLowerCase().includes(searchLower)
      );
    }

    // Filter by type
    if (type) {
      categories = categories.filter(category => 
        category.type === type
      );
    }

    // Sort categories
    if (sort) {
      switch (sort) {
        case 'name_asc':
          categories.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name_desc':
          categories.sort((a, b) => b.name.localeCompare(a.name));
          break;
        default:
          // Default sort by name
          categories.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
    }

    // Pagination
    const total = categories.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCategories = categories.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      categories: paginatedCategories,
      data: paginatedCategories,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });

  } catch (error) {
    console.error('Categories API Error:', error);
    return NextResponse.json(
      {
        success: false,
        categories: [], // Ensure categories is always an array
        data: [], // Ensure data is always an array
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch categories'
        }
      },
      { status: 500 }
    );
  }
}