'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Smartphone, Download } from 'lucide-react'

export function InstallPrompt() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if running on iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(isIOSDevice)

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
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

  if (!showInstallPrompt && !isIOS) {
    return null
  }

  return (
    <Dialog open={showInstallPrompt || isIOS} onOpenChange={setShowInstallPrompt}>
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
                <li>Tap the Share button <span className="font-mono">⎋</span> in your browser</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" to confirm</li>
              </ol>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Smartphone className="h-4 w-4" />
                <span>You can then access Essentials from your home screen</span>
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