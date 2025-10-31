import { NextRequest, NextResponse } from 'next/server';

// Mock database - in a real app, this would be a proper database
// This should be shared with the checkout routes
const orders: any[] = [];

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_ORDER_ID',
            message: 'Order ID is required'
          }
        },
        { status: 400 }
      );
    }

    // Find order by ID
    const order = orders.find(o => o._id === orderId);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ORDER_NOT_FOUND',
            message: 'Order not found'
          }
        },
        { status: 404 }
      );
    }

    // Return order status
    return NextResponse.json({
      success: true,
      data: {
        orderId: order._id,
        status: order.status,
        totalAmount: order.totalAmount,
        currency: order.currency,
        paymentGateway: order.paymentGateway,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('Order Status API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch order status'
        }
      },
      { status: 500 }
    );
  }
}