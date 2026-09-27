"use client"

import { Route, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useHydrated } from "@/hooks/use-now"
import { useSavedDays } from "@/hooks/use-saved"

export function SavedDays() {
  const t = useTranslations("planner")
  const hydrated = useHydrated()
  const { days, remove } = useSavedDays()
  if (!hydrated || days.length === 0) return null

  return (
    <section aria-labelledby="saved-days" className="space-y-4">
      <h2 id="saved-days" className="font-display text-display-md">
        {t("savedDays")}
      </h2>
      <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {days.map((day) => (
          <li key={day.url} className="flex items-center gap-3 rounded-xl border bg-card p-3">
            <span
              aria-hidden
              className="grid size-10 shrink-0 place-items-center rounded-full bg-taxi text-taxi-foreground"
            >
              <Route className="size-5" />
            </span>
            {/* Saved paths already carry the locale prefix, so a plain anchor is correct here */}
            <a href={day.url} className="min-w-0 flex-1 truncate font-bold hover:underline">
              {day.label}
            </a>
            <button
              type="button"
              onClick={() => remove(day.url)}
              aria-label={t("remove", { label: day.label })}
              className="grid size-8 shrink-0 place-items-center rounded-full hover:bg-accent"
            >
              <X aria-hidden className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
