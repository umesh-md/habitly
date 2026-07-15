"use client"

import { Check, Flame, Trash2 } from "lucide-react"
import { HabitIcon } from "@/components/habit-icon"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { currentStreak, type Habit } from "@/lib/habits"

type HabitRowProps = {
  habit: Habit
  completed: boolean
  onToggle: () => void
  onDelete: () => void
}

export function HabitRow({ habit, completed, onToggle, onDelete }: HabitRowProps) {
  const streak = currentStreak(habit)

  return (
    <li
      className={cn(
        "group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors sm:gap-4 sm:p-4",
        completed && "border-brand/30 bg-brand-muted/40",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={completed}
        aria-label={completed ? `Mark ${habit.name} incomplete` : `Mark ${habit.name} complete`}
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full border-2 transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95",
          completed
            ? "border-brand bg-brand text-brand-foreground"
            : "border-border bg-background text-transparent hover:border-brand/60",
        )}
      >
        <Check className="size-5" strokeWidth={3} />
      </button>

      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground",
          completed && "bg-brand/15 text-accent-foreground",
        )}
      >
        <HabitIcon name={habit.icon} className="size-5" />
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-medium text-foreground sm:text-base",
            completed && "text-muted-foreground line-through",
          )}
        >
          {habit.name}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <Flame
            className={cn("size-3.5", streak > 0 ? "text-brand" : "text-muted-foreground")}
            aria-hidden="true"
          />
          {streak > 0 ? `${streak} day streak` : "No streak yet"}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Delete ${habit.name}`}
        onClick={onDelete}
        className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
      >
        <Trash2 />
      </Button>
    </li>
  )
}
