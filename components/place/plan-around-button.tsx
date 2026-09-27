"use client"

import { Route } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { planAroundQuery } from "@/lib/planner/around"
import type { Place } from "@/types/place"

/** Builds today's date on the device (pages are static), then opens a planned day. */
export function PlanAroundButton({ place }: { place: Place }) {
  const t = useTranslations("place")
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => router.push({ pathname: "/my-day", query: planAroundQuery(place) })}
      className="inline-flex h-10 items-center gap-2 rounded-full bg-taxi px-4 text-sm font-bold text-taxi-foreground"
    >
      <Route aria-hidden className="size-4" />
      {t("planAround")}
    </button>
  )
}
