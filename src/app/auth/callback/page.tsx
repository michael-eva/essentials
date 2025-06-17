'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { use } from 'react'

type PageProps = {
  params: Promise<Record<string, string | string[] | undefined>>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default function Page({ params, searchParams }: PageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const resolvedSearchParams = use(searchParams)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession()
      if (error) {
        console.error('Auth error:', error)
        router.push('/auth/sign-in')
        return
      }

      router.push('/dashboard')
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Completing sign in...</h2>
        <p className="text-sm text-gray-500">Please wait while we redirect you.</p>
      </div>
    </div>
  )
}
