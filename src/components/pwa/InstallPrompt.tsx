'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Smartphone, Download, Share } from 'lucide-react'
import { toast } from 'sonner'

// Define the BeforeInstallPromptEvent interface
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Constants for localStorage and timing
const DISMISSAL_KEYS = {
  NATIVE: 'pwa_install_dismissed_native',
  IOS: 'pwa_install_dismissed_ios',
  MACOS: 'pwa_install_dismissed_macos',
  FALLBACK: 'pwa_install_dismissed_fallback'
} as const

const DISMISSAL_DURATION = 3 * 24 * 60 * 60 * 1000 // 3 days in milliseconds

interface InstallPromptProps {
  forceShow?: boolean
  onClose?: () => void
}

export function InstallPrompt({ forceShow = false, onClose }: InstallPromptProps = {}) {
  const pathname = usePathname()
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isMacOS, setIsMacOS] = useState(false)
  const [showIOSPrompt, setShowIOSPrompt] = useState(false)
  const [showMacOSPrompt, setShowMacOSPrompt] = useState(false)
  const [showFallbackPrompt, setShowFallbackPrompt] = useState(false)
  const [pwaSupported, setPwaSupported] = useState<boolean | null>(null)

  // Don't show install prompts during auth or onboarding
  const shouldHidePrompt = pathname?.includes('/auth') || pathname?.includes('/onboarding') || pathname === '/'

  // Enhanced PWA support detection
  const checkPWASupport = () => {
    const hasServiceWorker = 'serviceWorker' in navigator
    const hasManifest = document.querySelector('link[rel="manifest"]')
    const isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost'
    const hasBeforeInstallPrompt = 'onbeforeinstallprompt' in window

    return {
      hasServiceWorker,
      hasManifest: !!hasManifest,
      isHTTPS,
      hasBeforeInstallPrompt,
      isFullySupported: hasServiceWorker && hasManifest && isHTTPS
    }
  }

  // Check if PWA is already installed
  const isPWAInstalled = () => {
    // Check if running in standalone mode (installed PWA)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true
    }

    // Check if running in fullscreen mode (some PWAs)
    if (window.matchMedia('(display-mode: fullscreen)').matches) {
      return true
    }

    // Check navigator.standalone for iOS
    if ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone) {
      return true
    }

    return false
  }

  // Check if dismissal period has passed
  const shouldShowPrompt = (dismissalKey: string) => {
    if (isPWAInstalled()) {
      return false // Don't show if already installed
    }

    const dismissedAt = localStorage.getItem(dismissalKey)
    if (!dismissedAt) {
      return true // Never dismissed before
    }

    const dismissedTime = parseInt(dismissedAt, 10)
    const now = Date.now()

    return (now - dismissedTime) > DISMISSAL_DURATION
  }

  // Save dismissal timestamp
  const saveDismissal = (dismissalKey: string) => {
    localStorage.setItem(dismissalKey, Date.now().toString())
  }

  useEffect(() => {
    const userAgentString = window.navigator.userAgent

    // Check if running on iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgentString)
    setIsIOS(isIOSDevice)

    // Check if running on macOS Safari (not Chrome/Edge on Mac)
    const isMacOSDevice = /Macintosh|MacIntel|MacPPC|Mac68K/.test(navigator.platform) &&
      userAgentString.includes('Safari') &&
      !/Chrome|CriOS|EdgiOS|Edg/.test(userAgentString)
    setIsMacOS(isMacOSDevice)

    // Check PWA support
    const support = checkPWASupport()
    setPwaSupported(support.isFullySupported)

    // Show iOS prompt after delay (only if not dismissed recently and not in auth/onboarding)
    if (isIOSDevice && !shouldHidePrompt && shouldShowPrompt(DISMISSAL_KEYS.IOS)) {
      const timer = setTimeout(() => {
        setShowIOSPrompt(true)
      }, 2000)
      return () => clearTimeout(timer)
    }

    // Show macOS prompt after delay (if PWA is supported, not dismissed recently, and not in auth/onboarding)
    if (isMacOSDevice && !shouldHidePrompt && shouldShowPrompt(DISMISSAL_KEYS.MACOS)) {
      const timer = setTimeout(() => {
        if (support.isFullySupported) {
          setShowMacOSPrompt(true)
        } else {
          // Show fallback for unsupported macOS Safari (only if not dismissed recently)
          if (shouldShowPrompt(DISMISSAL_KEYS.FALLBACK)) {
            setShowFallbackPrompt(true)
          }
        }
      }, 2000)
      return () => clearTimeout(timer)
    }

    // For other browsers, show fallback if PWA isn't fully supported (and not dismissed recently and not in auth/onboarding)
    if (!isIOSDevice && !isMacOSDevice && !shouldHidePrompt && !support.hasBeforeInstallPrompt && shouldShowPrompt(DISMISSAL_KEYS.FALLBACK)) {
      const timer = setTimeout(() => {
        setShowFallbackPrompt(true)
      }, 3000) // Longer delay to see if beforeinstallprompt fires
      return () => clearTimeout(timer)
    }
  }, [shouldHidePrompt])

  // Listen for beforeinstallprompt and appinstalled events
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()

      // Don't show during auth or onboarding
      if (window.location.pathname.includes('/auth') || window.location.pathname.includes('/onboarding')) {
        return
      }

      // Only show if not dismissed recently
      if (!shouldShowPrompt(DISMISSAL_KEYS.NATIVE)) {
        return
      }

      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
      // Cancel fallback prompt since we have native support
      setShowFallbackPrompt(false)
    }

    const handleAppInstalled = (e: Event) => {
      console.log('PWA was installed successfully')

      // Try to automatically open the PWA after installation
      setTimeout(() => {
        try {
          // Get the current origin for the PWA URL
          const pwaUrl = window.location.origin

          // Try to open the PWA - this will open in standalone mode if installed
          const pwaWindow = window.open(pwaUrl, '_blank', 'noopener,noreferrer')

          // If window.open was blocked, user will need to manually open from home screen
          if (!pwaWindow) {
            console.log('Auto-open blocked by browser - user will need to manually open the PWA from their home screen')

            // Show helpful toast notification
            toast.success('🎉 Essentials installed successfully!', {
              description: 'Find the app on your home screen to get started.',
              duration: 5000,
            })
          } else {
            console.log('PWA opened automatically after installation')

            // Show success toast
            toast.success('🎉 Essentials installed and opened!', {
              description: 'Welcome to your new fitness companion.',
              duration: 3000,
            })
          }
        } catch (error) {
          console.error('Failed to auto-open PWA:', error)

          // Show fallback toast
          toast.success('🎉 Essentials installed successfully!', {
            description: 'Find the app on your home screen to get started.',
            duration: 5000,
          })
        }
      }, 1000) // Wait 1 second for installation to complete
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt - PWA will auto-open when installation completes')
    } else {
      console.log('User dismissed the install prompt')
      // Save dismissal if user rejected the install
      saveDismissal(DISMISSAL_KEYS.NATIVE)
    }

    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleClose = () => {
    saveDismissal(DISMISSAL_KEYS.NATIVE)
    setShowInstallPrompt(false)
  }

  const handleIOSClose = () => {
    saveDismissal(DISMISSAL_KEYS.IOS)
    setShowIOSPrompt(false)
  }

  const handleMacOSClose = () => {
    saveDismissal(DISMISSAL_KEYS.MACOS)
    setShowMacOSPrompt(false)
  }

  const handleFallbackClose = () => {
    saveDismissal(DISMISSAL_KEYS.FALLBACK)
    setShowFallbackPrompt(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // User clicked the "X" button or pressed Escape
      if (forceShow && onClose) {
        onClose()
      } else if (isIOS && showIOSPrompt) {
        handleIOSClose()
      } else if (isMacOS && showMacOSPrompt) {
        handleMacOSClose()
      } else if (showFallbackPrompt) {
        handleFallbackClose()
      } else if (showInstallPrompt) {
        handleClose()
      }
    }
  }

  // Don't render anything during auth/onboarding or if no prompts should be shown
  if (shouldHidePrompt || (!forceShow && !showInstallPrompt && !showIOSPrompt && !showMacOSPrompt && !showFallbackPrompt)) {
    return null
  }

  return (
    <Dialog
      open={!shouldHidePrompt && (forceShow || showInstallPrompt || showIOSPrompt || showMacOSPrompt || showFallbackPrompt)}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            {showFallbackPrompt ? 'Bookmark Essentials' : 'Install Essentials'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {(isIOS && showIOSPrompt) || (forceShow && isIOS) ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                To install Essentials on your iPhone or iPad:
              </p>
              <ol className="text-sm space-y-2 list-decimal list-inside">
                <li>Tap the Share button <Share className="inline h-4 w-4" /> in your browser</li>
                <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
                <li>Tap &quot;Add&quot; to confirm</li>
              </ol>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Smartphone className="h-4 w-4" />
                <span>You can then access Essentials from your home screen</span>
              </div>
              <div className="flex justify-end">
                <Button onClick={forceShow && onClose ? onClose : handleIOSClose} variant="outline" size="sm">
                  Got it
                </Button>
              </div>
            </div>
          ) : (isMacOS && showMacOSPrompt) || (forceShow && isMacOS) ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                To install Essentials on your Mac:
              </p>
              <ol className="text-sm space-y-2 list-decimal list-inside">
                <li>Click <strong>File</strong> in Safari&apos;s menu bar</li>
                <li>Select <strong>&quot;Add to Dock&quot;</strong></li>
                <li>Or click the Share button and choose <strong>&quot;Add to Dock&quot;</strong></li>
              </ol>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Smartphone className="h-4 w-4" />
                <span>Essentials will appear as a separate app in your Dock</span>
              </div>
              <div className="flex justify-end">
                <Button onClick={forceShow && onClose ? onClose : handleMacOSClose} variant="outline" size="sm">
                  Got it
                </Button>
              </div>
            </div>
          ) : showFallbackPrompt || (forceShow && !isIOS && !isMacOS && !deferredPrompt) ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Your browser doesn&apos;t fully support app installation, but you can still bookmark Essentials for quick access!
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Quick tip:</strong> Add this page to your bookmarks or create a desktop shortcut for easy access.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => window.open('https://support.google.com/chrome/answer/9658361', '_blank')}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Learn More
                </Button>
                <Button onClick={forceShow && onClose ? onClose : handleFallbackClose} variant="outline" size="sm">
                  Got it
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Install Essentials for a better experience with quick access and offline features.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={deferredPrompt ? handleInstallClick : (forceShow && onClose ? onClose : handleClose)}
                  className="flex-1"
                  disabled={!deferredPrompt && !forceShow}
                >
                  {deferredPrompt ? 'Install App' : 'Install Not Available'}
                </Button>
                <Button onClick={forceShow && onClose ? onClose : handleClose} variant="outline">
                  Not Now
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 