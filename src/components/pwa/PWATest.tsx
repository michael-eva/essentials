'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { sendNotification } from '@/app/actions'
import { toast } from 'sonner'

export function PWATest() {
  const [isLoading, setIsLoading] = useState(false)

  const testNotification = async () => {
    setIsLoading(true)
    try {
      const result = await sendNotification(
        'This is a test notification from Essentials! 🎉',
        'Test Notification'
      )
      
      if (result.success) {
        toast.success(`Notification sent successfully! Sent to ${result.sent} users.`)
      } else {
        toast.error(result.error || 'Failed to send notification')
      }
    } catch (error) {
      console.error('Error sending test notification:', error)
      toast.error('Failed to send test notification')
    } finally {
      setIsLoading(false)
    }
  }

  const testWorkoutReminder = async () => {
    setIsLoading(true)
    try {
      const result = await sendNotification(
        'Time for your Pilates workout! 💪',
        'Workout Reminder'
      )
      
      if (result.success) {
        toast.success(`Workout reminder sent! Sent to ${result.sent} users.`)
      } else {
        toast.error(result.error || 'Failed to send workout reminder')
      }
    } catch (error) {
      console.error('Error sending workout reminder:', error)
      toast.error('Failed to send workout reminder')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>PWA Test Panel</CardTitle>
        <CardDescription>
          Test push notifications and PWA functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button 
            onClick={testNotification} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Sending...' : 'Send Test Notification'}
          </Button>
          
          <Button 
            onClick={testWorkoutReminder} 
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? 'Sending...' : 'Send Workout Reminder'}
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Make sure you&apos;ve subscribed to notifications first</p>
          <p>• Check browser console for service worker logs</p>
          <p>• Ensure HTTPS is enabled for testing</p>
        </div>
      </CardContent>
    </Card>
  )
} 