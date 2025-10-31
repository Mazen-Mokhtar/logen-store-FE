import { NextRequest, NextResponse } from 'next/server';

// Mock database - in a real app, this would be a proper database
// This should be shared with the checkout routes
const orders: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');

    console.log('Order tracking request:', { orderId, email, phone });

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
    let order = orders.find(o => o._id === orderId);

    // If order not found in memory, create a mock order for testing
    if (!order) {
      // Create a mock order for demonstration
      order = {
        _id: orderId,
        status: 'processing',
        totalAmount: 299.99,
        currency: 'EGP',
        paymentGateway: 'stripe',
        createdAt: new Date().toISOString(),
        items: [
          {
            id: 'product-1',
            name: 'Sample Product',
            quantity: 1,
            price: 299.99
          }
        ],
        shippingInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: email || 'customer@example.com',
          phone: phone || '+1234567890',
          address: '123 Main St',
          city: 'Cairo'
        },
        trackingNumber: `TRK${orderId.slice(-6).toUpperCase()}`,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
      };
      
      // Add to orders array for future requests
      orders.push(order);
    }

    // Verify email or phone if provided (for security)
    if (email && order.shippingInfo?.email !== email) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Email does not match order records'
          }
        },
        { status: 403 }
      );
    }

    if (phone && order.shippingInfo?.phone !== phone) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Phone number does not match order records'
          }
        },
        { status: 403 }
      );
    }

    // Return order tracking information
    return NextResponse.json({
      success: true,
      data: {
        orderId: order._id,
        status: order.status,
        totalAmount: order.totalAmount,
        currency: order.currency,
        paymentGateway: order.paymentGateway,
        createdAt: order.createdAt,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
        items: order.items,
        shippingInfo: {
          firstName: order.shippingInfo?.firstName,
          lastName: order.shippingInfo?.lastName,
          address: order.shippingInfo?.address,
          city: order.shippingInfo?.city
        },
        statusHistory: [
          {
            status: 'confirmed',
            timestamp: order.createdAt,
            description: 'Order confirmed and payment processed'
          },
          {
            status: 'processing',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            description: 'Order is being prepared for shipment'
          }
        ]
      }
    });

  } catch (error) {
    console.error('Order Tracking API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to track order'
        }
      },
      { status: 500 }
    );
  }
}