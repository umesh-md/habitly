'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signInWithEmail, signInWithMagicLink } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LogIn, Mail } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'password' | 'magic'>('password')
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await signInWithEmail(email, password)
      if ('error' in result && result.error) {
        setError(result.error)
      } else {
        router.push('/')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await signInWithMagicLink(email)
      if ('error' in result && result.error) {
        setError(result.error)
      } else {
        setMagicLinkSent(true)
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
          <h1 className="text-3xl font-bold text-foreground">Cadence</h1>
          <p className="text-muted-foreground mt-2">Build better routines</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-6 sm:p-8">
          {magicLinkSent && tab === 'magic' ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto bg-brand-muted rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-brand" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Check your email</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  We sent a magic link to <span className="font-medium">{email}</span>
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setMagicLinkSent(false)
                  setEmail('')
                }}
                className="w-full"
              >
                Try another email
              </Button>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-2 mb-6 bg-muted p-1 rounded-lg">
                <button
                  onClick={() => setTab('password')}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    tab === 'password'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Email & Password
                </button>
                <button
                  onClick={() => setTab('magic')}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    tab === 'magic'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Magic Link
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Forms */}
              {tab === 'password' ? (
                <form onSubmit={handlePasswordSignIn} className="space-y-4">
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
                      disabled={loading}
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
                      disabled={loading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-brand hover:bg-brand/90"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleMagicLink} className="space-y-4">
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
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    We&apos;ll send you a magic link to sign in instantly, no password needed.
                  </p>
                  <Button
                    type="submit"
                    className="w-full bg-brand hover:bg-brand/90"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Magic Link'}
                  </Button>
                </form>
              )}

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-card text-muted-foreground">or</span>
                </div>
              </div>

              {/* Sign Up Link */}
              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/auth/sign-up" className="text-brand hover:underline font-medium">
                  Sign up
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}
