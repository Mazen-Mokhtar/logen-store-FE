import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { backgroundSync } from './background-sync';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  currency?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getCartCurrency: () => string;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (newItem) => {
        const items = get().items;
        const existingItem = items.find(
          (item) => 
            item.id === newItem.id && 
            item.size === newItem.size && 
            item.color === newItem.color
        );

        if (existingItem) {
          const updatedQuantity = existingItem.quantity + (newItem.quantity || 1);
          set({
            items: items.map((item) =>
              item.id === existingItem.id &&
              item.size === existingItem.size &&
              item.color === existingItem.color
                ? { ...item, quantity: updatedQuantity }
                : item
            ),
          });
          
          // Background sync for cart update
          backgroundSync.syncCartUpdate(
            existingItem.id, 
            updatedQuantity,
            // TODO: Add user ID when authentication is implemented
            undefined
          );
        } else {
          const quantity = newItem.quantity || 1;
          set({
            items: [...items, { ...newItem, quantity }],
          });
          
          // Background sync for new cart item
          backgroundSync.syncCartUpdate(
            newItem.id, 
            quantity,
            // TODO: Add user ID when authentication is implemented
            undefined
          );
        }
      },
      removeItem: (id) => {
        let removedProductId: string | undefined;
        
        set({
          items: get().items.filter((item) => {
            // Handle both simple ID and composite ID (id-size-color)
            if (id.includes('-')) {
              const [itemId, size, color] = id.split('-');
              const shouldRemove = item.id === itemId && item.size === size && item.color === color;
              if (shouldRemove) {
                removedProductId = itemId;
              }
              return !shouldRemove;
            }
            const shouldRemove = item.id === id;
            if (shouldRemove) {
              removedProductId = id;
            }
            return !shouldRemove;
          }),
        });
        
        // Background sync for cart removal
        if (removedProductId) {
          backgroundSync.syncCartRemove(
            removedProductId,
            // TODO: Add user ID when authentication is implemented
            undefined
          );
        }
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        
        let updatedProductId: string | undefined;
        
        set({
          items: get().items.map((item) => {
            // Handle both simple ID and composite ID (id-size-color)
            if (id.includes('-')) {
              const [itemId, size, color] = id.split('-');
              const shouldUpdate = item.id === itemId && item.size === size && item.color === color;
              if (shouldUpdate) {
                updatedProductId = itemId;
              }
              return shouldUpdate ? { ...item, quantity } : item;
            }
            const shouldUpdate = item.id === id;
            if (shouldUpdate) {
              updatedProductId = id;
            }
            return shouldUpdate ? { ...item, quantity } : item;
          }),
        });
        
        // Background sync for quantity update
        if (updatedProductId) {
          backgroundSync.syncCartUpdate(
            updatedProductId, 
            quantity,
            // TODO: Add user ID when authentication is implemented
            undefined
          );
        }
      },
      clearCart: () => {
        set({ items: [] });
        
        // Background sync for cart clear
        // Note: This could be implemented as a special sync event
        backgroundSync.syncAnalyticsEvent('cart-clear', {
          timestamp: Date.now(),
          itemCount: get().items.length
        });
      },
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      getTotalItems: () => {
        const items = get().items;
        return Array.isArray(items) ? items.reduce((total, item) => total + item.quantity, 0) : 0;
      },
      getTotalPrice: () => {
        const items = get().items;
        if (!Array.isArray(items) || items.length === 0) return 0;
        
        // Group items by currency
        const currencyGroups = items.reduce((groups: { [key: string]: number }, item) => {
          const currency = item.currency || 'SAR';
          groups[currency] = (groups[currency] || 0) + (item.price * item.quantity);
          return groups;
        }, {});
        
        // If all items have the same currency, return the total
        const currencies = Object.keys(currencyGroups);
        if (currencies.length === 1) {
          return currencyGroups[currencies[0]];
        }
        
        // If mixed currencies, convert all to SAR (base currency)
        // This is a simplified conversion - in a real app, you'd use actual exchange rates
        const exchangeRates: { [key: string]: number } = {
          'SAR': 1,
          'USD': 3.75, // 1 USD = 3.75 SAR
          'EUR': 4.1,  // 1 EUR = 4.1 SAR
          'EGP': 0.12  // 1 EGP = 0.12 SAR
        };
        
        return Object.entries(currencyGroups).reduce((total, [currency, amount]) => {
           const rate = exchangeRates[currency] || 1;
           return total + (amount * rate);
         }, 0);
       },
       getCartCurrency: () => {
         const items = get().items;
         if (!Array.isArray(items) || items.length === 0) return 'SAR';
         
         // Get unique currencies in cart
         const currencies = [...new Set(items.map(item => item.currency || 'SAR'))];
         
         // If all items have the same currency, return that currency
         if (currencies.length === 1) {
           return currencies[0];
         }
         
         // If mixed currencies, return 'SAR' as the base currency for display
         return 'SAR';
       },
    }),
    {
      name: 'cart-storage',
    }
  )
);

interface NotificationStore {
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
  }>;
  addNotification: (notification: Omit<NotificationStore['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  addNotification: (notification) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const currentNotifications = get().notifications;
    set({
      notifications: [
        ...(Array.isArray(currentNotifications) ? currentNotifications : []),
        {
          ...notification,
          id,
          timestamp: new Date(),
        },
      ],
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
      get().removeNotification(id);
    }, 5000);
  },
  removeNotification: (id) => {
    const currentNotifications = get().notifications;
    set({
      notifications: Array.isArray(currentNotifications) ? currentNotifications.filter((n) => n.id !== id) : [],
    });
  },
  clearNotifications: () => set({ notifications: [] }),
}));
interface LanguageStore {
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'language-storage',
    }
  )
);