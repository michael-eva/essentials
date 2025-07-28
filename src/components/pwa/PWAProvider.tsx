'use client'

import { useEffect, useState, useRef } from 'react'
import { InstallPrompt } from './InstallPrompt'
import { UpdateNotification } from './UpdateNotification'
import { Button } from '@/components/ui/button'

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
      console.log('PWA Installation Status:', isPWA)
      console.log('Display mode:', window.matchMedia('(display-mode: standalone)').matches)
      console.log('Navigator standalone:', 'standalone' in window.navigator && (window.navigator as any).standalone)
      console.log('User Agent:', navigator.userAgent)
      console.log('Is Safari:', /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent))
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      console.log('Service workers supported, registering...')

      navigator.serviceWorker.register('/sw.js', {
        // Force update check in Safari
        updateViaCache: 'none'
      })
        .then((registration) => {
          console.log('SW registered successfully:', registration)
          setRegistration(registration)

          // Force immediate update check for Safari
          registration.update().then(() => {
            console.log('Manual update check completed')
          }).catch(err => {
            console.log('Manual update check failed:', err)
          })

          // Handle service worker updates
          registration.addEventListener('updatefound', () => {
            console.log('Service worker update found!')
            const newWorker = registration.installing
            if (newWorker) {
              setNewWorker(newWorker)
              console.log('New worker found, state:', newWorker.state)

              newWorker.addEventListener('statechange', () => {
                console.log('New service worker state changed to:', newWorker.state)
                if (newWorker.state === 'installed') {
                  console.log('New service worker installed')
                  console.log('Current controller exists:', !!navigator.serviceWorker.controller)

                  if (navigator.serviceWorker.controller) {
                    // New service worker is available - this means there's actually an update
                    console.log('New service worker available - showing notification')

                    // For local development, show notification regardless of PWA status
                    if (process.env.NODE_ENV === 'development' || checkPWAInstallation()) {
                      console.log('Showing update notification')
                      setUpdateAvailable(true)
                    } else {
                      console.log('Not showing notification - not a PWA installation')
                    }
                  } else {
                    console.log('New service worker installed but no existing controller - likely first install')
                  }
                }
              })
            }
          })

          // Check if there's already an update waiting
          if (registration.waiting) {
            console.log('Service worker waiting found on registration')
            setNewWorker(registration.waiting)
            if (process.env.NODE_ENV === 'development' || checkPWAInstallation()) {
              setUpdateAvailable(true)
            }
          }

          // Listen for controller changes (when new SW takes control after skip waiting)
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('Service worker controller changed')
            // Only reload if we're in the middle of an update process
            if (isUpdatingRef.current) {
              console.log('Service worker updated, reloading page')
              window.location.reload()
            }
          })
        })
        .catch((registrationError) => {
          console.error('SW registration failed:', registrationError)
        })
    } else {
      console.error('Service workers not supported')
    }
  }, [])

  const handleUpdate = async () => {
    console.log('HandleUpdate called')
    console.log('newWorker available:', !!newWorker)
    console.log('newWorker state:', newWorker?.state)

    if (newWorker) {
      // Mark that we're starting an update
      isUpdatingRef.current = true
      console.log('Sending SKIP_WAITING message to new worker')

      // Tell the new service worker to skip waiting
      newWorker.postMessage({ type: 'SKIP_WAITING' })

      // Add a timeout in case controllerchange doesn't fire
      setTimeout(() => {
        if (isUpdatingRef.current) {
          console.log('Update timeout - forcing reload')
          alert('Update taking longer than expected. Reloading now...')
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
      console.log('No newWorker available - this was likely a test notification')
      alert('🧪 Debug: This was a test notification. No real update available.\n\nTo test real updates: 1) Change service worker cache version 2) Use "Force Update Check"')

      // Hide the notification since this was just a test
      setUpdateAvailable(false)

      // Throw an error so UpdateNotification knows to reset loading state
      throw new Error('No real update available - this was a test notification')
    }
  }

  const handleDismiss = () => {
    setUpdateAvailable(false)
  }

  // Manual notification trigger for testing
  const showTestNotification = () => {
    alert('🧪 Debug: Showing test notification UI...\n\nThis tests the notification display only.\nFor real updates, use "Force Update Check" after changing the service worker.')
    setUpdateAvailable(true)
  }

  // Enhanced update check with better feedback
  const forceUpdateCheck = () => {
    console.log('Force update check triggered')
    alert('🔄 Debug: Checking for real service worker updates...')

    if (registration) {
      // Add timeout to prevent hanging
      const updatePromise = registration.update()
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Update check timed out after 10 seconds')), 10000)
      )

      Promise.race([updatePromise, timeoutPromise])
        .then(() => {
          console.log('Manual update completed')
          alert('✅ Debug: Update check completed')

          // Check for waiting worker
          if (registration.waiting) {
            console.log('Found waiting worker, showing notification')
            alert('🎉 Debug: Found real update! Showing notification...')
            setNewWorker(registration.waiting)
            setUpdateAvailable(true)
          } else if (registration.installing) {
            console.log('Found installing worker')
            alert('⏳ Debug: New service worker installing... Please wait and try again.')
          } else {
            console.log('No waiting worker found')
            alert('❌ Debug: No service worker update found.\n\nTo create an update:\n1. Change CACHE_NAME in public/sw.js\n2. Save the file\n3. Try this button again')
          }
        })
        .catch(err => {
          console.error('Manual update failed:', err)
          alert('❌ Debug: Update check failed - ' + err.message + '\n\nTry: 1) Close PWA completely 2) Reopen 3) Try again')
        })
    } else {
      console.log('No registration found for manual update')
      alert('❌ Debug: No service worker registration found')
    }
  }

  return (
    <>
      <InstallPrompt />
      {/* Show update notification if PWA is installed OR in development mode */}
      {(isPWAInstalled || process.env.NODE_ENV === 'development') && (
        <UpdateNotification
          isVisible={updateAvailable}
          onUpdate={handleUpdate}
          onDismiss={handleDismiss}
        />
      )}

      {/* Safari debugging button - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
          <div className="bg-black/80 text-white p-2 rounded text-xs max-w-xs">
            <div>SW Registered: {registration ? '✅' : '❌'}</div>
            <div>PWA Installed: {isPWAInstalled ? '✅' : '❌'}</div>
            <div>Update Available: {updateAvailable ? '✅' : '❌'}</div>
            <div>New Worker: {newWorker ? '✅' : '❌'}</div>
          </div>
          <Button
            onClick={forceUpdateCheck}
            variant="destructive"
            size="sm"
            className="w-full"
          >
            Force Update Check
          </Button>
          <Button
            onClick={showTestNotification}
            variant="secondary"
            size="sm"
            className="w-full"
          >
            Test Notification
          </Button>
        </div>
      )}
    </>
  )
} 