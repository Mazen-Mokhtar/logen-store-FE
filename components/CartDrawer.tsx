'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCartStore } from '@/lib/store';
import { useMessages } from '@/hooks/useMessages';
import { formatPrice } from '@/lib/utils';
import { memo, useMemo, useState } from 'react';
import { 
  useOptimizedCallback, 
  useOptimizedMemo, 
  useConcurrentFeatures, 
  useComponentPerformance,
  memoizationUtils 
} from '@/lib/memoization-optimization';

// Lazy load notification prompt
const NotificationPrompt = dynamic(() => import('@/components/NotificationPrompt'), {
  ssr: false,
  loading: () => null,
});

// Memoized Cart Item component
const CartItem = memo(({ 
  item, 
  updateQuantity, 
  removeItem 
}: { 
  item: any; 
  updateQuantity: (id: string, quantity: number) => void; 
  removeItem: (id: string) => void; 
}) => {
  const itemId = `${item.id}-${item.size}-${item.color}`;
  
  const handleDecrease = useOptimizedCallback(() => {
    updateQuantity(itemId, item.quantity - 1);
  }, [updateQuantity, itemId, item.quantity]);

  const handleIncrease = useOptimizedCallback(() => {
    updateQuantity(itemId, item.quantity + 1);
  }, [updateQuantity, itemId, item.quantity]);

  const handleRemove = useOptimizedCallback(() => {
    removeItem(itemId);
  }, [removeItem, itemId]);

  return (
    <motion.div
      key={itemId}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-center space-x-4 rtl:space-x-reverse bg-gray-50 rounded-lg p-4"
    >
      <div className="relative w-16 h-16 rounded-lg overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">
          {item.title}
        </h3>
        <p className="text-sm text-gray-500">
          {formatPrice(item.price, item.currency)}
        </p>
        {(item.size || item.color) && (
          <p className="text-xs text-gray-400">
            {item.size && `Size: ${item.size}`}
            {item.size && item.color && ' • '}
            {item.color && `Color: ${item.color}`}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <button
          onClick={handleDecrease}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          aria-label="Decrease quantity"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-8 text-center font-medium">
          {item.quantity}
        </span>
        <button
          onClick={handleIncrease}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          aria-label="Increase quantity"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={handleRemove}
        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
        aria-label="Remove item"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id &&
         prevProps.item.quantity === nextProps.item.quantity &&
         prevProps.item.price === nextProps.item.price &&
         prevProps.item.title === nextProps.item.title &&
         prevProps.item.image === nextProps.item.image &&
         prevProps.item.size === nextProps.item.size &&
         prevProps.item.color === nextProps.item.color;
});

CartItem.displayName = 'CartItem';

const CartDrawer = memo(() => {
  // Performance monitoring
  useComponentPerformance('CartDrawer');
  
  // React 18 concurrency features
  const { startTransition, isPending } = useConcurrentFeatures();
  
  const { items, isOpen, closeCart, updateQuantity, removeItem, getTotalPrice, getCartCurrency } = useCartStore();
  const messages = useMessages();
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  // Memoized calculations
  const cartData = useOptimizedMemo(() => ({
    total: getTotalPrice(),
    currency: getCartCurrency(),
    itemCount: items.length,
    isEmpty: items.length === 0
  }), [items, getTotalPrice, getCartCurrency], 'cartData');

  // Optimized callbacks
  const handleCloseCart = useOptimizedCallback(() => {
    startTransition(() => {
      closeCart();
    });
  }, [closeCart, startTransition]);

  const handleUpdateQuantity = useOptimizedCallback((id: string, quantity: number) => {
    startTransition(() => {
      updateQuantity(id, quantity);
    });
  }, [updateQuantity, startTransition]);

  const handleRemoveItem = useOptimizedCallback((id: string) => {
    startTransition(() => {
      removeItem(id);
    });
  }, [removeItem, startTransition]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseCart}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold">{messages.cart.title}</h2>
                <button
                  onClick={handleCloseCart}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {cartData.isEmpty ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">{messages.cart.empty}</p>
                    <button
                      onClick={handleCloseCart}
                      className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                      aria-label="Continue shopping"
                    >
                      {messages.cart.continueShopping}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array.isArray(items) && items.map((item) => (
                      <CartItem
                        key={`${item.id}-${item.size}-${item.color}`}
                        item={item}
                        updateQuantity={handleUpdateQuantity}
                        removeItem={handleRemoveItem}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {!cartData.isEmpty && (
                <div className="border-t p-6 space-y-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>{messages.cart.subtotal}</span>
                    <span>{formatPrice(cartData.total, cartData.currency)}</span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={handleCloseCart}
                    className="block w-full bg-black text-white py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors text-center"
                  >
                    {messages.cart.checkout}
                  </Link>
                  <button
                    onClick={() => setShowNotificationPrompt(true)}
                    className="block w-full mt-2 bg-gray-100 text-gray-700 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors text-center text-sm"
                  >
                    Get notified about cart reminders
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Notification Prompt */}
          <NotificationPrompt
            trigger="cart"
            isVisible={showNotificationPrompt}
            onClose={() => setShowNotificationPrompt(false)}
          />
        </>
      )}
    </AnimatePresence>
  );
});

CartDrawer.displayName = 'CartDrawer';

export default CartDrawer;