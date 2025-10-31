import { NextRequest, NextResponse } from 'next/server';

// Backend API URL
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3000/api';

export async function POST(request: NextRequest) {
  try {
    // Build the backend URL - use v1 path since that's where the actual implementation is
    const backendUrl = `${BACKEND_API_URL}/v1/auth/logout`;
    
    console.log('Proxying logout request to backend:', backendUrl);
    
    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: 'POST',
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
    console.log('Backend logout response received:', { 
      success: data.success, 
      message: data.message 
    });

    // Return the backend response
    return NextResponse.json(data);

  } catch (error) {
    console.error('Logout API Proxy Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process logout request',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}