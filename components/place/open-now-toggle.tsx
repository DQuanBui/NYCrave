"use client"

import { Clock } from "lucide-react"
import { getOpenStatus, isOpen } from "@/lib/hours"
import { cn } from "@/lib/utils"
import type { WeeklyHours } from "@/types/place"

/** The pressed-pill switch used to show only places open right now. */
export function OpenNowToggle({
  pressed,
  onToggle,
  label,
  className,
}: {
  pressed: boolean
  onToggle: () => void
  label: string
  className?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onToggle}
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border-2 px-4 text-sm font-semibold transition-colors",
        pressed
          ? "border-foreground bg-foreground text-background"
          : "border-foreground/15 bg-card hover:border-foreground",
        className,
      )}
    >
      <Clock aria-hidden className="size-4" />
      {label}
    </button>
  )
}

/** Keeps only places open at `now` when `on`; before the clock is known, keeps all. */
export function keepOpen<P extends { hours: WeeklyHours }>(
  places: P[],
  on: boolean,
  now: Date | null,
): P[] {
  if (!on || !now) return places
  return places.filter((p) => isOpen(getOpenStatus(p.hours, now)))
}
