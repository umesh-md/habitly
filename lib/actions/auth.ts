'use server'

import { createClient } from '@/lib/supabase/server'
import { type Habit } from '@/lib/habits'

export async function signUpWithEmail(email: string, password: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (error) {
      console.error('Database/Supabase Error:', error)
      return { error: error.message }
    }

    return { data, success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Database/Supabase Error:', error)
    return { error: message }
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Database/Supabase Error:', error)
      return { error: error.message }
    }

    return { data, success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Database/Supabase Error:', error)
    return { error: message }
  }
}

export async function signInWithMagicLink(email: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (error) {
      console.error('Database/Supabase Error:', error)
      return { error: error.message }
    }

    return { data, success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Database/Supabase Error:', error)
    return { error: message }
  }
}

export async function signOut() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Database/Supabase Error:', error)
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Database/Supabase Error:', error)
    return { error: message }
  }
}

export async function getCurrentUser() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('Database/Supabase Error:', error)
      return { error: error.message }
    }

    return { user, success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Database/Supabase Error:', error)
    return { error: message }
  }
}

export async function syncGuestHabitsToDatabase(guestHabits: Habit[]) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      const err = 'User not authenticated'
      console.error('Database/Supabase Error:', err)
      return { error: err }
    }

    if (guestHabits.length === 0) {
      return { success: true, synced: 0 }
    }

    // Insert guest habits into database
    const habitsToSync = guestHabits.map((h) => ({
      user_id: user.id,
      name: h.name,
      frequency: 'daily',
    }))

    const { data, error } = await supabase
      .from('habits')
      .insert(habitsToSync)
      .select()

    if (error) {
      console.error('Database/Supabase Error:', error)
      return { error: error.message }
    }

    return { success: true, synced: data?.length || 0 }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Database/Supabase Error:', error)
    return { error: message }
  }
}
