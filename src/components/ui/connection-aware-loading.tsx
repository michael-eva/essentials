'use client'

import { useState, useEffect } from 'react'
import { Loader2, Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConnectionAwareLoadingProps {
  isLoading: boolean
  children?: React.ReactNode
  className?: string
  slowWarningMs?: number
  timeoutMs?: number
  onTimeout?: () => void
}

export function ConnectionAwareLoading({
  isLoading,
  children,
  className,
  slowWarningMs = 5000,
  timeoutMs = 15000,
  onTimeout
}: ConnectionAwareLoadingProps) {
  const [showSlowWarning, setShowSlowWarning] = useState(false)
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine)

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (!isLoading) {
      setShowSlowWarning(false)
      setShowTimeoutWarning(false)
      return
    }

    // Show slow warning after delay
    const slowTimer = setTimeout(() => {
      if (isLoading) {
        setShowSlowWarning(true)
      }
    }, slowWarningMs)

    // Show timeout warning and call callback
    const timeoutTimer = setTimeout(() => {
      if (isLoading) {
        setShowTimeoutWarning(true)
        onTimeout?.()
      }
    }, timeoutMs)

    return () => {
      clearTimeout(slowTimer)
      clearTimeout(timeoutTimer)
    }
  }, [isLoading, slowWarningMs, timeoutMs, onTimeout])

  if (!isLoading) return <>{children}</>

  return (
    <div className={cn("flex flex-col items-center justify-center p-8 space-y-4", className)}>
      <div className="flex items-center space-x-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="text-sm text-muted-foreground">
          {showTimeoutWarning ? 'Still trying to connect...' :
            showSlowWarning ? 'Taking longer than usual...' :
              'Loading...'}
        </span>
      </div>

      {!isOnline && (
        <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
          <WifiOff className="h-4 w-4" />
          <span className="text-xs">You appear to be offline</span>
        </div>
      )}

      {showSlowWarning && isOnline && (
        <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
          <Wifi className="h-4 w-4" />
          <span className="text-xs">Slow connection detected</span>
        </div>
      )}

      {showTimeoutWarning && (
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            This is taking longer than expected.
          </p>
          <p className="text-xs text-muted-foreground">
            Please check your internet connection.
          </p>
        </div>
      )}
    </div>
  )
} 