'use client'

import { useEffect } from 'react'
import { PushNotificationManager } from './PushNotificationManager'
import { InstallPrompt } from './InstallPrompt'

export function PWAProvider() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    }
  }, [])

  return (
    <>
      <PushNotificationManager />
      <InstallPrompt />
    </>
  )
} 