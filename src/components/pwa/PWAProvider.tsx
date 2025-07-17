'use client'

import { useEffect } from 'react'
import { InstallPrompt } from './InstallPrompt'

export function PWAProvider() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered successfully:', registration)
        })
        .catch((registrationError) => {
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