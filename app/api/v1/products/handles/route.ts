import { NextRequest, NextResponse } from 'next/server';
import productsData from '@/data/products.json';

export async function GET(request: NextRequest) {
  try {
    // Extract handles from the products data
    const handles = productsData.map(product => product.handle);
    
    console.log('Product handles retrieved:', { 
      handlesLength: handles.length,
      handles: handles.slice(0, 5) // Log first 5 handles for debugging
    });

    // Return the handles in the expected format
    return NextResponse.json({
      success: true,
      handles: handles,
      total: handles.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Product Handles API Error:', error);
    return NextResponse.json(
      {
        success: false,
        handles: [], // Ensure handles is always an array
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch product handles',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}