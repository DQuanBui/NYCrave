"use client"

import { useTranslations } from "next-intl"
import { useNow } from "@/hooks/use-now"
import { nycDateString } from "@/lib/hours"
import { cn } from "@/lib/utils"

const DAY_MS = 86_400_000
const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS)

/**
 * "In 3 days" or "Happening now" for a date window, counted from the visitor's
 * New York date so a page cached since yesterday still counts right.
 */
export function SeasonCountdown({
  start,
  end,
  fallback,
}: {
  start: string
  end: string
  /** What the server worked out, shown until the clock is known. */
  fallback: { happening: boolean; daysUntil: number }
}) {
  const t = useTranslations("home.comingUp")
  const now = useNow()
  const today = now ? nycDateString(now) : null
  if (today && today > end) return null
  const happening = today ? start <= today : fallback.happening
  const days = today ? Math.max(0, daysBetween(today, start)) : fallback.daysUntil
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-xs font-bold",
        happening ? "bg-taxi text-taxi-foreground" : "bg-muted",
      )}
    >
      {happening ? t("now") : t("countdown", { days })}
    </span>
  )
}
