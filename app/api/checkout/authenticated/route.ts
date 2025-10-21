import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Mock database - in a real app, this would be a proper database
const orders: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      items, 
      productName, 
      paymentMethod, 
      currency, 
      idempotencyKey,
      couponCode,
      notes 
    } = body;

    // In a real app, you would extract user info from JWT token
    // For now, we'll use mock user data
    const userId = 'auth_user_123';
    const userInfo = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      address: '123 Main St',
      city: 'Cairo',
      postalCode: '12345'
    };

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Items are required'
        },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Create order
    const orderId = uuidv4();
    const order = {
      _id: orderId,
      userId,
      productName: productName || items.map((item: any) => item.title).join(', '),
      items,
      shippingInfo: userInfo,
      totalAmount,
      currency: currency || 'EGP',
      status: paymentMethod === 'cash' ? 'pending_cod' : 'pending',
      paymentMethod,
      paymentGateway: paymentMethod === 'cash' ? 'cod' : 'stripe',
      createdAt: new Date().toISOString(),
      couponCode,
      notes,
      idempotencyKey
    };

    // Store order (in real app, save to database)
    orders.push(order);

    console.log('Authenticated order created:', orderId);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      orderId,
      userId,
      totalAmount,
      currency: currency || 'EGP',
      status: order.status,
      clientSecret: paymentMethod === 'card' ? `pi_${orderId}_secret` : undefined,
      paymentToken: paymentMethod === 'card' ? `tok_${orderId}` : undefined
    });

  } catch (error) {
    console.error('Authenticated Checkout API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process checkout'
      },
      { status: 500 }
    );
  }
}