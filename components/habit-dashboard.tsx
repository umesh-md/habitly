"use client"

import { CheckCircle2, Flame, TrendingUp } from "lucide-react"
import { useMemo, useState } from "react"
import { AddHabitDialog } from "@/components/add-habit-dialog"
import { HabitRow } from "@/components/habit-row"
import { ProgressRing } from "@/components/progress-ring"
import { WeeklyCalendar } from "@/components/weekly-calendar"
import {
  completionRate,
  createInitialHabits,
  currentStreak,
  dateKey,
  isCompleted,
  isSameDay,
  type Habit,
} from "@/lib/habits"

export function HabitDashboard() {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [habits, setHabits] = useState<Habit[]>(() => createInitialHabits())
  const [selected, setSelected] = useState<Date>(today)
  const [weekRef, setWeekRef] = useState<Date>(today)

  const selectedIsToday = isSameDay(selected, today)
  const rate = completionRate(habits, selected)
  const doneCount = habits.filter((h) => isCompleted(h, selected)).length

  const bestStreak = useMemo(
    () => habits.reduce((max, h) => Math.max(max, currentStreak(h, today)), 0),
    [habits, today],
  )

  function toggleHabit(id: string) {
    const key = dateKey(selected)
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h
        const has = h.completed.includes(key)
        return {
          ...h,
          completed: has ? h.completed.filter((d) => d !== key) : [...h.completed, key],
        }
      }),
    )
  }

  function addHabit(name: string, icon: string) {
    setHabits((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name,
        icon,
        completed: [],
        createdAt: dateKey(today),
      },
    ])
  }

  function deleteHabit(id: string) {
    setHabits((prev) => prev.filter((h) => h.id !== id))
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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-brand">Cadence</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground text-balance sm:text-3xl">
            Good {greeting()}, let&apos;s build momentum
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

          {habits.length > 0 ? (
            <ul className="flex flex-col gap-2.5">
              {habits.map((habit) => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  completed={isCompleted(habit, selected)}
                  onToggle={() => toggleHabit(habit.id)}
                  onDelete={() => deleteHabit(habit.id)}
                />
              ))}
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
              value={`${completionRate(habits, today) === 0 ? 0 : habits.filter((h) => isCompleted(h, today)).length}`}
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
              value={`${completionRate(habits, today)}`}
              unit="%"
            />
          </div>
        </aside>
      </div>
    </div>
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
