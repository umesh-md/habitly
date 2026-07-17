'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { useState } from 'react'

export function GuestBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-brand-muted border-b border-brand/20 px-4 py-3 sm:px-6">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground">
            You are tracking habits locally.{' '}
            <Link href="/auth/sign-up" className="font-semibold text-brand hover:underline">
              Sign up
            </Link>
            {' '}or{' '}
            <Link href="/auth/login" className="font-semibold text-brand hover:underline">
              log in
            </Link>
            {' '}to sync your progress across devices!
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
