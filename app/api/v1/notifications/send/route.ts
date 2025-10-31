import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { getAllSubscriptions, getSubscriptionsByUserId, getSubscriptionsByPreference } from '../subscribe/route';

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_CONTACT_EMAIL || 'admin@logen-store.com'}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

interface SendNotificationRequest {
  type: 'order' | 'promotion' | 'newProduct' | 'priceDrop' | 'cartReminder' | 'review' | 'broadcast';
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
  tag?: string;
  userId?: string;
  targetPreference?: string;
  data?: any;
}

export async function POST(request: NextRequest) {
  try {
    const body: SendNotificationRequest = await request.json();
    const {
      type,
      title,
      body: notificationBody,
      icon = '/icons/icon-192x192.png',
      badge = '/icons/badge-72x72.png',
      image,
      url = '/',
      tag,
      userId,
      targetPreference,
      data = {}
    } = body;

    if (!title || !notificationBody) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    // Determine which subscriptions to send to
    let targetSubscriptions;
    
    if (userId) {
      // Send to specific user
      targetSubscriptions = getSubscriptionsByUserId(userId);
    } else if (targetPreference) {
      // Send to users with specific preference enabled
      targetSubscriptions = getSubscriptionsByPreference(targetPreference);
    } else {
      // Broadcast to all subscriptions
      targetSubscriptions = getAllSubscriptions();
    }

    if (targetSubscriptions.length === 0) {
      return NextResponse.json(
        { message: 'No subscriptions found for the specified criteria' },
        { status: 200 }
      );
    }

    // Prepare notification payload
    const payload = JSON.stringify({
      title,
      body: notificationBody,
      icon,
      badge,
      image,
      tag: tag || type,
      data: {
        type,
        url,
        timestamp: Date.now(),
        ...data
      },
      actions: getNotificationActions(type, data),
      requireInteraction: type === 'order' || type === 'cartReminder',
      silent: false
    });

    // Send notifications
    const results = await Promise.allSettled(
      targetSubscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(sub.subscription, payload);
          return { success: true, endpoint: sub.subscription.endpoint };
        } catch (error) {
          console.error('Failed to send notification:', error);
          return { success: false, endpoint: sub.subscription.endpoint, error };
        }
      })
    );

    // Count successful and failed sends
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;

    console.log(`Notification sent: ${successful} successful, ${failed} failed`);

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${successful} subscribers`,
      stats: {
        total: targetSubscriptions.length,
        successful,
        failed
      }
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

function getNotificationActions(type: string, data: any) {
  switch (type) {
    case 'order':
      return [
        {
          action: 'track',
          title: 'Track Order',
          icon: '/icons/track-icon.png'
        },
        {
          action: 'view',
          title: 'View Details',
          icon: '/icons/view-icon.png'
        }
      ];
    
    case 'promotion':
      return [
        {
          action: 'shop',
          title: 'Shop Now',
          icon: '/icons/shop-icon.png'
        },
        {
          action: 'save',
          title: 'Save for Later',
          icon: '/icons/save-icon.png'
        }
      ];
    
    case 'cartReminder':
      return [
        {
          action: 'checkout',
          title: 'Complete Purchase',
          icon: '/icons/cart-icon.png'
        },
        {
          action: 'view-cart',
          title: 'View Cart',
          icon: '/icons/view-icon.png'
        }
      ];
    
    case 'priceDrop':
      return [
        {
          action: 'buy',
          title: 'Buy Now',
          icon: '/icons/buy-icon.png'
        },
        {
          action: 'view-product',
          title: 'View Product',
          icon: '/icons/view-icon.png'
        }
      ];
    
    case 'review':
      return [
        {
          action: 'review',
          title: 'Write Review',
          icon: '/icons/star-icon.png'
        },
        {
          action: 'later',
          title: 'Remind Later',
          icon: '/icons/clock-icon.png'
        }
      ];
    
    default:
      return [
        {
          action: 'view',
          title: 'View',
          icon: '/icons/view-icon.png'
        }
      ];
  }
}

// Predefined notification templates
export async function sendOrderNotification(orderId: string, status: string, userId?: string) {
  const templates = {
    confirmed: {
      title: 'Order Confirmed! 🎉',
      body: `Your order #${orderId} has been confirmed and is being processed.`,
      tag: 'order-confirmed'
    },
    shipped: {
      title: 'Order Shipped! 📦',
      body: `Your order #${orderId} is on its way! Track your package for updates.`,
      tag: 'order-shipped'
    },
    delivered: {
      title: 'Order Delivered! ✅',
      body: `Your order #${orderId} has been delivered. Enjoy your purchase!`,
      tag: 'order-delivered'
    }
  };

  const template = templates[status as keyof typeof templates];
  if (!template) return;

  return fetch('/api/v1/notifications/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'order',
      ...template,
      userId,
      data: { orderId, status }
    })
  });
}

export async function sendPromotionNotification(title: string, body: string, promoCode?: string) {
  return fetch('/api/v1/notifications/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'promotion',
      title,
      body,
      targetPreference: 'promotions',
      tag: 'promotion',
      data: { promoCode }
    })
  });
}

export async function sendCartReminderNotification(userId: string, itemCount: number) {
  return fetch('/api/v1/notifications/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'cartReminder',
      title: 'Don\'t forget your cart! 🛒',
      body: `You have ${itemCount} item${itemCount > 1 ? 's' : ''} waiting for you.`,
      userId,
      tag: 'cart-reminder',
      url: '/cart'
    })
  });
}

export async function sendPriceDropNotification(productName: string, oldPrice: number, newPrice: number, userId?: string) {
  const savings = oldPrice - newPrice;
  const percentage = Math.round((savings / oldPrice) * 100);
  
  return fetch('/api/v1/notifications/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'priceDrop',
      title: `Price Drop Alert! 💰`,
      body: `${productName} is now $${newPrice} (${percentage}% off)!`,
      userId,
      targetPreference: userId ? undefined : 'priceDrops',
      tag: 'price-drop',
      data: { productName, oldPrice, newPrice, savings, percentage }
    })
  });
}