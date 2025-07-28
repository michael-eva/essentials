// ==========================================
// ESSENTIALS PWA SERVICE WORKER V5.0
// COMPLETE REWRITE FOR SAFARI COMPATIBILITY  
// ==========================================

const CACHE_NAME = 'essentials-safari-v5.0-finalss'
const STATIC_CACHE = 'essentials-static-v5'
const DYNAMIC_CACHE = 'essentials-dynamic-v5'
const DEBUG_MODE = true
const SW_VERSION = '5.0.0'

// Completely new cache strategy
const STATIC_ASSETS = [
  '/manifest.json',
  '/logo/essentials_logo.png', 
  '/logo/essentials_studio_logo.png',
  '/offline.html'
]

console.log('🚀🚀🚀 BRAND NEW SERVICE WORKER V5.0 LOADING 🚀🚀🚀')
console.log('📦 Cache Names:', { CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE })
console.log('🔥 SW Version:', SW_VERSION)
console.log('🐛 Debug Mode Active:', DEBUG_MODE)
console.log('📱 User Agent:', navigator.userAgent)

// Enhanced install event with new logic
self.addEventListener('install', (event) => {
  console.log('🔧 NEW SERVICE WORKER V5.0 INSTALLING...')
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Static cache opened:', STATIC_CACHE)
        return cache.addAll(STATIC_ASSETS)
      }),
      caches.open(DYNAMIC_CACHE).then(cache => {
        console.log('📦 Dynamic cache opened:', DYNAMIC_CACHE)
        return cache
      })
    ]).then(() => {
      console.log('✅ V5.0 SERVICE WORKER INSTALLED SUCCESSFULLY')
      console.log('⚡ Forcing immediate activation...')
      return self.skipWaiting()
    }).catch(error => {
      console.error('❌ Installation failed:', error)
      throw error
    })
  )
})

// Enhanced message handling
self.addEventListener('message', (event) => {
  console.log('📨 V5.0 Service Worker received message:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⚡ SKIP_WAITING command received - activating V5.0 immediately')
    self.skipWaiting().then(() => {
      console.log('✅ V5.0 Service Worker activated successfully')
    }).catch(error => {
      console.error('❌ Skip waiting failed:', error)
    })
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: SW_VERSION })
  }
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip all external requests including Google Fonts
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  // Handle navigation requests (pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Return offline page when navigation fails
          return caches.match('/offline.html')
        })
    )
    return
  }

  // Only cache static assets, not pages that might redirect
  if (event.request.destination === 'document') {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .catch(() => {
            // Return a simple offline response for failed requests
            if (event.request.destination === 'image') {
              return new Response('', { status: 404 })
            }
            return new Response('Offline', { status: 503 })
          })
      })
  )
})

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: data.icon || '/logo/essentials_logo.png',
      badge: data.badge || '/logo/essentials_logo.png',
      vibrate: [100, 50, 100],
      data: data.data || {
        dateOfArrival: Date.now(),
        primaryKey: '1',
      },
      actions: [
        {
          action: 'open',
          title: 'Open App',
          icon: '/logo/essentials_logo.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/logo/essentials_logo.png'
        }
      ]
    }

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received.')
  
  event.notification.close()

  if (event.action === 'close') {
    return
  }

  // Open the app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus()
          }
        }
        
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow('/')
        }
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  try {
    // Handle any pending offline actions here
    console.log('Background sync completed')
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Update event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim()
    })
  )
}) 