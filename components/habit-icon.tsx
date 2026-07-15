import {
  Apple,
  BookOpen,
  Brain,
  Droplet,
  Dumbbell,
  Footprints,
  Heart,
  Moon,
  PenLine,
  Sun,
  type LucideIcon,
} from "lucide-react"

const ICON_MAP: Record<string, LucideIcon> = {
  droplet: Droplet,
  "book-open": BookOpen,
  dumbbell: Dumbbell,
  moon: Moon,
  brain: Brain,
  run: Footprints,
  apple: Apple,
  "pen-line": PenLine,
  sun: Sun,
  heart: Heart,
}

export function HabitIcon({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const Icon = ICON_MAP[name] ?? Droplet
  return <Icon className={className} aria-hidden="true" />
}
