'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { api } from '@/trpc/react'

export default function WaitlistPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  // Use tRPC hooks
  const { data: accessData, isLoading: isCheckingAccess } = api.waitlist.checkAccess.useQuery(undefined, {
    retry: false,
  });

  const validatePasswordMutation = api.waitlist.validatePassword.useMutation()

  // Check if user already has access and redirect
  useEffect(() => {
    if (accessData?.hasAccess) {
      router.push('/auth')
    }
  }, [accessData, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password.trim()) {
      setError('Please enter your access code.')
      return
    }

    try {
      await validatePasswordMutation.mutateAsync({ password: password.trim() })
      router.push('/auth')
    } catch (error: any) {
      console.error('Error validating access code:', error)
      setError(error?.message || 'Invalid access code. Please check your code and try again.')
    }
  }

  // Show loading state while checking for existing access
  if (isCheckingAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-light-yellow to-brand-bright-orange/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-brown mx-auto"></div>
              <p className="mt-2 text-brand-brown/70">Checking access...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light-yellow to-brand-bright-orange/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Image
              src="/logo/essentials_studio_logo.png"
              alt="Essentials Studio"
              width={120}
              height={120}
              className="rounded-xl"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-brand-brown">
            Essentials Studio
          </CardTitle>
          <p className="text-brand-brown/70 text-center">
            We're currently in testing phase and not open to the public yet. 
            If you have an access code, enter it below to continue.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter your access code"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
              {error && (
                <p className="text-destructive text-sm mt-2">{error}</p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={validatePasswordMutation.isPending}
            >
              {validatePasswordMutation.isPending ? 'Verifying...' : 'Access App'}
            </Button>
          </form>
          <div className="text-center">
            <p className="text-sm text-brand-brown/60">
              Don't have an access code? We'll be launching soon!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
