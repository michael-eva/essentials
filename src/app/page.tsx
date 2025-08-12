'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function WaitlistPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simple password check - in a real app this would be handled securely on the server
    if (password === process.env.NEXT_PUBLIC_WAITLIST_PASSWORD || password === 'early-access-2024') {
      router.push('/auth')
    } else if (password.trim()) {
      setError('Invalid access code. Please check your code and try again.')
    } else {
      setError('Please enter your access code.')
    }
    
    setIsLoading(false)
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
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Access App'}
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
