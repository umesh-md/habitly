'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signUpWithEmail, syncGuestHabitsToDatabase } from '@/lib/actions/auth'
import { loadGuestHabits, clearGuestHabits } from '@/lib/auth-storage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const result = await signUpWithEmail(email, password)
      if ('error' in result && result.error) {
        setError(result.error)
      } else {
        // Sync guest habits if any exist
        const guestHabits = loadGuestHabits()
        if (guestHabits.length > 0) {
          setSyncing(true)
          const syncResult = await syncGuestHabitsToDatabase(guestHabits)
          if ('error' in syncResult && syncResult.error) {
            console.warn('Failed to sync guest habits:', syncResult.error)
          } else {
            clearGuestHabits()
          }
          setSyncing(false)
        }

        // Show confirmation message
        router.push('/auth/sign-up-success')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Create Account</h1>
          <p className="text-muted-foreground mt-2">Join Cadence and sync your habits</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-6 sm:p-8">
          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || syncing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || syncing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Confirm Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading || syncing}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-brand hover:bg-brand/90"
              disabled={loading || syncing}
            >
              {syncing ? 'Syncing your habits...' : loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-brand hover:underline font-medium">
              Sign in
            </Link>
          </p>

          {/* Try as Guest */}
          <div className="mt-4 pt-4 border-t border-border">
            <Link href="/">
              <Button variant="outline" className="w-full">
                Try as Guest
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
