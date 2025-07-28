'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConnectionAwareLoading } from '@/components/ui/connection-aware-loading'
import { useConnectionFeedback } from '@/hooks/useConnectionFeedback'
import { api } from '@/trpc/react'

/**
 * Example component showing how to use the connection feedback system
 * 
 * This demonstrates:
 * 1. Using useConnectionFeedback hook for retry logic
 * 2. Using ConnectionAwareLoading for better loading UX
 * 3. Integrating with tRPC mutations
 */
export function ConnectionFeedbackExample() {
  const [retryFn, setRetryFn] = useState<(() => void) | null>(null)

  // Initialize connection feedback
  const connectionFeedback = useConnectionFeedback({
    maxRetries: 3,      // Allow 3 retry attempts
    retryDelay: 1500,   // Wait 1.5s between retries  
    timeoutMs: 20000    // Show timeout warning after 20s
  })

  // Example of how you would set up a mutation with connection feedback
  // Replace 'api.example.someAction' with your actual tRPC mutation
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<any>(null)

  const handleAction = () => {
    // Example of how to integrate with actual mutation:
    /*
    const mutation = api.yourRouter.yourMutation.useMutation({
      onSuccess: (data) => {
        setData(data)
        connectionFeedback.resetRetries() // Reset on success
      },
      onError: (error) => {
        connectionFeedback.handleError(error, retryFn || undefined)
      }
    })
    
    const retry = () => mutation.mutate({ yourData: 'example' })
    setRetryFn(() => retry)
    retry()
    */

    // For demo purposes:
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setData({ message: 'Demo completed!' })
    }, 2000)
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Connection Feedback Example</h3>

      <Button onClick={handleAction} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Test Connection Feedback'}
      </Button>

      {isLoading && (
        <ConnectionAwareLoading
          isLoading={true}
          slowWarningMs={5000}  // Show "slow" warning after 5s
          timeoutMs={15000}     // Show timeout warning after 15s
          onTimeout={() => {
            console.log('Operation timed out')
          }}
        />
      )}

      {data && (
        <div className="p-3 bg-green-50 border border-green-200 rounded">
          Success! Data: {JSON.stringify(data)}
        </div>
      )}
    </div>
  )
}

/**
 * Usage Tips:
 * 
 * 1. **For simple cases**: Just wrap loading states with ConnectionAwareLoading
 * 2. **For mutations**: Use useConnectionFeedback hook for automatic retry toasts
 * 3. **Custom timeouts**: Adjust slowWarningMs and timeoutMs based on operation
 * 4. **Reset retries**: Call connectionFeedback.resetRetries() on success
 * 5. **Retry functions**: Store and pass retry functions for the hook to use
 */ 