'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import type { TRPCClientErrorLike } from '@trpc/client'
import type { AppRouter } from '@/server/api/root'

interface UseConnectionFeedbackOptions {
  maxRetries?: number
  retryDelay?: number
  timeoutMs?: number
}

interface RetryableError {
  isRetryable: boolean
  message: string
  isTimeout: boolean
}

export function useConnectionFeedback(options: UseConnectionFeedbackOptions = {}) {
  const { maxRetries = 3, retryDelay = 1500, timeoutMs = 30000 } = options
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  const isNetworkError = useCallback((error: unknown): RetryableError => {
    // Handle tRPC errors
    if (error && typeof error === 'object' && 'data' in error) {
      const tRPCError = error as { data?: { code?: string } }
      const code = tRPCError.data?.code
      if (code === 'TIMEOUT' || code === 'INTERNAL_SERVER_ERROR') {
        return {
          isRetryable: true,
          message: 'Connection issue detected. Would you like to try again?',
          isTimeout: code === 'TIMEOUT'
        }
      }
    }

    // Handle fetch/network errors
    if (error && typeof error === 'object' && 'message' in error) {
      const errorWithMessage = error as { message: string }
      const message = errorWithMessage.message.toLowerCase()
      if (
        message.includes('fetch') ||
        message.includes('network') ||
        message.includes('connection') ||
        message.includes('timeout') ||
        message.includes('failed to fetch')
      ) {
        return {
          isRetryable: true,
          message: 'Connection failed. Check your internet and try again.',
          isTimeout: message.includes('timeout')
        }
      }
    }

    // Handle generic errors that might be connection-related
    if (!navigator.onLine) {
      return {
        isRetryable: true,
        message: 'You appear to be offline. Please check your connection.',
        isTimeout: false
      }
    }

    // Extract error message safely
    let errorMessage = 'An unexpected error occurred'
    if (error && typeof error === 'object' && 'message' in error) {
      const errorWithMessage = error as { message: string }
      errorMessage = errorWithMessage.message
    } else if (typeof error === 'string') {
      errorMessage = error
    }

    return {
      isRetryable: false,
      message: errorMessage,
      isTimeout: false
    }
  }, [])

  const handleError = useCallback((
    error: unknown,
    retryFn?: () => void
  ) => {
    const errorInfo = isNetworkError(error)

    if (errorInfo.isRetryable && retryFn && retryCount < maxRetries) {
      // Show retry toast
      toast.error(errorInfo.message, {
        action: {
          label: `Retry ${retryCount > 0 ? `(${retryCount + 1}/${maxRetries})` : ''}`,
          onClick: () => {
            setIsRetrying(true)
            setRetryCount(prev => prev + 1)

            setTimeout(() => {
              retryFn()
              setIsRetrying(false)
            }, retryDelay)
          }
        },
        duration: 8000 // Give user time to click retry
      })
    } else if (retryCount >= maxRetries) {
      // Max retries reached
      toast.error(`Connection failed after ${maxRetries} attempts. Please check your internet connection.`, {
        duration: 6000
      })
      setRetryCount(0) // Reset for next time
    } else {
      // Non-retryable error, show normal error
      toast.error(errorInfo.message)
    }
  }, [isNetworkError, retryCount, maxRetries, retryDelay])

  const withTimeout = useCallback(<T,>(promise: Promise<T>): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timed out. Please check your connection.'))
        }, timeoutMs)
      })
    ])
  }, [timeoutMs])

  const resetRetries = useCallback(() => {
    setRetryCount(0)
    setIsRetrying(false)
  }, [])

  return {
    handleError,
    withTimeout,
    resetRetries,
    isRetrying,
    retryCount,
    maxRetries
  }
} 