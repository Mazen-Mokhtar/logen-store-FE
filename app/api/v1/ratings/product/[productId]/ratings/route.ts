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
    const backendUrl = `${BACKEND_API_URL}/v1/ratings/product/${params.productId}?${searchParams.toString()}`;
    
    // Add detailed logging
    console.log('🔍 Ratings API Debug:');
    console.log('📦 Product ID:', params.productId);
    console.log('🔗 Backend URL:', backendUrl);
    console.log('📄 Search Params:', Object.fromEntries(searchParams.entries()));
    console.log('🌐 Full Request URL:', request.url);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        })
      }
    });

    console.log('📊 Backend Response Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Backend Error Response:', errorText);
      throw new Error(`Backend API responded with status: ${response.status} - ${errorText}`);
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