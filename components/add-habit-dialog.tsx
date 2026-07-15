"use client"

import { Dialog } from "@base-ui/react/dialog"
import { Plus, X } from "lucide-react"
import { useState } from "react"
import { HabitIcon } from "@/components/habit-icon"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { HABIT_ICONS } from "@/lib/habits"

type AddHabitDialogProps = {
  onAdd: (name: string, icon: string) => void
}

export function AddHabitDialog({ onAdd }: AddHabitDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [icon, setIcon] = useState<string>(HABIT_ICONS[0])

  function reset() {
    setName("")
    setIcon(HABIT_ICONS[0])
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd(trimmed, icon)
    reset()
    setOpen(false)
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <Dialog.Trigger
        render={
          <Button size="lg" data-icon="inline-start">
            <Plus />
            New habit
          </Button>
        }
      />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2",
            "rounded-2xl border border-border bg-card p-5 shadow-xl outline-none",
            "transition-all data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
          )}
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              <Dialog.Title className="text-lg font-semibold text-foreground">
                Create a habit
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-sm text-muted-foreground">
                Give it a name and pick an icon to track daily.
              </Dialog.Description>
            </div>
            <Dialog.Close
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Close">
                  <X />
                </Button>
              }
            />
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="habit-name" className="text-sm font-medium text-foreground">
                Habit name
              </label>
              <input
                id="habit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Morning run"
                autoFocus
                className="h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">Icon</span>
              <div className="grid grid-cols-5 gap-2">
                {HABIT_ICONS.map((option) => {
                  const active = option === icon
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setIcon(option)}
                      aria-pressed={active}
                      aria-label={`Select ${option} icon`}
                      className={cn(
                        "flex aspect-square items-center justify-center rounded-xl border transition-colors",
                        active
                          ? "border-brand bg-brand/15 text-accent-foreground"
                          : "border-border bg-background text-muted-foreground hover:bg-secondary",
                      )}
                    >
                      <HabitIcon name={option} className="size-5" />
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-1 flex justify-end gap-2">
              <Dialog.Close
                render={
                  <Button type="button" variant="outline" size="lg">
                    Cancel
                  </Button>
                }
              />
              <Button type="submit" size="lg" disabled={!name.trim()}>
                Add habit
              </Button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
