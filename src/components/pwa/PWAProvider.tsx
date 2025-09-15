'use client'

import { useEffect, useState, useRef } from 'react'
import { InstallPrompt } from './InstallPrompt'
import { UpdateNotification } from './UpdateNotification'
import { NotificationPrompt } from './NotificationPrompt'
import { env } from '@/env'

export function PWAProvider() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [newWorker, setNewWorker] = useState<ServiceWorker | null>(null)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [isPWAInstalled, setIsPWAInstalled] = useState(false)
  const isUpdatingRef = useRef(false)

  // Check if PWA is already installed
  const checkPWAInstallation = () => {
    // Check if running in standalone mode (installed PWA)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true
    }

    // Check if running in fullscreen mode (some PWAs)
    if (window.matchMedia('(display-mode: fullscreen)').matches) {
      return true
    }

    // Check navigator.standalone for iOS
    if ('standalone' in window.navigator && (window.navigator as any).standalone) {
      return true
    }

    return false
  }

  useEffect(() => {
    // Check PWA installation status
    if (typeof window !== 'undefined') {
      const isPWA = checkPWAInstallation()
      setIsPWAInstalled(isPWA)
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', {
        // Use default caching strategy for more stable behavior
        updateViaCache: 'all'
      })
        .then((registration) => {
          setRegistration(registration)

          // Only check for updates periodically, not immediately
          // This prevents aggressive update checking that might cause issues

          // Handle service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              setNewWorker(newWorker)

              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New service worker is available - this means there's actually an update

                    // For local development, show notification regardless of PWA status
                    if (env.NODE_ENV === 'development' || checkPWAInstallation()) {
                      setUpdateAvailable(true)
                    }
                  }
                }
              })
            }
          })

          // Check if there's already an update waiting
          if (registration.waiting) {
            setNewWorker(registration.waiting)
            if (env.NODE_ENV === 'development' || checkPWAInstallation()) {
              setUpdateAvailable(true)
            }
          }

          // Listen for controller changes (when new SW takes control after skip waiting)
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            // Only reload if we're in the middle of an update process
            if (isUpdatingRef.current) {
              window.location.reload()
            }
          })
        })
        .catch((registrationError) => {
          console.error('SW registration failed:', registrationError)
        })
    }
  }, [])

  const handleUpdate = async () => {
    if (newWorker) {
      // Mark that we're starting an update
      isUpdatingRef.current = true

      // Tell the new service worker to skip waiting
      newWorker.postMessage({ type: 'SKIP_WAITING' })

      // Add a timeout in case controllerchange doesn't fire
      setTimeout(() => {
        if (isUpdatingRef.current) {
          window.location.reload()
        }
      }, 5000) // 5 second timeout

      // Return a promise that resolves when update completes
      // The page will reload, so this promise may not resolve normally
      return new Promise((resolve) => {
        // If we reach here, the update process has started
        resolve(undefined)
      })

    } else {
      // Hide the notification since this was just a test
      setUpdateAvailable(false)

      // Throw an error so UpdateNotification knows to reset loading state
      throw new Error('No real update available - this was a test notification')
    }
  }

  const handleDismiss = () => {
    setUpdateAvailable(false)
  }

  return (
    <>
      <InstallPrompt />

      {/* Automatic notification prompt for PWA users */}
      <NotificationPrompt isPWAInstalled={isPWAInstalled} />

      {/* Show update notification if PWA is installed OR in development mode */}
      {(isPWAInstalled || env.NODE_ENV === 'development') && (
        <UpdateNotification
          isVisible={updateAvailable}
          onUpdate={handleUpdate}
          onDismiss={handleDismiss}
        />
      )}
    </>
  )
} 