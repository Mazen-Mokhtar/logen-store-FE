import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
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
          set({
            items: items.map((item) =>
              item.id === existingItem.id &&
              item.size === existingItem.size &&
              item.color === existingItem.color
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({
            items: [...items, { ...newItem, quantity: 1 }],
          });
        }
      },
      removeItem: (id) => {
        set({
          items: get().items.filter((item) => {
            // Handle both simple ID and composite ID (id-size-color)
            if (id.includes('-')) {
              const [itemId, size, color] = id.split('-');
              return !(item.id === itemId && item.size === size && item.color === color);
            }
            return item.id !== id;
          }),
        });
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((item) => {
            // Handle both simple ID and composite ID (id-size-color)
            if (id.includes('-')) {
              const [itemId, size, color] = id.split('-');
              return (item.id === itemId && item.size === size && item.color === color)
                ? { ...item, quantity }
                : item;
            }
            return item.id === id ? { ...item, quantity } : item;
          }),
        });
      },
      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
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
    set({
      notifications: [
        ...get().notifications,
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
    set({
      notifications: get().notifications.filter((n) => n.id !== id),
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