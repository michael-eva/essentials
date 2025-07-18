'use client'

import { useEffect } from 'react'
import { InstallPrompt } from './InstallPrompt'

export function PWAProvider() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      // Unregister any existing service workers first
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister()
        }
      }).then(() => {
        // Register the new service worker
        return navigator.serviceWorker.register('/sw.js')
      }).then((registration) => {
        console.log('SW registered successfully:', registration)
        
        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker is available
                console.log('New service worker available')
              }
            })
          }
        })
      }).catch((registrationError) => {
        console.error('SW registration failed:', registrationError)
      })
    }
  }, [])

  return (
    <>
      <InstallPrompt />
    </>
  )
} 