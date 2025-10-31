# Push Notifications Testing Guide

## Overview
This guide provides step-by-step instructions for testing the push notification system that has been integrated into the e-commerce application.

## Features Implemented

### 1. Push Notification Manager (`lib/push-notifications.ts`)
- Service worker registration
- Permission handling
- Subscription management
- Notification templates for different scenarios
- React hook for easy integration

### 2. Notification Settings (`components/NotificationSettings.tsx`)
- User preference management
- Subscribe/unsubscribe functionality
- Granular notification controls
- Browser compatibility checks

### 3. Notification Prompts (`components/NotificationPrompt.tsx`)
- Strategic prompts at key user interactions
- Different triggers: cart, checkout, order-complete, product-view
- Customizable content based on context

### 4. API Endpoints
- `/api/notifications/subscribe` - Manage subscriptions
- `/api/notifications/send` - Send notifications

### 5. Service Worker (`public/sw.js`)
- Push event handling
- Notification click handling
- Offline support with caching

## Testing Instructions

### 1. Environment Setup
1. Ensure the development server is running: `npm run dev`
2. Open http://localhost:3001 in your browser
3. Open browser DevTools (F12)

### 2. Test Notification Permissions
1. Navigate to Settings page: http://localhost:3001/settings
2. Scroll to "Notification Preferences" section
3. Click "Enable Notifications" button
4. Browser should prompt for notification permissions
5. Grant permissions when prompted

### 3. Test Cart Notifications
1. Browse products and add items to cart
2. After adding to cart, a notification prompt should appear
3. Click "Enable Notifications" in the prompt
4. Open cart drawer - should see "Get notified about cart reminders" button
5. Click the button to trigger notification prompt

### 4. Test Checkout Notifications
1. Proceed to checkout with items in cart
2. Fill out checkout form
3. Complete order placement
4. Notification prompt should appear after successful order
5. Check browser notifications for order confirmation

### 5. Test Order Success Notifications
1. After completing an order, you'll be redirected to order success page
2. A notification prompt should appear after 1.5 seconds
3. Enable notifications to receive order updates

### 6. Test API Endpoints
Use browser DevTools Network tab or tools like Postman:

#### Subscribe to notifications:
```bash
POST /api/notifications/subscribe
Content-Type: application/json

{
  "subscription": {
    "endpoint": "...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  },
  "preferences": {
    "orders": true,
    "promotions": true,
    "newProducts": false,
    "priceDrops": true,
    "cartReminders": true,
    "reviews": false
  }
}
```

#### Send notification:
```bash
POST /api/notifications/send
Content-Type: application/json

{
  "type": "order",
  "data": {
    "orderId": "12345",
    "status": "confirmed"
  }
}
```

### 7. Test Service Worker
1. Open DevTools > Application > Service Workers
2. Verify service worker is registered and active
3. Test push events in DevTools > Application > Push Messaging

## Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Limited support (iOS 16.4+)

## Troubleshooting

### Common Issues:
1. **Notifications not appearing**: Check browser permissions
2. **Service worker not registering**: Check console for errors
3. **API errors**: Verify VAPID keys in .env.local
4. **Subscription failures**: Check network connectivity

### Debug Steps:
1. Check browser console for errors
2. Verify service worker registration in DevTools
3. Check Network tab for API call failures
4. Verify VAPID keys are properly configured

## Environment Variables Required
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_CONTACT_EMAIL=your_email@domain.com
NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
```

## Production Deployment Notes
1. Ensure HTTPS is enabled (required for push notifications)
2. Configure proper VAPID keys for production
3. Set up proper error monitoring
4. Consider rate limiting for notification APIs
5. Implement proper user consent management

## Performance Considerations
- Service worker is cached for offline functionality
- Notification prompts are lazy-loaded to reduce initial bundle size
- API endpoints include proper error handling and validation
- Subscription data is stored efficiently

## Security Features
- VAPID keys for secure communication
- User consent required before subscribing
- Proper validation of subscription data
- Rate limiting on notification sending