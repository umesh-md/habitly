'use server'

import { createClient } from '@/lib/supabase/server'

export async function getHabits() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createHabit(name: string, frequency: string = 'daily') {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

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
}

export async function deleteHabit(habitId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', habitId)
    .eq('user_id', user.id)

  if (error) throw error
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
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

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
}

export async function getAllHabitLogs(startDate: Date, endDate: Date) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('completed_date', startDate.toISOString().split('T')[0])
    .lte('completed_date', endDate.toISOString().split('T')[0])

  if (error) throw error
  return data
}
