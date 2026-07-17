'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

export default function SignUpSuccessPage() {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval)
          return 0
        }
        return c - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl shadow-sm border border-border p-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-brand-muted rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-brand" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">Account Created!</h1>
            <p className="text-muted-foreground mt-2">
              Check your email to confirm your account and start syncing your habits across devices.
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-foreground font-medium">
              Redirecting in {countdown}s...
            </p>
          </div>

          <Link href="/">
            <Button className="w-full bg-brand hover:bg-brand/90">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
