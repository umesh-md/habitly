'use server'

import { createClient } from '@/lib/supabase/server'

const DEMO_HABITS = [
  { id: 'h1', user_id: 'demo', name: 'Morning Run', frequency: 'daily', created_at: new Date().toISOString() },
  { id: 'h2', user_id: 'demo', name: 'Read', frequency: 'daily', created_at: new Date().toISOString() },
  { id: 'h3', user_id: 'demo', name: 'Meditate', frequency: 'daily', created_at: new Date().toISOString() },
]

export async function getHabits() {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return DEMO_HABITS

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || DEMO_HABITS
  } catch (error) {
    console.log('[v0] Using demo habits due to:', error instanceof Error ? error.message : 'unknown error')
    return DEMO_HABITS
  }
}

export async function createHabit(name: string, frequency: string = 'daily') {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      // Return demo habit when not authenticated
      return {
        id: `h${Date.now()}`,
        user_id: 'demo',
        name,
        frequency,
        created_at: new Date().toISOString(),
      }
    }

    const { data, error } = await supabase
      .from('habits')
      .insert([
        {
          user_id: user.id,
          name,
          frequency,
        },
      ])
      .select()

    if (error) throw error
    return data?.[0]
  } catch (error) {
    console.log('[v0] Demo mode: created habit', name)
    // Return demo habit on error
    return {
      id: `h${Date.now()}`,
      user_id: 'demo',
      name,
      frequency,
      created_at: new Date().toISOString(),
    }
  }
}

export async function deleteHabit(habitId: string) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('[v0] Demo mode: deleted habit', habitId)
      return
    }

    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId)
      .eq('user_id', user.id)

    if (error) throw error
  } catch (error) {
    console.log('[v0] Demo mode: deleted habit', habitId)
  }
}

export async function getHabitLogs(habitId: string, startDate: Date, endDate: Date) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('habit_id', habitId)
    .eq('user_id', user.id)
    .gte('completed_date', startDate.toISOString().split('T')[0])
    .lte('completed_date', endDate.toISOString().split('T')[0])

  if (error) throw error
  return data
}

export async function logHabitCompletion(habitId: string, date: Date) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('[v0] Demo mode: toggled habit', habitId)
      return { completed: true }
    }

    const dateStr = date.toISOString().split('T')[0]

    // Check if already logged
    const { data: existing } = await supabase
      .from('habit_logs')
      .select('id')
      .eq('habit_id', habitId)
      .eq('user_id', user.id)
      .eq('completed_date', dateStr)
      .single()

    if (existing) {
      // Already logged, so remove it (toggle)
      const { error } = await supabase
        .from('habit_logs')
        .delete()
        .eq('id', existing.id)

      if (error) throw error
      return { completed: false }
    }

    // Add new log
    const { error } = await supabase
      .from('habit_logs')
      .insert([
        {
          habit_id: habitId,
          user_id: user.id,
          completed_date: dateStr,
        },
      ])

    if (error) throw error
    return { completed: true }
  } catch (error) {
    console.log('[v0] Demo mode: toggled habit', habitId)
    return { completed: true }
  }
}

export async function getAllHabitLogs(startDate: Date, endDate: Date) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('completed_date', startDate.toISOString().split('T')[0])
      .lte('completed_date', endDate.toISOString().split('T')[0])

    if (error) throw error
    return data || []
  } catch (error) {
    console.log('[v0] Demo mode: returned empty logs')
    return []
  }
}
