'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useOrders } from '@/hooks/useOrders';
import { formatPrice } from '@/lib/utils';

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
  pending: 'text-yellow-600 bg-yellow-50',
  pending_cod: 'text-blue-600 bg-blue-50',
  placed: 'text-blue-600 bg-blue-50',
  on_way: 'text-purple-600 bg-purple-50',
  delivered: 'text-green-600 bg-green-50',
  rejected: 'text-red-600 bg-red-50',
  paid: 'text-green-600 bg-green-50',
  failed: 'text-red-600 bg-red-50',
};

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { isAuthenticated, isLoading, user } = useAuth();
  const { orders, loading, error, pagination, fetchMore, hasMore } = useOrders({
    status: statusFilter || undefined,
    limit: 10,
  });

  if (isLoading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your orders</p>
          <Link
            href="/"
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go to Homepage
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-2">Track and manage your orders</p>
            </div>
            
            {user && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Welcome back,</p>
                <p className="font-medium text-gray-900">{user.userName}</p>
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                statusFilter === ''
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Orders
            </button>
            {Object.keys(statusColors).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>

          {/* Orders List */}
          {loading && orders.length === 0 ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Orders</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h2>
              <p className="text-gray-600 mb-6">You haven't placed any orders yet</p>
              <Link
                href="/collections"
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {orders.map((order) => {
                  const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || Clock;
                  const statusColorClass = statusColors[order.status as keyof typeof statusColors] || 'text-gray-600 bg-gray-50';

                  return (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Order #{order._id.slice(-8)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${statusColorClass}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      </div>

                      {/* Order Items */}
                      {order.items && order.items.length > 0 ? (
                        <div className="space-y-3 mb-4">
                          {order.items.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center space-x-4">
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                                <Image
                                  src={item.image || '/placeholder-image.jpg'}
                                  alt={item.title}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{item.title}</p>
                                <p className="text-sm text-gray-500">
                                  Qty: {item.quantity} • {formatPrice(item.price)}
                                </p>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <p className="text-sm text-gray-500">
                              +{order.items.length - 3} more items
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="mb-4">
                          <p className="font-medium text-gray-900">{order.productName}</p>
                          <p className="text-sm text-gray-500">Single item order</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {formatPrice(order.totalAmount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.currency} • {order.paymentMethod.toUpperCase()}
                          </p>
                        </div>
                        <Link
                          href={`/orders/${order._id}`}
                          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={fetchMore}
                    disabled={loading}
                    className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Load More Orders'}
                  </button>
                </div>
              )}

              {/* Pagination Info */}
              {pagination && (
                <div className="text-center mt-6 text-sm text-gray-500">
                  Showing {orders.length} of {pagination.totalItems} orders
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}