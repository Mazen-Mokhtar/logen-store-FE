const CACHE_NAME = 'logen-v1';
const urlsToCache = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // If both cache and network fail, show offline page for navigation requests
        if (event.request.destination === 'document') {
          return caches.match('/offline');
        }
      })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  let notificationData = {
    title: 'New Notification',
    body: 'You have a new message',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'default',
    data: {
      url: '/'
    }
  };

  if (event.data) {
    try {
      notificationData = { ...notificationData, ...event.data.json() };
    } catch (error) {
      console.error('Error parsing push data:', error);
      notificationData.body = event.data.text();
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    image: notificationData.image,
    tag: notificationData.tag,
    data: notificationData.data,
    actions: notificationData.actions || [],
    requireInteraction: notificationData.requireInteraction || false,
    silent: notificationData.silent || false,
    vibrate: notificationData.vibrate || [200, 100, 200],
    timestamp: Date.now()
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click event - handle user interactions
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};
  let url = data.url || '/';

  // Handle different actions
  switch (action) {
    case 'track':
      url = `/orders/${data.orderId}`;
      break;
    case 'shop':
      url = '/products';
      break;
    case 'checkout':
      url = '/checkout';
      break;
    case 'view-cart':
      url = '/cart';
      break;
    case 'buy':
    case 'view-product':
      url = `/products/${data.productId || ''}`;
      break;
    case 'review':
      url = `/products/${data.productId}/review`;
      break;
    case 'save':
      // Handle save for later action
      handleSaveForLater(data);
      return;
    case 'later':
      // Handle remind later action
      handleRemindLater(data);
      return;
    default:
      // Use the URL from notification data
      break;
  }

  // Open the URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no existing window, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );

  // Track notification interaction
  trackNotificationInteraction(event.notification.tag, action || 'click', data);
});

// Notification close event - track dismissals
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  const data = event.notification.data || {};
  trackNotificationInteraction(event.notification.tag, 'close', data);
});

// Background sync event - handle offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

// Helper function to handle save for later action
function handleSaveForLater(data) {
  // In a real app, you would save this to IndexedDB or send to server when online
  console.log('Saving for later:', data);
  
  // Show a confirmation notification
  self.registration.showNotification('Saved! 💾', {
    body: 'Item saved to your wishlist',
    icon: '/icons/icon-192x192.png',
    tag: 'save-confirmation',
    data: { url: '/wishlist' }
  });
}

// Helper function to handle remind later action
function handleRemindLater(data) {
  // Schedule a reminder notification (in a real app, this would be handled server-side)
  console.log('Setting reminder:', data);
  
  // Show a confirmation notification
  self.registration.showNotification('Reminder Set! ⏰', {
    body: 'We\'ll remind you again tomorrow',
    icon: '/icons/icon-192x192.png',
    tag: 'reminder-confirmation'
  });
}

// Helper function to track notification interactions
function trackNotificationInteraction(tag, action, data) {
  // Send analytics data when online
  if ('navigator' in self && 'onLine' in navigator && navigator.onLine) {
    fetch('/api/v1/analytics/notification-interaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tag,
        action,
        data,
        timestamp: Date.now()
      })
    }).catch(error => {
      console.error('Failed to track notification interaction:', error);
    });
  }
}

// Helper function to handle background sync
async function handleBackgroundSync() {
  try {
    // Get pending sync data from IndexedDB
    const db = await openIndexedDB();
    const pendingActions = await getPendingActions(db);
    
    for (const action of pendingActions) {
      try {
        await processAction(action);
        await removePendingAction(db, action.id);
      } catch (error) {
        console.error('Failed to process action:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// IndexedDB helpers
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('LogenDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingActions')) {
        db.createObjectStore('pendingActions', { keyPath: 'id' });
      }
    };
  });
}

function getPendingActions(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingActions'], 'readonly');
    const store = transaction.objectStore('pendingActions');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removePendingAction(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingActions'], 'readwrite');
    const store = transaction.objectStore('pendingActions');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function processAction(action) {
  switch (action.type) {
    case 'analytics':
      await fetch('/api/v1/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.data)
      });
      break;
    
    case 'form-submission':
      await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.data)
      });
      break;
    
    case 'review':
      await fetch('/api/v1/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.data)
      });
      break;
    
    default:
      console.warn('Unknown action type:', action.type);
  }
}

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PERFORMANCE_MEASURE') {
    // Handle performance measurements from the main thread
    console.log('Performance measure received:', event.data);
  }
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
});