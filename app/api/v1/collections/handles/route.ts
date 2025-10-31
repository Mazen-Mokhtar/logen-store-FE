import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // For now, return some sample collection handles
    // In a real application, this would come from your collections data
    const handles = ['featured', 'new-arrivals', 'sale', 'tshirts', 'hoodies', 'pants'];
    
    console.log('Collection handles retrieved:', { 
      handlesLength: handles.length,
      handles: handles
    });

    // Return the handles in the expected format
    return NextResponse.json({
      success: true,
      handles: handles,
      total: handles.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Collection Handles API Error:', error);
    return NextResponse.json(
      {
        success: false,
        handles: [], // Ensure handles is always an array
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch collection handles',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}