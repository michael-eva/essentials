'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/trpc/react"
import { toast } from "sonner"
import { supabase } from '@/lib/supabase/client'

export default function HomePage() {
  const router = useRouter()
  const [hasAccessCode, setHasAccessCode] = useState(false)
  const [showAccessForm, setShowAccessForm] = useState(false)
  const [showWaitlistForm, setShowWaitlistForm] = useState(false)
  const [accessCode, setAccessCode] = useState("")
  const [waitlistData, setWaitlistData] = useState({
    fullName: "",
    email: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const validateAccessCode = api.waitlist.validateAccessCode.useMutation({
    onSuccess: () => {
      localStorage.setItem("essentials_access_granted", "true")
      toast.success("Access granted! Redirecting to authentication...")
      router.push("/auth")
    },
    onError: (error) => {
      toast.error(error.message || "Invalid access code")
    },
  })

  const joinWaitlist = api.waitlist.join.useMutation({
    onSuccess: () => {
      toast.success("Successfully joined the waitlist! We'll be in touch soon.")
      setWaitlistData({ fullName: "", email: "" })
      setShowWaitlistForm(false)
    },
    onError: (error) => {
      toast.error(error.message || "Failed to join waitlist")
    },
  })

  useEffect(() => {
    const checkAccessAndAuth = async () => {
      // Check if user already has access code validated
      const hasAccess = localStorage.getItem("essentials_access_granted")
      if (hasAccess) {
        // Check if user is already authenticated
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          router.push("/dashboard/overview")
        } else {
          router.push("/auth")
        }
        return
      }
      
      setHasAccessCode(false)
    }

    void checkAccessAndAuth()
  }, [router])

  const handleAccessCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!accessCode.trim()) {
      toast.error("Please enter an access code")
      return
    }
    validateAccessCode.mutate({ accessCode })
  }

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!waitlistData.fullName.trim() || !waitlistData.email.trim()) {
      toast.error("Please fill in all fields")
      return
    }
    joinWaitlist.mutate(waitlistData)
  }

  if (hasAccessCode) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Essentials Studio
          </h1>
          <p className="text-gray-600 text-lg">
            Your personal fitness companion
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Coming Soon</CardTitle>
            <CardDescription>
              We're currently in testing phase and not open to the public yet. 
              Join our waitlist to be notified when we launch!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showAccessForm && !showWaitlistForm && (
              <div className="space-y-3">
                <Button
                  onClick={() => setShowAccessForm(true)}
                  className="w-full"
                  variant="default"
                >
                  I have an access code
                </Button>
                <Button
                  onClick={() => setShowWaitlistForm(true)}
                  className="w-full"
                  variant="outline"
                >
                  Join waitlist
                </Button>
              </div>
            )}

            {showAccessForm && (
              <form onSubmit={handleAccessCodeSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="accessCode">Access Code</Label>
                  <Input
                    id="accessCode"
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Enter your access code"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={validateAccessCode.isPending}
                  >
                    {validateAccessCode.isPending ? "Verifying..." : "Submit"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAccessForm(false)
                      setAccessCode("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {showWaitlistForm && (
              <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={waitlistData.fullName}
                    onChange={(e) =>
                      setWaitlistData({ ...waitlistData, fullName: e.target.value })
                    }
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={waitlistData.email}
                    onChange={(e) =>
                      setWaitlistData({ ...waitlistData, email: e.target.value })
                    }
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={joinWaitlist.isPending}
                  >
                    {joinWaitlist.isPending ? "Joining..." : "Join Waitlist"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowWaitlistForm(false)
                      setWaitlistData({ fullName: "", email: "" })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>
            Essentials Studio - AI-powered workout plans and progress tracking
          </p>
        </div>
      </div>
    </div>
  )
}
