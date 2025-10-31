import { backgroundSync } from './background-sync';

// Push notification types
export type NotificationType = 
  | 'order-confirmed'
  | 'order-shipped'
  | 'order-delivered'
  | 'order-cancelled'
  | 'promotion'
  | 'new-product'
  | 'price-drop'
  | 'back-in-stock'
  | 'cart-reminder'
  | 'review-request'
  | 'welcome'
  | 'general';

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: {
    type: NotificationType;
    url?: string;
    orderId?: string;
    productId?: string;
    userId?: string;
    timestamp: number;
    [key: string]: any;
  };
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
}

export interface NotificationSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId?: string;
  preferences: {
    orders: boolean;
    promotions: boolean;
    newProducts: boolean;
    priceDrops: boolean;
    cartReminders: boolean;
    reviews: boolean;
  };
  createdAt: Date;
  lastUsed: Date;
}

export interface NotificationTemplate {
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  vibrate?: number[];
}

class PushNotificationManager {
  private vapidPublicKey: string;
  private isSupported: boolean;
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private templates: Map<NotificationType, NotificationTemplate> = new Map();

  constructor() {
    this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
    this.isSupported = this.checkSupport();
    this.initializeTemplates();
  }

  private checkSupport(): boolean {
    if (typeof window === 'undefined') return false;
    
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  private initializeTemplates(): void {
    const templates: NotificationTemplate[] = [
      {
        type: 'order-confirmed',
        title: 'Order Confirmed! 🎉',
        body: 'Your order #{orderId} has been confirmed and is being processed.',
        icon: '/icons/order-confirmed.png',
        actions: [
          { action: 'view-order', title: 'View Order', icon: '/icons/view.png' },
          { action: 'track-order', title: 'Track Order', icon: '/icons/track.png' }
        ],
        requireInteraction: true,
        vibrate: [200, 100, 200]
      },
      {
        type: 'order-shipped',
        title: 'Order Shipped! 📦',
        body: 'Your order #{orderId} is on its way! Track your package for updates.',
        icon: '/icons/shipped.png',
        actions: [
          { action: 'track-order', title: 'Track Package', icon: '/icons/track.png' }
        ],
        vibrate: [200, 100, 200]
      },
      {
        type: 'order-delivered',
        title: 'Order Delivered! ✅',
        body: 'Your order #{orderId} has been delivered. Enjoy your purchase!',
        icon: '/icons/delivered.png',
        actions: [
          { action: 'rate-order', title: 'Rate Order', icon: '/icons/star.png' },
          { action: 'view-order', title: 'View Order', icon: '/icons/view.png' }
        ],
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200]
      },
      {
        type: 'promotion',
        title: 'Special Offer! 🔥',
        body: 'Don\'t miss out on our latest deals and promotions!',
        icon: '/icons/promotion.png',
        actions: [
          { action: 'view-deals', title: 'View Deals', icon: '/icons/shopping.png' }
        ],
        vibrate: [100, 50, 100]
      },
      {
        type: 'new-product',
        title: 'New Arrival! ✨',
        body: 'Check out our latest products just added to the store.',
        icon: '/icons/new-product.png',
        actions: [
          { action: 'view-product', title: 'View Product', icon: '/icons/view.png' }
        ]
      },
      {
        type: 'price-drop',
        title: 'Price Drop Alert! 💰',
        body: 'The item in your wishlist is now on sale!',
        icon: '/icons/price-drop.png',
        actions: [
          { action: 'view-product', title: 'View Product', icon: '/icons/view.png' },
          { action: 'add-to-cart', title: 'Add to Cart', icon: '/icons/cart.png' }
        ],
        requireInteraction: true,
        vibrate: [200, 100, 200]
      },
      {
        type: 'back-in-stock',
        title: 'Back in Stock! 📦',
        body: 'The item you were waiting for is now available!',
        icon: '/icons/in-stock.png',
        actions: [
          { action: 'view-product', title: 'View Product', icon: '/icons/view.png' },
          { action: 'add-to-cart', title: 'Add to Cart', icon: '/icons/cart.png' }
        ],
        requireInteraction: true,
        vibrate: [200, 100, 200]
      },
      {
        type: 'cart-reminder',
        title: 'Don\'t Forget Your Cart! 🛒',
        body: 'You have items waiting in your cart. Complete your purchase now!',
        icon: '/icons/cart-reminder.png',
        actions: [
          { action: 'view-cart', title: 'View Cart', icon: '/icons/cart.png' },
          { action: 'checkout', title: 'Checkout', icon: '/icons/checkout.png' }
        ]
      },
      {
        type: 'review-request',
        title: 'How was your experience? ⭐',
        body: 'We\'d love to hear about your recent purchase!',
        icon: '/icons/review.png',
        actions: [
          { action: 'write-review', title: 'Write Review', icon: '/icons/star.png' }
        ]
      },
      {
        type: 'welcome',
        title: 'Welcome to Our Store! 👋',
        body: 'Thanks for enabling notifications. We\'ll keep you updated on your orders and special offers.',
        icon: '/icons/welcome.png',
        actions: [
          { action: 'browse-products', title: 'Browse Products', icon: '/icons/shopping.png' }
        ],
        vibrate: [200, 100, 200]
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.type, template);
    });
  }

  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported in this browser');
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully');

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    
    // Track permission request
    await backgroundSync.syncAnalyticsEvent('notification_permission_requested', {
      permission,
      timestamp: Date.now()
    });

    return permission;
  }

  async subscribe(userId?: string, preferences?: Partial<NotificationSubscription['preferences']>): Promise<PushSubscription | null> {
    if (!this.registration || !this.vapidPublicKey) {
      console.error('Service Worker not registered or VAPID key missing');
      return null;
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    try {
      // Subscribe to push notifications
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      // Save subscription to server
      const subscriptionData: NotificationSubscription = {
        endpoint: this.subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(this.subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(this.subscription.getKey('auth')!)))
        },
        userId,
        preferences: {
          orders: true,
          promotions: true,
          newProducts: false,
          priceDrops: true,
          cartReminders: true,
          reviews: true,
          ...preferences
        },
        createdAt: new Date(),
        lastUsed: new Date()
      };

      await this.saveSubscription(subscriptionData);

      // Track successful subscription
      await backgroundSync.syncAnalyticsEvent('notification_subscribed', {
        userId,
        endpoint: this.subscription.endpoint,
        timestamp: Date.now()
      });

      return this.subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      
      // Track subscription failure
      await backgroundSync.syncAnalyticsEvent('notification_subscription_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });

      return null;
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      return false;
    }

    try {
      const success = await this.subscription.unsubscribe();
      
      if (success) {
        // Remove subscription from server
        await this.removeSubscription(this.subscription.endpoint);
        this.subscription = null;

        // Track unsubscription
        await backgroundSync.syncAnalyticsEvent('notification_unsubscribed', {
          timestamp: Date.now()
        });
      }

      return success;
    } catch (error) {
      console.error('Push unsubscription failed:', error);
      return false;
    }
  }

  async sendNotification(type: NotificationType, data: any = {}): Promise<boolean> {
    const template = this.templates.get(type);
    if (!template) {
      console.error(`No template found for notification type: ${type}`);
      return false;
    }

    // Replace placeholders in template
    const notification: PushNotificationPayload = {
      title: this.replacePlaceholders(template.title, data),
      body: this.replacePlaceholders(template.body, data),
      icon: template.icon || '/icons/default.png',
      badge: '/icons/badge.png',
      tag: type,
      data: {
        type,
        timestamp: Date.now(),
        ...data
      },
      actions: template.actions,
      requireInteraction: template.requireInteraction,
      vibrate: template.vibrate
    };

    try {
      // Send to server for delivery
      await this.sendToServer(notification);

      // Track notification sent
      await backgroundSync.syncAnalyticsEvent('notification_sent', {
        type,
        timestamp: Date.now()
      });

      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      
      // Queue for background sync
      await backgroundSync.syncFormSubmission('notification', {
        type: 'send-notification',
        payload: notification,
        timestamp: Date.now()
      });

      return false;
    }
  }

  async updatePreferences(preferences: Partial<NotificationSubscription['preferences']>): Promise<boolean> {
    if (!this.subscription) {
      return false;
    }

    try {
      await fetch('/api/v1/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: this.subscription.endpoint,
          preferences
        })
      });

      return true;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      
      // Queue for background sync
      await backgroundSync.syncFormSubmission('notification-preferences', {
        endpoint: this.subscription.endpoint,
        preferences,
        timestamp: Date.now()
      });

      return false;
    }
  }

  getSubscriptionStatus(): {
    isSupported: boolean;
    permission: NotificationPermission;
    isSubscribed: boolean;
    subscription: PushSubscription | null;
  } {
    return {
      isSupported: this.isSupported,
      permission: this.isSupported ? Notification.permission : 'denied',
      isSubscribed: !!this.subscription,
      subscription: this.subscription
    };
  }

  // Utility methods
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private replacePlaceholders(text: string, data: any): string {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  private async saveSubscription(subscription: NotificationSubscription): Promise<void> {
    await fetch('/api/v1/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    });
  }

  private async removeSubscription(endpoint: string): Promise<void> {
    await fetch('/api/v1/notifications/unsubscribe', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ endpoint })
    });
  }

  private async sendToServer(notification: PushNotificationPayload): Promise<void> {
    await fetch('/api/v1/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notification)
    });
  }

  // Predefined notification methods for common use cases
  async notifyOrderConfirmed(orderId: string, userId?: string): Promise<boolean> {
    return this.sendNotification('order-confirmed', { orderId, userId });
  }

  async notifyOrderShipped(orderId: string, trackingNumber?: string, userId?: string): Promise<boolean> {
    return this.sendNotification('order-shipped', { orderId, trackingNumber, userId });
  }

  async notifyOrderDelivered(orderId: string, userId?: string): Promise<boolean> {
    return this.sendNotification('order-delivered', { orderId, userId });
  }

  async notifyPromotion(title: string, description: string, url?: string): Promise<boolean> {
    return this.sendNotification('promotion', { title, description, url });
  }

  async notifyPriceDrop(productId: string, productName: string, oldPrice: number, newPrice: number): Promise<boolean> {
    return this.sendNotification('price-drop', {
      productId,
      productName,
      oldPrice,
      newPrice,
      savings: oldPrice - newPrice
    });
  }

  async notifyBackInStock(productId: string, productName: string): Promise<boolean> {
    return this.sendNotification('back-in-stock', { productId, productName });
  }

  async notifyCartReminder(cartItems: number, cartValue: number): Promise<boolean> {
    return this.sendNotification('cart-reminder', { cartItems, cartValue });
  }

  async notifyReviewRequest(orderId: string, productName: string): Promise<boolean> {
    return this.sendNotification('review-request', { orderId, productName });
  }

  async sendWelcomeNotification(): Promise<boolean> {
    return this.sendNotification('welcome');
  }
}

// Create singleton instance
export const pushNotifications = new PushNotificationManager();

// React hook for push notifications
export function usePushNotifications() {
  const [isSupported, setIsSupported] = React.useState(false);
  const [permission, setPermission] = React.useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const status = pushNotifications.getSubscriptionStatus();
    setIsSupported(status.isSupported);
    setPermission(status.permission);
    setIsSubscribed(status.isSubscribed);
  }, []);

  const subscribe = React.useCallback(async (userId?: string, preferences?: any) => {
    setIsLoading(true);
    try {
      const subscription = await pushNotifications.subscribe(userId, preferences);
      setIsSubscribed(!!subscription);
      setPermission(Notification.permission);
      return !!subscription;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unsubscribe = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const success = await pushNotifications.unsubscribe();
      if (success) {
        setIsSubscribed(false);
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePreferences = React.useCallback(async (preferences: any) => {
    return pushNotifications.updatePreferences(preferences);
  }, []);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    updatePreferences
  };
}

// Import React for the hook
import React from 'react';