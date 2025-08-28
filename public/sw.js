// ==========================================
// ESSENTIALS PWA SERVICE WORKER V5.3
// SAFARI COMPATIBILITY - NULL RESPONSE FIX  
// ==========================================

const CACHE_NAME = 'essentials-safari-v5.3'
const STATIC_CACHE = 'essentials-static-v5.3'
const DYNAMIC_CACHE = 'essentials-dynamic-v5.3'
const DEBUG_MODE = true
const SW_VERSION = '5.3.0'

// Completely new cache strategy
const STATIC_ASSETS = [
  '/manifest.json',
  '/logo/essentials_logo.png', 
  '/logo/essentials_studio_logo.png'
]

console.log('🚀 SERVICE WORKER V5.3 - SAFARI NULL RESPONSE FIX + TRPC BYPASS')
console.log('📦 Cache Names:', { CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE })
console.log('🔥 SW Version:', SW_VERSION)

// Enhanced install event
self.addEventListener('install', (event) => {
  console.log('🔧 SERVICE WORKER V5.3 INSTALLING...')
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Static cache opened:', STATIC_CACHE)
        return cache.addAll(STATIC_ASSETS).catch(err => {
          console.warn('⚠️ Some static assets failed to cache:', err)
          // Don't fail installation if some assets can't be cached
          return Promise.resolve()
        })
      }),
      caches.open(DYNAMIC_CACHE).then(cache => {
        console.log('📦 Dynamic cache opened:', DYNAMIC_CACHE)
        return cache
      })
    ]).then(() => {
      console.log('✅ V5.3 SERVICE WORKER INSTALLED SUCCESSFULLY')
      return self.skipWaiting()
    }).catch(error => {
      console.error('❌ Installation failed:', error)
      // Don't throw - let it install anyway
      return self.skipWaiting()
    })
  )
})

// Enhanced message handling
self.addEventListener('message', (event) => {
  console.log('📨 V5.3 Service Worker received message:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⚡ SKIP_WAITING command received')
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: SW_VERSION })
  }
})

// FIXED FETCH EVENT - NEVER RETURNS NULL
self.addEventListener('fetch', (event) => {
  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return // Let browser handle external requests normally
  }

  // Handle navigation requests (pages) - let them pass through normally
  if (event.request.mode === 'navigate') {
    console.log('📱 Navigation request - letting browser handle:', event.request.url)
    // Don't intercept navigation requests - let browser handle them naturally
    return
  }

  // Don't cache tRPC API calls or sensitive state endpoints - always fetch fresh
  if (event.request.url.includes('/api/trpc/') || 
      event.request.url.includes('workoutPlan.getActivePlan')) {
    console.log('🔥 tRPC API call - bypassing cache for fresh data:', event.request.url)
    return // Let browser handle API calls normally to always get fresh data
  }

  // Handle other requests - GUARANTEED RESPONSE  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }
        
        // Try to fetch from network
        return fetch(event.request)
          .then(networkResponse => {
            // Clone the response to cache it
            if (networkResponse && networkResponse.ok && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone()
              caches.open(DYNAMIC_CACHE).then(cache => {
                cache.put(event.request, responseToCache)
              })
            }
            return networkResponse
          })
          .catch(() => {
            // Network failed and no cache - return appropriate fallback
            if (event.request.destination === 'image') {
              return new Response('', { 
                status: 404, 
                statusText: 'Image not found',
                headers: { 'Content-Type': 'text/plain' }
              })
            }
            
            // For other resources, just let them fail naturally
            return new Response('Resource unavailable', { 
              status: 503, 
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain' }
            })
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

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 SERVICE WORKER V5.3 ACTIVATING...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      const deletePromises = cacheNames.map((cacheName) => {
        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
          console.log('🗑️ Deleting old cache:', cacheName)
          return caches.delete(cacheName)
        }
      }).filter(Boolean)
      
      return Promise.all(deletePromises)
    }).then(() => {
      console.log('✅ V5.3 SERVICE WORKER ACTIVATED')
      // Take control of all clients immediately
      return self.clients.claim()
    }).catch(error => {
      console.error('❌ Activation failed:', error)
      // Don't fail activation
      return self.clients.claim()
    })
  )
}) 