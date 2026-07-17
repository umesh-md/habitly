'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getCurrentUser, signOut } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { LogOut, User, LogIn } from 'lucide-react'

export function UserProfileButton() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const result = await getCurrentUser()
      if ('user' in result && result.user) {
        setUser(result.user)
      }
    } catch (error) {
      console.error('Failed to get user:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    try {
      const result = await signOut()
      if (!('error' in result) || !result.error) {
        setUser(null)
        setOpen(false)
        router.push('/')
      }
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  if (loading) {
    return <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
  }

  if (!user) {
    return (
      <Link href="/auth/login">
        <Button variant="outline" size="sm" className="gap-2">
          <LogIn className="w-4 h-4" />
          Sign In
        </Button>
      </Link>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-brand text-brand-foreground flex items-center justify-center font-semibold text-sm hover:bg-brand/90 transition-colors"
      >
        {user.email?.[0]?.toUpperCase() || 'U'}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-48 bg-card rounded-lg shadow-lg border border-border overflow-hidden z-50">
          <div className="p-4 border-b border-border">
            <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
            <p className="text-xs text-muted-foreground">Signed in</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-muted flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
