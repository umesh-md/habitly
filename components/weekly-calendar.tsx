"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { completionRate, dateKey, isSameDay, weekDays, type Habit } from "@/lib/habits"

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"]

type WeeklyCalendarProps = {
  reference: Date
  selected: Date
  today: Date
  habits: Habit[]
  onSelect: (date: Date) => void
  onShiftWeek: (direction: -1 | 1) => void
}

export function WeeklyCalendar({
  reference,
  selected,
  today,
  habits,
  onSelect,
  onShiftWeek,
}: WeeklyCalendarProps) {
  const days = weekDays(reference)
  const monthLabel = reference.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  return (
    <section
      aria-label="Weekly calendar"
      className="rounded-2xl border border-border bg-card p-4 sm:p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{monthLabel}</h2>
          <p className="text-xs text-muted-foreground">Tap a day to review it</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Previous week"
            onClick={() => onShiftWeek(-1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Next week"
            onClick={() => onShiftWeek(1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((day, i) => {
          const active = isSameDay(day, selected)
          const isToday = isSameDay(day, today)
          const isFuture = day.getTime() > today.getTime()
          const rate = completionRate(habits, day)
          const complete = rate === 100 && habits.length > 0

          return (
            <button
              key={dateKey(day)}
              type="button"
              onClick={() => onSelect(day)}
              aria-pressed={active}
              aria-current={isToday ? "date" : undefined}
              className={cn(
                "group flex flex-col items-center gap-1.5 rounded-xl border py-2.5 transition-colors sm:py-3",
                active
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-secondary",
                isFuture && !active && "opacity-50",
              )}
            >
              <span
                className={cn(
                  "text-[0.7rem] font-medium uppercase",
                  active ? "text-primary-foreground/70" : "text-muted-foreground",
                )}
              >
                {DAY_LABELS[i]}
              </span>
              <span className="font-mono text-base font-semibold tabular-nums sm:text-lg">
                {day.getDate()}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  complete
                    ? active
                      ? "bg-primary-foreground"
                      : "bg-brand"
                    : rate > 0
                      ? active
                        ? "bg-primary-foreground/50"
                        : "bg-brand/40"
                      : active
                        ? "bg-primary-foreground/20"
                        : "bg-border",
                )}
              />
            </button>
          )
        })}
      </div>
    </section>
  )
}
