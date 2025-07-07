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
  const [showIOSPrompt, setShowIOSPrompt] = useState(false)

  useEffect(() => {
    // Check if running on iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(isIOSDevice)
    
    // Show iOS prompt after a delay to avoid showing immediately
    if (isIOSDevice) {
      const timer = setTimeout(() => {
        setShowIOSPrompt(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
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

  const handleOpenChange = (open: boolean) => {
    if (isIOS) {
      setShowIOSPrompt(open)
    } else {
      setShowInstallPrompt(open)
    }
  }

  // Don't render anything if no prompts should be shown
  if (!showInstallPrompt && !showIOSPrompt) {
    return null
  }

  return (
    <Dialog 
      open={showInstallPrompt || showIOSPrompt} 
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Install Essentials
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isIOS ? (
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