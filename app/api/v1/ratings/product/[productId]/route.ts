import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3001/api';

// Simple function to extract userId and userName from nested structure
function processRatings(data: any): any {
  if (data?.data?.ratings && Array.isArray(data.data.ratings)) {
    data.data.ratings = data.data.ratings.map((rating: any) => {
      if (rating.userId && typeof rating.userId === 'object' && rating.userId._id) {
        return {
          ...rating,
          userId: rating.userId._id,
          userName: rating.userId.userName || 'Anonymous User'
        };
      }
      return rating;
    });
  }
  return data;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const backendUrl = `${BACKEND_API_URL}/ratings/product/${params.productId}?${searchParams.toString()}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        })
      }
    });

    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Process ratings to extract userId and userName
    const processedData = processRatings(data);

    return NextResponse.json(processedData);

  } catch (error) {
    console.error('Product Ratings API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch product ratings',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}