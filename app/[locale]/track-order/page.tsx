'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck, CreditCard, Search, AlertCircle, Mail, Phone } from 'lucide-react';
import { apiClient, handleApiError, Order } from '@/lib/api';
import { formatPrice, decodeHtmlEntities } from '@/lib/utils';
import { useLocale } from '@/hooks/useLocale';

const statusIcons = {
  pending: Clock,
  pending_cod: Clock,
  placed: Package,
  on_way: Truck,
  delivered: CheckCircle,
  rejected: XCircle,
  paid: CheckCircle,
  failed: XCircle,
};

const statusColors = {
  pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  pending_cod: 'text-blue-600 bg-blue-50 border-blue-200',
  placed: 'text-blue-600 bg-blue-50 border-blue-200',
  on_way: 'text-purple-600 bg-purple-50 border-purple-200',
  delivered: 'text-green-600 bg-green-50 border-green-200',
  rejected: 'text-red-600 bg-red-50 border-red-200',
  paid: 'text-green-600 bg-green-50 border-green-200',
  failed: 'text-red-600 bg-red-50 border-red-200',
};

interface FormData {
  orderId: string;
  email: string;
  phone: string;
}

interface FormErrors {
  orderId?: string;
  contact?: string;
  email?: string;
  phone?: string;
}

export default function TrackOrderPage() {
  const { t, formatCurrency, getLocalizedPath } = useLocale();
  const [formData, setFormData] = useState<FormData>({
    orderId: '',
    email: '',
    phone: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Special handling for Order ID - limit to 8 alphanumeric characters
    if (name === 'orderId') {
      // Remove any non-alphanumeric characters and limit to 8 characters
      const cleanValue = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
      setFormData(prev => ({
        ...prev,
        [name]: cleanValue // Keep original case (both uppercase and lowercase)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear errors when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    // Order ID validation - must be exactly 8 alphanumeric characters
    if (!formData.orderId.trim()) {
      errors.orderId = 'Order ID is required';
    } else if (formData.orderId.length !== 8) {
      errors.orderId = 'Order ID must be exactly 8 characters';
    } else if (!/^[a-zA-Z0-9]{8}$/.test(formData.orderId)) {
      errors.orderId = 'Order ID must contain only letters and numbers';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setOrder(null);
    
    try {
      const trackingParams: { orderId: string; email?: string; phone?: string } = {
        orderId: formData.orderId.trim(),
      };
      
      if (formData.email.trim()) {
        trackingParams.email = formData.email.trim();
      }
      
      if (formData.phone.trim()) {
        trackingParams.phone = formData.phone.trim();
      }
      
      const result = await apiClient.trackOrder(trackingParams);
      setOrder(result);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    const Icon = statusIcons[status as keyof typeof statusIcons] || Package;
    const colorClass = statusColors[status as keyof typeof statusColors] || 'text-gray-600 bg-gray-50 border-gray-200';
    
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colorClass}`}>
        <Icon className="w-4 h-4 mr-2" />
        {status.replace('_', ' ').toUpperCase()}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={getLocalizedPath('/')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
          <p className="text-gray-600 mt-2">
            Enter your order details to track your shipment status
          </p>
        </div>

        {/* Tracking Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border p-6 mb-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order ID Field */}
            <div>
              <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-2">
                Order ID *
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="orderId"
                  name="orderId"
                  value={formData.orderId}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.orderId ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your order ID"
                />
              </div>
              {formErrors.orderId && (
                <p className="mt-1 text-sm text-red-600">{formErrors.orderId}</p>
              )}
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="your@email.com"
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                {formErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                )}
              </div>
            </div>

            {/* Contact Validation Error */}
            {formErrors.contact && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm">{formErrors.contact}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Tracking Order...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Track Order</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 font-medium">Order Not Found</p>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </motion.div>
        )}

        {/* Order Details Display */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border overflow-hidden"
          >
            {/* Order Header */}
            <div className="bg-gray-50 px-6 py-4 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Order #{order._id}</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-3 sm:mt-0">
                  {getStatusDisplay(order.status)}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
              {order.items && order.items.length > 0 ? (
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <Image
                          src={decodeHtmlEntities(item.image)}
                          alt={item.title}
                          width={64}
                          height={64}
                          className="rounded-lg object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{item.title}</h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span>Qty: {item.quantity}</span>
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.price * item.quantity, order.currency)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No item details available</p>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="px-6 py-4 bg-gray-50 border-t">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(order.totalAmount, order.currency)}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            {order.shippingInfo && (
              <div className="px-6 py-4 border-t">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">
                      {order.shippingInfo.firstName} {order.shippingInfo.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{order.shippingInfo.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{order.shippingInfo.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Address</p>
                    <p className="font-medium text-gray-900">
                      {order.shippingInfo.address}, {order.shippingInfo.city}
                      {order.shippingInfo.postalCode && `, ${order.shippingInfo.postalCode}`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}