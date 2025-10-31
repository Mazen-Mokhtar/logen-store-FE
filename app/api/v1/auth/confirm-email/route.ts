import { NextRequest, NextResponse } from 'next/server';

// Backend API URL
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3000/api';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    
    // Build the backend URL - use v1 path since that's where the actual implementation is
    const backendUrl = `${BACKEND_API_URL}/v1/auth/confirm-email`;
    
    console.log('Proxying confirm email request to backend:', backendUrl);
    console.log('Request body:', { 
      email: body.email, 
      code: body.code ? '[PROVIDED]' : '[MISSING]'
    });
    
    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
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
    console.log('Backend confirm email response received:', { 
      success: data.success, 
      message: data.message 
    });

    // Return the backend response
    return NextResponse.json(data);

  } catch (error) {
    console.error('Confirm Email API Proxy Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process confirm email request',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}