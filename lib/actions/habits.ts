'use server'

import { createClient } from '@/lib/supabase/server'

export async function getHabits() {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: [], isGuest: true }
    }

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: data || [], isGuest: false }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Database/Supabase Error:', error)
    return { error: message }
  }
}

export async function createHabit(name: string, frequency: string = 'daily') {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { isGuest: true }
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
    return { data: data?.[0], isGuest: false }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Database/Supabase Error:', error)
    return { error: message }
  }
}

export async function deleteHabit(habitId: string) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { isGuest: true }
    }

    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId)
      .eq('user_id', user.id)

    if (error) throw error
    return { success: true, isGuest: false }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Database/Supabase Error:', error)
    return { error: message }
  }
}

export async function getHabitLogs(habitId: string, startDate: Date, endDate: Date) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: [], isGuest: true }
    }

    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('habit_id', habitId)
      .eq('user_id', user.id)
      .gte('completed_date', startDate.toISOString().split('T')[0])
      .lte('completed_date', endDate.toISOString().split('T')[0])

    if (error) throw error
    return { data: data || [], isGuest: false }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Database/Supabase Error:', error)
    return { error: message }
  }
}

export async function logHabitCompletion(habitId: string, date: Date) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { isGuest: true }
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
      return { completed: false, isGuest: false }
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
    return { completed: true, isGuest: false }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Database/Supabase Error:', error)
    return { error: message }
  }
}

export async function getAllHabitLogs(startDate: Date, endDate: Date) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: [], isGuest: true }
    }

    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('completed_date', startDate.toISOString().split('T')[0])
      .lte('completed_date', endDate.toISOString().split('T')[0])

    if (error) throw error
    return { data: data || [], isGuest: false }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Database/Supabase Error:', error)
    return { error: message }
  }
}
