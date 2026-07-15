export type Habit = {
  id: string
  name: string
  icon: string
  /** ISO date strings (yyyy-mm-dd) the habit was completed on */
  completed: string[]
  createdAt: string
}

export const HABIT_ICONS = [
  "droplet",
  "book-open",
  "dumbbell",
  "moon",
  "brain",
  "run",
  "apple",
  "pen-line",
  "sun",
  "heart",
] as const

/** Return a yyyy-mm-dd key in local time. */
export function dateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function isSameDay(a: Date, b: Date): boolean {
  return dateKey(a) === dateKey(b)
}

/** The 7 days of the week (Mon–Sun) containing the given date. */
export function weekDays(reference: Date): Date[] {
  const ref = new Date(reference)
  ref.setHours(0, 0, 0, 0)
  const day = ref.getDay() // 0 = Sun
  const diffToMonday = (day + 6) % 7
  const monday = new Date(ref)
  monday.setDate(ref.getDate() - diffToMonday)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export function isCompleted(habit: Habit, date: Date): boolean {
  return habit.completed.includes(dateKey(date))
}

/** Current consecutive-day streak ending on `reference` (or the day before). */
export function currentStreak(habit: Habit, reference: Date = new Date()): number {
  const set = new Set(habit.completed)
  let streak = 0
  const cursor = new Date(reference)
  cursor.setHours(0, 0, 0, 0)

  // If today isn't done yet, start counting from yesterday so the streak
  // isn't broken mid-day.
  if (!set.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }

  while (set.has(dateKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function completionRate(habits: Habit[], date: Date): number {
  if (habits.length === 0) return 0
  const done = habits.filter((h) => isCompleted(h, date)).length
  return Math.round((done / habits.length) * 100)
}

function offsetKey(daysAgo: number): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - daysAgo)
  return dateKey(d)
}

export function createInitialHabits(): Habit[] {
  return [
    {
      id: "h1",
      name: "Drink 8 glasses of water",
      icon: "droplet",
      completed: [offsetKey(0), offsetKey(1), offsetKey(2), offsetKey(3), offsetKey(4)],
      createdAt: offsetKey(30),
    },
    {
      id: "h2",
      name: "Read for 30 minutes",
      icon: "book-open",
      completed: [offsetKey(1), offsetKey(2), offsetKey(3)],
      createdAt: offsetKey(30),
    },
    {
      id: "h3",
      name: "Morning workout",
      icon: "dumbbell",
      completed: [offsetKey(0), offsetKey(2), offsetKey(4), offsetKey(5)],
      createdAt: offsetKey(30),
    },
    {
      id: "h4",
      name: "Meditate",
      icon: "brain",
      completed: [offsetKey(2), offsetKey(3), offsetKey(6)],
      createdAt: offsetKey(30),
    },
    {
      id: "h5",
      name: "Sleep before 11pm",
      icon: "moon",
      completed: [],
      createdAt: offsetKey(2),
    },
  ]
}
