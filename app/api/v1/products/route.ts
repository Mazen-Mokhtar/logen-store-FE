import { NextRequest, NextResponse } from 'next/server';

// Backend API URL
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3000/api';

export async function GET(request: NextRequest) {
  try {
    // Get the search parameters from the request
    const searchParams = request.nextUrl.searchParams;
    
    // Build the backend URL with the same query parameters
    const backendUrl = `${BACKEND_API_URL}/products?${searchParams.toString()}`;
    
    console.log('Proxying request to backend:', backendUrl);
    
    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward any authorization headers if present
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        })
      }
    });

    if (!response.ok) {
      console.error('Backend response not ok:', response.status, response.statusText);
      throw new Error(`Backend API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Backend response received:', { 
      success: data.success, 
      dataLength: data.data?.length || 0,
      total: data.pagination?.total || 0 
    });

    // Ensure data.data is always an array
    if (data.data && !Array.isArray(data.data)) {
      data.data = [];
    }

    // Return the backend response with array safety
    return NextResponse.json(data);

  } catch (error) {
    console.error('Products API Proxy Error:', error);
    return NextResponse.json(
      {
        success: false,
        data: [], // Ensure data is always an array
        products: [], // Ensure products is always an array
        error: {
          code: 'PROXY_ERROR',
          message: 'Failed to fetch products from backend',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}