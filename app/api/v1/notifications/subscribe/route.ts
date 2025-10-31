import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_CONTACT_EMAIL || 'admin@logen-store.com'}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

interface SubscriptionRequest {
  subscription: PushSubscription;
  userId?: string;
  preferences?: {
    orders: boolean;
    promotions: boolean;
    newProducts: boolean;
    priceDrops: boolean;
    cartReminders: boolean;
    reviews: boolean;
  };
}

// In a real application, you would store subscriptions in a database
// For this example, we'll use a simple in-memory store
const subscriptions = new Map<string, {
  subscription: PushSubscription;
  userId?: string;
  preferences: any;
  createdAt: Date;
}>();

export async function POST(request: NextRequest) {
  try {
    const body: SubscriptionRequest = await request.json();
    const { subscription, userId, preferences } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription object' },
        { status: 400 }
      );
    }

    // Generate a unique ID for the subscription
    const subscriptionId = Buffer.from(subscription.endpoint).toString('base64');

    // Store the subscription
    subscriptions.set(subscriptionId, {
      subscription,
      userId,
      preferences: preferences || {
        orders: true,
        promotions: true,
        newProducts: false,
        priceDrops: true,
        cartReminders: true,
        reviews: true
      },
      createdAt: new Date()
    });

    console.log(`New subscription registered: ${subscriptionId}`);

    // Send a welcome notification
    try {
      const payload = JSON.stringify({
        title: 'Notifications Enabled! 🔔',
        body: 'You\'ll now receive updates about your orders and exclusive offers.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'welcome',
        data: {
          type: 'welcome',
          url: '/'
        }
      });

      await webpush.sendNotification(subscription, payload);
    } catch (notificationError) {
      console.error('Failed to send welcome notification:', notificationError);
      // Don't fail the subscription if welcome notification fails
    }

    return NextResponse.json({
      success: true,
      subscriptionId,
      message: 'Subscription registered successfully'
    });

  } catch (error) {
    console.error('Error registering subscription:', error);
    return NextResponse.json(
      { error: 'Failed to register subscription' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptionId, preferences } = body;

    if (!subscriptionId || !preferences) {
      return NextResponse.json(
        { error: 'Missing subscriptionId or preferences' },
        { status: 400 }
      );
    }

    const existingSubscription = subscriptions.get(subscriptionId);
    if (!existingSubscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Update preferences
    existingSubscription.preferences = preferences;
    subscriptions.set(subscriptionId, existingSubscription);

    console.log(`Preferences updated for subscription: ${subscriptionId}`);

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully'
    });

  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('subscriptionId');

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Missing subscriptionId' },
        { status: 400 }
      );
    }

    const deleted = subscriptions.delete(subscriptionId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    console.log(`Subscription unregistered: ${subscriptionId}`);

    return NextResponse.json({
      success: true,
      message: 'Subscription removed successfully'
    });

  } catch (error) {
    console.error('Error removing subscription:', error);
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    );
  }
}

// Helper function to get all subscriptions (for sending notifications)
export function getAllSubscriptions() {
  return Array.from(subscriptions.values());
}

// Helper function to get subscriptions by user ID
export function getSubscriptionsByUserId(userId: string) {
  return Array.from(subscriptions.values()).filter(sub => sub.userId === userId);
}

// Helper function to get subscriptions by preference
export function getSubscriptionsByPreference(preferenceKey: string) {
  return Array.from(subscriptions.values()).filter(
    sub => sub.preferences[preferenceKey] === true
  );
}