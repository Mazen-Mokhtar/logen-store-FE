'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Truck, Shield } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useMessages } from '@/hooks/useMessages';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { apiClient, generateIdempotencyKey, handleApiError } from '@/lib/api';
import { useCoupons } from '@/hooks/useCoupons';

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuth();
  const messages = useMessages();
  const { validateCoupon, validatingCoupon } = useCoupons();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const subtotal = getTotalPrice();
  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const shipping = 50; // Fixed shipping cost
  const tax = Math.round((subtotal - couponDiscount) * 0.15); // 15% tax on discounted amount
  const total = subtotal - couponDiscount + shipping + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      const result = await validateCoupon(couponCode, subtotal);
      if (result.isValid) {
        setAppliedCoupon(result);
        setError(null);
      } else {
        setError(result.error || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (err) {
      setError(handleApiError(err));
      setAppliedCoupon(null);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const checkoutData = {
        items: items.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          size: item.size,
          color: item.color,
        })),
        subtotal,
        shipping,
        tax,
        total,
        paymentMethod: 'stripe' as const,
        couponCode: appliedCoupon?.coupon?.code,
        note: 'Order from StyleHub',
      };

      let result;
      if (isAuthenticated) {
        result = await apiClient.processAuthenticatedCheckout({
          ...checkoutData,
          currency: 'EGP' as const,
          idempotencyKey: generateIdempotencyKey(),
        });
      } else {
        result = await apiClient.processCheckout({
          ...checkoutData,
          guestInfo: formData,
          currency: 'EGP' as const,
          idempotencyKey: generateIdempotencyKey(),
        });
      }

      if (result.success) {
        clearCart();
        setSuccess('Order placed successfully!');
        
        // Redirect to order status or payment if needed
        if (result.clientSecret) {
          // Handle Stripe payment
          window.location.href = `/payment?order=${result.orderId}&client_secret=${result.clientSecret}`;
        } else {
          // COD order - redirect to success page
          window.location.href = `/order-success?order=${result.orderId}`;
        }
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 rtl:space-x-reverse text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            href="/"
            className="inline-flex items-center space-x-2 rtl:space-x-reverse text-gray-600 hover:text-gray-900 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shopping</span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        </motion.div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {isAuthenticated ? 'Order Details' : 'Shipping Information'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isAuthenticated && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="+966 50 123 4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="123 King Fahd Road"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Riyadh"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="12345"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Coupon Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">Coupon Code</h3>
                {!appliedCoupon ? (
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon || !couponCode.trim()}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {validatingCoupon ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">{appliedCoupon.coupon.name}</p>
                      <p className="text-sm text-green-600">
                        Discount: {formatPrice(appliedCoupon.discountAmount)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {isAuthenticated && user && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-3">Delivery Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">{user.userName}</p>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Delivery address will be collected after order confirmation
                    </p>
                  </div>
                </div>
              )}

              {/* Trust Indicators */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-center space-x-8 rtl:space-x-reverse text-sm text-gray-600">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Shield className="w-4 h-4" />
                    <span>Secure Checkout</span>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Truck className="w-4 h-4" />
                    <span>Free Returns</span>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <CreditCard className="w-4 h-4" />
                    <span>Secure Payment</span>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm h-fit"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                      {(item.size || item.color) && (
                        <span className="ml-2">
                          {item.size && `Size: ${item.size}`}
                          {item.size && item.color && ' • '}
                          {item.color && `Color: ${item.color}`}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="border-t pt-6 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount ({appliedCoupon.coupon.code})</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="w-full mt-6 bg-black text-white py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}