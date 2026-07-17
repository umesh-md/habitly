import { type Habit } from './habits'

const STORAGE_KEY = 'cadence_guest_habits'

export function saveGuestHabits(habits: Habit[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits))
  } catch (error) {
    console.error('Failed to save guest habits:', error)
  }
}

export function loadGuestHabits(): Habit[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to load guest habits:', error)
    return []
  }
}

export function clearGuestHabits(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear guest habits:', error)
  }
}
