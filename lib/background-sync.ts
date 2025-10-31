/**
 * Background Sync Utilities
 * Handles offline data synchronization with the service worker
 */

interface SyncData {
  id?: number;
  timestamp: number;
  data: any;
  type: string;
  retryCount?: number;
}

interface CartSyncData extends SyncData {
  type: 'cart-update' | 'cart-remove' | 'cart-clear';
  data: {
    productId?: string;
    quantity?: number;
    action: string;
    userId?: string;
  };
}

interface AnalyticsSyncData extends SyncData {
  type: 'page-view' | 'product-view' | 'add-to-cart' | 'purchase' | 'search';
  data: {
    event: string;
    properties: Record<string, any>;
    userId?: string;
    sessionId: string;
  };
}

interface FormSyncData extends SyncData {
  type: 'contact-form' | 'newsletter' | 'review' | 'support';
  data: {
    formType: string;
    fields: Record<string, any>;
    userId?: string;
  };
}

class BackgroundSyncManager {
  private dbName = 'logen-sync-db';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    // Only initialize DB in browser environment
    if (typeof window !== 'undefined' && typeof indexedDB !== 'undefined') {
      this.initDB();
    }
  }

  private async initDB(): Promise<void> {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      console.warn('IndexedDB not available in this environment');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores for different sync types
        if (!db.objectStoreNames.contains('cart-updates')) {
          db.createObjectStore('cart-updates', { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains('analytics-events')) {
          db.createObjectStore('analytics-events', { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains('form-submissions')) {
          db.createObjectStore('form-submissions', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  private async storeData(storeName: string, data: SyncData): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async registerSync(tag: string): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register(tag);
      } catch (error) {
        console.error('Background sync registration failed:', error);
        // Fallback: try to sync immediately
        this.attemptImmediateSync(tag);
      }
    } else {
      // Fallback for browsers without background sync
      this.attemptImmediateSync(tag);
    }
  }

  private async attemptImmediateSync(tag: string): Promise<void> {
    // Attempt immediate sync when background sync is not available
    try {
      if (navigator.onLine) {
        const event = new CustomEvent('sync', { detail: { tag } });
        self.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Immediate sync failed:', error);
    }
  }

  // Cart synchronization methods
  async syncCartUpdate(productId: string, quantity: number, userId?: string): Promise<void> {
    const syncData: CartSyncData = {
      timestamp: Date.now(),
      type: 'cart-update',
      data: {
        productId,
        quantity,
        action: 'update',
        userId
      }
    };

    try {
      if (navigator.onLine) {
        // Try immediate sync if online
        await fetch('/api/v1/cart/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(syncData)
        });
      } else {
        // Store for background sync if offline
        await this.storeData('cart-updates', syncData);
        await this.registerSync('cart-sync');
      }
    } catch (error) {
      // Store for background sync on network error
      await this.storeData('cart-updates', syncData);
      await this.registerSync('cart-sync');
    }
  }

  async syncCartRemove(productId: string, userId?: string): Promise<void> {
    const syncData: CartSyncData = {
      timestamp: Date.now(),
      type: 'cart-remove',
      data: {
        productId,
        action: 'remove',
        userId
      }
    };

    try {
      if (navigator.onLine) {
        await fetch('/api/v1/cart/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(syncData)
        });
      } else {
        await this.storeData('cart-updates', syncData);
        await this.registerSync('cart-sync');
      }
    } catch (error) {
      await this.storeData('cart-updates', syncData);
      await this.registerSync('cart-sync');
    }
  }

  // Analytics synchronization methods
  async syncAnalyticsEvent(event: string, properties: Record<string, any>, userId?: string): Promise<void> {
    const syncData: AnalyticsSyncData = {
      timestamp: Date.now(),
      type: event as any,
      data: {
        event,
        properties,
        userId,
        sessionId: this.getSessionId()
      }
    };

    try {
      if (navigator.onLine) {
        await fetch('/api/v1/analytics/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(syncData)
        });
      } else {
        await this.storeData('analytics-events', syncData);
        await this.registerSync('analytics-sync');
      }
    } catch (error) {
      await this.storeData('analytics-events', syncData);
      await this.registerSync('analytics-sync');
    }
  }

  // Form synchronization methods
  async syncFormSubmission(formType: string, fields: Record<string, any>, userId?: string): Promise<void> {
    const syncData: FormSyncData = {
      timestamp: Date.now(),
      type: formType as any,
      data: {
        formType,
        fields,
        userId
      }
    };

    try {
      if (navigator.onLine) {
        await fetch('/api/v1/forms/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(syncData)
        });
      } else {
        await this.storeData('form-submissions', syncData);
        await this.registerSync('form-sync');
      }
    } catch (error) {
      await this.storeData('form-submissions', syncData);
      await this.registerSync('form-sync');
    }
  }

  // Utility methods
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('logen-session-id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('logen-session-id', sessionId);
    }
    return sessionId;
  }

  // Get pending sync data for debugging
  async getPendingSyncData(): Promise<{
    cartUpdates: CartSyncData[];
    analyticsEvents: AnalyticsSyncData[];
    formSubmissions: FormSyncData[];
  }> {
    if (!this.db) await this.initDB();

    const getData = (storeName: string): Promise<any[]> => {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    };

    const [cartUpdates, analyticsEvents, formSubmissions] = await Promise.all([
      getData('cart-updates'),
      getData('analytics-events'),
      getData('form-submissions')
    ]);

    return {
      cartUpdates,
      analyticsEvents,
      formSubmissions
    };
  }

  // Clear all pending sync data
  async clearAllPendingData(): Promise<void> {
    if (!this.db) await this.initDB();

    const clearStore = (storeName: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    };

    await Promise.all([
      clearStore('cart-updates'),
      clearStore('analytics-events'),
      clearStore('form-submissions')
    ]);
  }
}

// Create singleton instance
export const backgroundSync = new BackgroundSyncManager();

// Export types for use in other files
export type {
  SyncData,
  CartSyncData,
  AnalyticsSyncData,
  FormSyncData
};