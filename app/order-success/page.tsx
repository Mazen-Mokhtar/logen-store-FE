'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { apiClient, handleApiError } from '@/lib/api';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const [orderStatus, setOrderStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderStatus = async () => {
      if (!orderId) {
        setError('Order ID not found');
        setLoading(false);
        return;
      }

      try {
        const status = await apiClient.getOrderStatus(orderId);
        setOrderStatus(status);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStatus();
  }, [orderId]);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !orderStatus) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'Unable to find order details'}</p>
          <Link
            href="/"
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>

          {/* Success Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Order Placed Successfully!
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>

          {/* Order Details */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Order Number</h3>
                <p className="text-gray-600">#{orderStatus.orderId.slice(-8)}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Total Amount</h3>
                <p className="text-gray-600">{orderStatus.totalAmount} {orderStatus.currency}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Payment Method</h3>
                <p className="text-gray-600">{orderStatus.paymentGateway?.toUpperCase() || 'COD'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                <p className="text-gray-600">
                  {orderStatus.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/orders/${orderStatus.orderId}`}
              className="inline-flex items-center justify-center space-x-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Package className="w-5 h-5" />
              <span>View Order Details</span>
            </Link>
            
            <Link
              href="/collections"
              className="inline-flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-12 p-6 bg-blue-50 rounded-2xl">
            <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
            <div className="text-blue-800 space-y-2">
              <p>• You'll receive an order confirmation email</p>
              <p>• We'll notify you when your order ships</p>
              <p>• Track your order status in the "My Orders" section</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}