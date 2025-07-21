'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Smartphone, Download, Share } from 'lucide-react'

// Define the BeforeInstallPromptEvent interface
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isMacOS, setIsMacOS] = useState(false)
  const [showIOSPrompt, setShowIOSPrompt] = useState(false)
  const [showMacOSPrompt, setShowMacOSPrompt] = useState(false)
  const [showFallbackPrompt, setShowFallbackPrompt] = useState(false)
  const [pwaSupported, setPwaSupported] = useState<boolean | null>(null)

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

  useEffect(() => {
    const userAgentString = window.navigator.userAgent

    // Check if running on iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgentString)
    setIsIOS(isIOSDevice)

    // Check if running on macOS Safari (not Chrome/Edge on Mac)
    const isMacOSDevice = /Macintosh|MacIntel|MacPPC|Mac68K/.test(navigator.platform) &&
      /Safari/.test(userAgentString) &&
      !/Chrome|CriOS|EdgiOS|Edg/.test(userAgentString)
    setIsMacOS(isMacOSDevice)

    // Check PWA support
    const support = checkPWASupport()
    setPwaSupported(support.isFullySupported)

    // Show iOS prompt after delay
    if (isIOSDevice) {
      const timer = setTimeout(() => {
        setShowIOSPrompt(true)
      }, 2000)
      return () => clearTimeout(timer)
    }

    // Show macOS prompt after delay (if PWA is supported)
    if (isMacOSDevice) {
      const timer = setTimeout(() => {
        if (support.isFullySupported) {
          setShowMacOSPrompt(true)
        } else {
          // Show fallback for unsupported macOS Safari
          setShowFallbackPrompt(true)
        }
      }, 2000)
      return () => clearTimeout(timer)
    }

    // For other browsers, show fallback if PWA isn't fully supported
    if (!isIOSDevice && !isMacOSDevice && !support.hasBeforeInstallPrompt) {
      const timer = setTimeout(() => {
        setShowFallbackPrompt(true)
      }, 3000) // Longer delay to see if beforeinstallprompt fires
      return () => clearTimeout(timer)
    }
  }, [])

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
      // Cancel fallback prompt since we have native support
      setShowFallbackPrompt(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }

    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleClose = () => {
    setShowInstallPrompt(false)
  }

  const handleIOSClose = () => {
    setShowIOSPrompt(false)
  }

  const handleMacOSClose = () => {
    setShowMacOSPrompt(false)
  }

  const handleFallbackClose = () => {
    setShowFallbackPrompt(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (isIOS) {
      setShowIOSPrompt(open)
    } else if (isMacOS) {
      setShowMacOSPrompt(open)
    } else if (showFallbackPrompt) {
      setShowFallbackPrompt(open)
    } else {
      setShowInstallPrompt(open)
    }
  }

  // Don't render anything if no prompts should be shown
  if (!showInstallPrompt && !showIOSPrompt && !showMacOSPrompt && !showFallbackPrompt) {
    return null
  }

  return (
    <Dialog
      open={showInstallPrompt || showIOSPrompt || showMacOSPrompt || showFallbackPrompt}
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
          {isIOS && showIOSPrompt ? (
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
                <Button onClick={handleIOSClose} variant="outline" size="sm">
                  Got it
                </Button>
              </div>
            </div>
          ) : isMacOS && showMacOSPrompt ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                To install Essentials on your Mac:
              </p>
              <ol className="text-sm space-y-2 list-decimal list-inside">
                <li>Click <strong>File</strong> in Safari's menu bar</li>
                <li>Select <strong>"Add to Dock"</strong></li>
                <li>Or click the Share button and choose <strong>"Add to Dock"</strong></li>
              </ol>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Smartphone className="h-4 w-4" />
                <span>Essentials will appear as a separate app in your Dock</span>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleMacOSClose} variant="outline" size="sm">
                  Got it
                </Button>
              </div>
            </div>
          ) : showFallbackPrompt ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Your browser doesn't fully support app installation, but you can still bookmark Essentials for quick access!
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
                <Button onClick={handleFallbackClose} variant="outline" size="sm">
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
                <Button onClick={handleInstallClick} className="flex-1">
                  Install App
                </Button>
                <Button onClick={handleClose} variant="outline">
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