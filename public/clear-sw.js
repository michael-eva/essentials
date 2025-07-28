// Utility script to clear service worker cache
// Run this in the browser console to clear all service worker data

if ('serviceWorker' in navigator) {
  // Unregister all service workers
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister()
      console.log('Service worker unregistered')
    }
  })

  // Clear all caches
  caches.keys().then((cacheNames) => {
    return Promise.all(
      cacheNames.map((cacheName) => {
        return caches.delete(cacheName)
      })
    )
  }).then(() => {
    console.log('All caches cleared')
  })
}

console.log('Service worker cache cleared. Please refresh the page.') 