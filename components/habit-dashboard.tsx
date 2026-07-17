"use client"

import { CheckCircle2, Flame, TrendingUp } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { AddHabitDialog } from "@/components/add-habit-dialog"
import { ErrorAlert } from "@/components/error-alert"
import { GuestBanner } from "@/components/guest-banner"
import { HabitRow } from "@/components/habit-row"
import { ProgressRing } from "@/components/progress-ring"
import { WeeklyCalendar } from "@/components/weekly-calendar"
import {
  dateKey,
  isSameDay,
  type Habit,
} from "@/lib/habits"
import {
  getHabits,
  getAllHabitLogs,
  createHabit,
  deleteHabit,
  logHabitCompletion,
} from "@/lib/actions/habits"
import {
  loadGuestHabits,
  saveGuestHabits,
} from "@/lib/auth-storage"

export function HabitDashboard() {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [habits, setHabits] = useState<Habit[]>([])
  const [selected, setSelected] = useState<Date>(today)
  const [weekRef, setWeekRef] = useState<Date>(today)
  const [timeOfDay, setTimeOfDay] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isGuest, setIsGuest] = useState(false)

  // Load initial habits
  useEffect(() => {
    loadHabits()
    setTimeOfDay(greeting())
  }, [])

  // Save guest habits to localStorage
  useEffect(() => {
    if (isGuest && habits.length > 0) {
      saveGuestHabits(habits)
    }
  }, [habits, isGuest])

  async function loadHabits() {
    try {
      setLoading(true)
      setError(null)
      
      const habitsResult = await getHabits()
      if ('error' in habitsResult && habitsResult.error) {
        setError(habitsResult.error)
        setHabits([])
        return
      }

      const isGuestMode = habitsResult.isGuest
      setIsGuest(isGuestMode)
      
      if (isGuestMode) {
        // Load habits from localStorage for guests
        const guestHabits = loadGuestHabits()
        setHabits(guestHabits)
        return
      }
      
      const dbHabits = habitsResult.data || []
      
      // Get the last 30 days of logs
      const thirtyDaysAgo = new Date(today)
      thirtyDaysAgo.setDate(today.getDate() - 30)
      const logsResult = await getAllHabitLogs(thirtyDaysAgo, today)
      
      if ('error' in logsResult && logsResult.error) {
        setError(logsResult.error)
        setHabits([])
        return
      }
      
      const logs = logsResult.data || []
      
      // Map Supabase habits to app format
      const habitsWithLogs: Habit[] = dbHabits.map((h: any) => {
        const completed = logs
          .filter((log: any) => log.habit_id === h.id)
          .map((log: any) => log.completed_date)
        
        return {
          id: h.id,
          name: h.name,
          icon: "💪",
          completed,
          createdAt: h.created_at,
        }
      })
      
      setHabits(habitsWithLogs)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error("[v0] Error loading habits:", error)
      setError(message)
      setHabits([])
    } finally {
      setLoading(false)
    }
  }

  const selectedIsToday = isSameDay(selected, today)
  
  const doneCount = habits.filter((h) => {
    const key = dateKey(selected)
    return h.completed.includes(key)
  }).length

  const rate = habits.length > 0 ? Math.round((doneCount / habits.length) * 100) : 0

  const bestStreak = useMemo(() => {
    return habits.reduce((max, h) => {
      let streak = 0
      let checkDate = new Date(today)
      
      while (streak < 365) {
        const key = dateKey(checkDate)
        if (!h.completed.includes(key)) break
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      }
      
      return Math.max(max, streak)
    }, 0)
  }, [habits, today])

  async function toggleHabit(id: string) {
    try {
      if (isGuest) {
        // Guest mode: update locally
        setHabits((prev) => {
          return prev.map((h) => {
            if (h.id !== id) return h
            const key = dateKey(selected)
            const isCompleted = h.completed.includes(key)
            return {
              ...h,
              completed: isCompleted
                ? h.completed.filter((k) => k !== key)
                : [...h.completed, key],
            }
          })
        })
      } else {
        // Database mode: sync with server
        const result = await logHabitCompletion(id, selected)
        if ('error' in result && result.error) {
          setError(result.error)
          return
        }
        if ('isGuest' in result && result.isGuest) {
          setIsGuest(true)
          toggleHabit(id)
          return
        }
        await loadHabits()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error("[v0] Error toggling habit:", error)
      setError(message)
    }
  }

  async function addHabit(name: string) {
    try {
      if (isGuest) {
        // Guest mode: add locally
        const newHabit: Habit = {
          id: `h${Date.now()}`,
          name,
          icon: "💪",
          completed: [],
          createdAt: dateKey(today),
        }
        setHabits((prev) => [newHabit, ...prev])
      } else {
        // Database mode: sync with server
        const result = await createHabit(name, "daily")
        if ('error' in result && result.error) {
          setError(result.error)
          return
        }
        if ('isGuest' in result && result.isGuest) {
          setIsGuest(true)
          addHabit(name)
          return
        }
        await loadHabits()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error("[v0] Error adding habit:", error)
      setError(message)
    }
  }

  async function deleteHabitFn(id: string) {
    try {
      if (isGuest) {
        // Guest mode: delete locally
        setHabits((prev) => prev.filter((h) => h.id !== id))
      } else {
        // Database mode: sync with server
        const result = await deleteHabit(id)
        if ('error' in result && result.error) {
          setError(result.error)
          return
        }
        if ('isGuest' in result && result.isGuest) {
          setIsGuest(true)
          deleteHabitFn(id)
          return
        }
        await loadHabits()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error("[v0] Error deleting habit:", error)
      setError(message)
    }
  }

  function shiftWeek(direction: -1 | 1) {
    setWeekRef((prev) => {
      const next = new Date(prev)
      next.setDate(prev.getDate() + direction * 7)
      return next
    })
  }

  const selectedLabel = selectedIsToday
    ? "Today"
    : selected.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })

  return (
    <>
      {isGuest && <GuestBanner />}
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
        {error && (
          <ErrorAlert
            error={error}
            onDismiss={() => setError(null)}
            title="Error"
          />
        )}

        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-brand">Cadence</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground text-balance sm:text-3xl">
              {timeOfDay ? `Good ${timeOfDay}, ` : ""}let&apos;s build momentum
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {today.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <AddHabitDialog onAdd={addHabit} />
        </header>

        <WeeklyCalendar
          reference={weekRef}
          selected={selected}
          today={today}
          habits={habits}
          onSelect={setSelected}
          onShiftWeek={shiftWeek}
        />

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <section aria-label="Habits" className="order-2 flex flex-col gap-3 lg:order-1">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                {selectedLabel}&apos;s habits
              </h2>
              <span className="text-xs text-muted-foreground">
                {doneCount} of {habits.length} done
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card py-14">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-transparent border-t-brand" />
                <p className="text-sm text-muted-foreground">Loading habits...</p>
              </div>
            ) : habits.length > 0 ? (
              <ul className="flex flex-col gap-2.5">
                {habits.map((habit) => {
                  const key = dateKey(selected)
                  const completed = habit.completed.includes(key)
                  return (
                    <HabitRow
                      key={habit.id}
                      habit={habit}
                      completed={completed}
                      onToggle={() => toggleHabit(habit.id)}
                      onDelete={() => deleteHabitFn(habit.id)}
                    />
                  )
                })}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card py-14 text-center">
                <p className="text-sm font-medium text-foreground">No habits yet</p>
                <p className="max-w-xs text-sm text-muted-foreground">
                  Add your first habit to start tracking your daily progress.
                </p>
              </div>
            )}
          </section>

          <aside className="order-1 flex flex-col gap-4 lg:order-2">
            <section
              aria-label="Completion progress"
              className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6"
            >
              <ProgressRing value={rate} label={selectedIsToday ? "Today" : selectedLabel} />
              <p className="text-center text-sm text-muted-foreground text-pretty">
                {rate === 100 && habits.length > 0
                  ? "Every habit complete. Incredible work!"
                  : `${doneCount} of ${habits.length} habits complete${selectedIsToday ? " today" : ""}.`}
              </p>
            </section>

            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={<Flame className="size-4 text-brand" />}
                label="Best streak"
                value={`${bestStreak}`}
                unit="days"
              />
              <StatCard
                icon={<CheckCircle2 className="size-4 text-brand" />}
                label="Done today"
                value={`${habits.filter((h) => h.completed.includes(dateKey(today))).length}`}
                unit={`/ ${habits.length}`}
              />
              <StatCard
                icon={<TrendingUp className="size-4 text-brand" />}
                label="Active habits"
                value={`${habits.length}`}
                unit="tracked"
              />
              <StatCard
                icon={<CheckCircle2 className="size-4 text-brand" />}
                label="Today's rate"
                value={`${habits.length > 0 ? Math.round((habits.filter((h) => h.completed.includes(dateKey(today))).length / habits.length) * 100) : 0}`}
                unit="%"
              />
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}

function StatCard({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode
  label: string
  value: string
  unit: string
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="font-mono text-2xl font-semibold tabular-nums text-foreground">
        {value}
        <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>
      </p>
    </div>
  )
}

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "morning"
  if (hour < 18) return "afternoon"
  return "evening"
}
