'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Gift, ShoppingCart, Truck, Star } from 'lucide-react';
import { usePushNotifications } from '../lib/push-notifications';

interface NotificationPromptProps {
  trigger?: 'cart' | 'checkout' | 'order-complete' | 'product-view' | 'manual';
  onClose?: () => void;
  className?: string;
}

export default function NotificationPrompt({ 
  trigger = 'manual', 
  onClose,
  className = ''
}: NotificationPromptProps) {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe
  } = usePushNotifications();

  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if we should show the prompt
    const shouldShow = () => {
      if (!isSupported || isSubscribed || permission === 'denied' || isDismissed) {
        return false;
      }

      // Check if user has already dismissed this type of prompt
      const dismissedKey = `notification-prompt-dismissed-${trigger}`;
      const dismissed = localStorage.getItem(dismissedKey);
      if (dismissed) {
        return false;
      }

      // Show based on trigger conditions
      switch (trigger) {
        case 'cart':
          // Show when user adds items to cart
          return true;
        case 'checkout':
          // Show during checkout process
          return true;
        case 'order-complete':
          // Show after successful order
          return true;
        case 'product-view':
          // Show after viewing multiple products
          const viewCount = parseInt(localStorage.getItem('product-view-count') || '0');
          return viewCount >= 3;
        case 'manual':
          // Show when manually triggered
          return true;
        default:
          return false;
      }
    };

    if (shouldShow()) {
      // Delay showing the prompt slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isSupported, isSubscribed, permission, trigger, isDismissed]);

  const handleSubscribe = async () => {
    try {
      const success = await subscribe();
      if (success) {
        handleClose();
      }
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setIsDismissed(true);
    
    // Remember that user dismissed this prompt
    const dismissedKey = `notification-prompt-dismissed-${trigger}`;
    localStorage.setItem(dismissedKey, 'true');
    
    onClose?.();
  };

  const getPromptContent = () => {
    switch (trigger) {
      case 'cart':
        return {
          icon: ShoppingCart,
          title: 'Never Miss Your Cart!',
          description: 'Get notified if you leave items in your cart and when they go on sale.',
          benefits: ['Cart abandonment reminders', 'Price drop alerts', 'Stock notifications']
        };
      case 'checkout':
        return {
          icon: Truck,
          title: 'Track Your Order',
          description: 'Stay updated with real-time notifications about your order status.',
          benefits: ['Order confirmations', 'Shipping updates', 'Delivery notifications']
        };
      case 'order-complete':
        return {
          icon: Star,
          title: 'Stay in the Loop!',
          description: 'Get notified about your order updates and exclusive offers.',
          benefits: ['Order tracking', 'Exclusive deals', 'New product alerts']
        };
      case 'product-view':
        return {
          icon: Gift,
          title: 'Don\'t Miss Great Deals!',
          description: 'Get instant notifications about sales, new arrivals, and price drops.',
          benefits: ['Flash sales alerts', 'New product launches', 'Personalized offers']
        };
      default:
        return {
          icon: Bell,
          title: 'Enable Notifications',
          description: 'Stay updated with order status, promotions, and more.',
          benefits: ['Order updates', 'Exclusive offers', 'Important alerts']
        };
    }
  };

  if (!isVisible || !isSupported || isSubscribed || permission === 'denied') {
    return null;
  }

  const content = getPromptContent();
  const IconComponent = content.icon;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}>
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        <div className="relative p-6">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <IconComponent className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {content.title}
            </h3>
            <p className="text-gray-600 mb-4">
              {content.description}
            </p>

            {/* Benefits */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">You'll get notified about:</h4>
              <ul className="space-y-2">
                {content.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enabling...
                </div>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Enable Notifications
                </>
              )}
            </button>
            
            <button
              onClick={handleClose}
              className="w-full text-gray-600 py-2 px-4 rounded-lg font-medium hover:text-gray-800 transition-colors"
            >
              Maybe Later
            </button>
          </div>

          {/* Privacy Note */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              We respect your privacy. You can disable notifications anytime in your browser settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to trigger notification prompts at strategic moments
export function useNotificationPrompt() {
  const [activePrompt, setActivePrompt] = useState<string | null>(null);

  const showPrompt = (trigger: NotificationPromptProps['trigger']) => {
    setActivePrompt(trigger || 'manual');
  };

  const hidePrompt = () => {
    setActivePrompt(null);
  };

  // Auto-trigger prompts based on user behavior
  useEffect(() => {
    const handleCartUpdate = () => {
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
      if (cartItems.length > 0) {
        setTimeout(() => showPrompt('cart'), 2000);
      }
    };

    const handleProductView = () => {
      const currentCount = parseInt(localStorage.getItem('product-view-count') || '0');
      const newCount = currentCount + 1;
      localStorage.setItem('product-view-count', newCount.toString());
      
      if (newCount === 3) {
        setTimeout(() => showPrompt('product-view'), 1500);
      }
    };

    // Listen for custom events
    window.addEventListener('cart-updated', handleCartUpdate);
    window.addEventListener('product-viewed', handleProductView);

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
      window.removeEventListener('product-viewed', handleProductView);
    };
  }, []);

  return {
    activePrompt,
    showPrompt,
    hidePrompt
  };
}