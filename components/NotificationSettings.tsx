'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Settings, Check, X, AlertCircle, Smartphone } from 'lucide-react';
import { usePushNotifications } from '../lib/push-notifications';

interface NotificationPreferences {
  orders: boolean;
  promotions: boolean;
  newProducts: boolean;
  priceDrops: boolean;
  cartReminders: boolean;
  reviews: boolean;
}

export default function NotificationSettings() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    updatePreferences
  } = usePushNotifications();

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    orders: true,
    promotions: true,
    newProducts: false,
    priceDrops: true,
    cartReminders: true,
    reviews: true
  });

  const [showSettings, setShowSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubscribe = async () => {
    try {
      const success = await subscribe(undefined, preferences);
      if (success) {
        setMessage({ type: 'success', text: 'Successfully subscribed to notifications!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to subscribe. Please try again.' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      const success = await unsubscribe();
      if (success) {
        setMessage({ type: 'success', text: 'Successfully unsubscribed from notifications.' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to unsubscribe. Please try again.' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      const success = await updatePreferences(preferences);
      if (success) {
        setMessage({ type: 'success', text: 'Notification preferences updated!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to update preferences. Please try again.' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { color: 'text-green-600', text: 'Enabled', icon: Check };
      case 'denied':
        return { color: 'text-red-600', text: 'Blocked', icon: X };
      default:
        return { color: 'text-yellow-600', text: 'Not Set', icon: AlertCircle };
    }
  };

  const permissionStatus = getPermissionStatus();
  const StatusIcon = permissionStatus.icon;

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Push Notifications Not Supported
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Your browser doesn't support push notifications. Please use a modern browser like Chrome, Firefox, or Safari.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Smartphone className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Push Notifications</h2>
              <p className="text-sm text-gray-600">
                Stay updated with order status, promotions, and more
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <StatusIcon className={`h-5 w-5 ${permissionStatus.color} mr-2`} />
            <span className={`text-sm font-medium ${permissionStatus.color}`}>
              {permissionStatus.text}
            </span>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              {message.text}
            </div>
          </div>
        )}

        {/* Main Controls */}
        <div className="space-y-4">
          {!isSubscribed ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Enable Push Notifications
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Get instant updates about your orders, exclusive deals, and important announcements.
              </p>
              <button
                onClick={handleSubscribe}
                disabled={isLoading || permission === 'denied'}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Enabling...' : 'Enable Notifications'}
              </button>
              {permission === 'denied' && (
                <p className="text-sm text-red-600 mt-3">
                  Notifications are blocked. Please enable them in your browser settings.
                </p>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <Bell className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Notifications Enabled</h3>
                    <p className="text-sm text-gray-600">You'll receive push notifications</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Notification Settings"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleUnsubscribe}
                    disabled={isLoading}
                    className="p-2 text-red-400 hover:text-red-600 transition-colors"
                    title="Disable Notifications"
                  >
                    <BellOff className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Notification Preferences */}
              {showSettings && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Notification Preferences</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium text-gray-700">Order Updates</label>
                        <p className="text-sm text-gray-600">
                          Notifications about order confirmation, shipping, and delivery
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.orders}
                          onChange={(e) => handlePreferenceChange('orders', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium text-gray-700">Promotions & Deals</label>
                        <p className="text-sm text-gray-600">
                          Special offers, sales, and promotional campaigns
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.promotions}
                          onChange={(e) => handlePreferenceChange('promotions', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium text-gray-700">New Products</label>
                        <p className="text-sm text-gray-600">
                          Notifications about new arrivals and product launches
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.newProducts}
                          onChange={(e) => handlePreferenceChange('newProducts', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium text-gray-700">Price Drops</label>
                        <p className="text-sm text-gray-600">
                          Alerts when items in your wishlist go on sale
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.priceDrops}
                          onChange={(e) => handlePreferenceChange('priceDrops', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium text-gray-700">Cart Reminders</label>
                        <p className="text-sm text-gray-600">
                          Reminders about items left in your shopping cart
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.cartReminders}
                          onChange={(e) => handlePreferenceChange('cartReminders', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium text-gray-700">Review Requests</label>
                        <p className="text-sm text-gray-600">
                          Requests to review products after purchase
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.reviews}
                          onChange={(e) => handlePreferenceChange('reviews', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSavePreferences}
                      disabled={isSaving}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSaving ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Browser Support Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">About Push Notifications</p>
              <ul className="space-y-1 text-xs">
                <li>• Notifications work even when the website is closed</li>
                <li>• You can disable them anytime in your browser settings</li>
                <li>• We respect your privacy and won't spam you</li>
                <li>• Some features may not work in private/incognito mode</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}