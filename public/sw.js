// ==========================================
// ESSENTIALS PWA SERVICE WORKER V5.1
// SAFARI COMPATIBILITY - NULL RESPONSE FIX  
// ==========================================

const CACHE_NAME = 'essentials-safari-v5.1'
const STATIC_CACHE = 'essentials-static-v5.1'
const DYNAMIC_CACHE = 'essentials-dynamic-v5.1'
const DEBUG_MODE = true
const SW_VERSION = '5.1.0'

// Completely new cache strategy
const STATIC_ASSETS = [
  '/manifest.json',
  '/logo/essentials_logo.png', 
  '/logo/essentials_studio_logo.png',
  '/offline.html'
]

console.log('🚀 SERVICE WORKER V5.1 - SAFARI NULL RESPONSE FIX')
console.log('📦 Cache Names:', { CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE })
console.log('🔥 SW Version:', SW_VERSION)

// Create fallback offline response
const createOfflineResponse = () => {
  return new Response(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Essentials - Offline</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background-color: #f5f5f5;
                color: #333;
            }
            .container {
                text-align: center;
                padding: 2rem;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                max-width: 400px;
            }
            .icon { font-size: 4rem; margin-bottom: 1rem; }
            h1 { margin: 0 0 1rem 0; color: #000; }
            p { margin: 0 0 1.5rem 0; color: #666; line-height: 1.5; }
            button {
                background: #000; color: white; border: none;
                padding: 12px 24px; border-radius: 6px; font-size: 16px;
                cursor: pointer; transition: background-color 0.2s;
            }
            button:hover { background: #333; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">📱</div>
            <h1>You're Offline</h1>
            <p>Please check your internet connection and try again.</p>
            <button onclick="window.location.reload()">Retry</button>
        </div>
    </body>
    </html>
  `, {
    status: 200,
    statusText: 'OK',
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  })
}

// Enhanced install event
self.addEventListener('install', (event) => {
  console.log('🔧 SERVICE WORKER V5.1 INSTALLING...')
  
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
      console.log('✅ V5.1 SERVICE WORKER INSTALLED SUCCESSFULLY')
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
  console.log('📨 V5.1 Service Worker received message:', event.data)
  
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

  // Handle navigation requests (pages) - GUARANTEED RESPONSE
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If fetch succeeds, return it
          if (response && response.ok) {
            return response
          }
          // If fetch fails or returns error, try offline page
          return caches.match('/offline.html')
            .then(cachedResponse => {
              // If offline page is cached, return it
              if (cachedResponse) {
                return cachedResponse
              }
              // If no cached offline page, create fallback response
              console.log('📱 Creating fallback offline response')
              return createOfflineResponse()
            })
        })
        .catch(() => {
          // Network failed, try cached offline page
          return caches.match('/offline.html')
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse
              }
              // Fallback to inline offline page
              console.log('📱 Network failed, using fallback offline response')
              return createOfflineResponse()
            })
        })
    )
    return
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
            
            if (event.request.destination === 'document') {
              return createOfflineResponse()
            }
            
            // Generic fallback for other resource types
            return new Response('Resource unavailable offline', { 
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
  console.log('🔄 SERVICE WORKER V5.1 ACTIVATING...')
  
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
      console.log('✅ V5.1 SERVICE WORKER ACTIVATED')
      // Take control of all clients immediately
      return self.clients.claim()
    }).catch(error => {
      console.error('❌ Activation failed:', error)
      // Don't fail activation
      return self.clients.claim()
    })
  )
}) 