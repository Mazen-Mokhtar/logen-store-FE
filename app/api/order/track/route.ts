import { NextRequest, NextResponse } from 'next/server';

// Backend API URL
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3000/api';

export async function GET(request: NextRequest) {
  try {
    // Get the search parameters from the request
    const searchParams = request.nextUrl.searchParams;
    
    // Build the backend URL - use v1 path since that's where the actual implementation should be
    const backendUrl = `${BACKEND_API_URL}/v1/order/track?${searchParams.toString()}`;
    
    console.log('Proxying order tracking request to backend:', backendUrl);
    console.log('Query parameters:', searchParams.toString());
    
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
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      
      return NextResponse.json(
        {
          success: false,
          message: `Backend API error: ${response.status} ${response.statusText}`,
          error: errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Backend order tracking response received:', data);

    // Return the backend response
    return NextResponse.json(data);

  } catch (error) {
    console.error('Order Tracking API Proxy Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process order tracking request',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}