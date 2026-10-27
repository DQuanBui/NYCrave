"use client"

import { ArrowRight, Route } from "lucide-react"
import { useTranslations } from "next-intl"
import { useHydrated } from "@/hooks/use-now"
import { useSavedDays } from "@/hooks/use-saved"
import { Link } from "@/i18n/navigation"

const SHOW = 3

/** On the home page: the days saved from My Day, most recent first, one tap away. */
export function SavedDaysStrip() {
  const t = useTranslations()
  const hydrated = useHydrated()
  const { days } = useSavedDays()
  if (!hydrated || days.length === 0) return null
  const recent = [...days].sort((a, b) => b.savedAt - a.savedAt).slice(0, SHOW)

  return (
    <section aria-labelledby="saved-days-home" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="saved-days-home" className="font-display text-display-sm sm:text-display-md">
          {t("planner.savedDays")}
        </h2>
        <Link href="/saved" className="text-sm font-bold underline underline-offset-4">
          {t("home.seeAll")}
        </Link>
      </div>
      <ul className="grid gap-2.5 sm:grid-cols-3">
        {recent.map((day) => (
          <li key={day.url}>
            {/* Saved paths already carry the locale prefix, so a plain anchor is correct here */}
            <a
              href={day.url}
              className="group flex h-full items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:border-foreground"
            >
              <span
                aria-hidden
                className="grid size-10 shrink-0 place-items-center rounded-full bg-taxi text-taxi-foreground"
              >
                <Route className="size-5" />
              </span>
              <span className="min-w-0 flex-1 truncate font-bold">{day.label}</span>
              <ArrowRight
                aria-hidden
                className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
