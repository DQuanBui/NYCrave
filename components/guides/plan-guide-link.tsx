"use client"

import { Route } from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import { useNow } from "@/hooks/use-now"
import { Link } from "@/i18n/navigation"
import type { CardPlace } from "@/lib/card-place"
import { planNearbyQuery } from "@/lib/planner/around"

/**
 * "Plan a day with 4 of these": a My Day link pinning a guide's places that
 * sit close together. Built in the browser so the plan is for today, even
 * on a page cached since yesterday.
 */
export function PlanGuideLink({ places }: { places: CardPlace[] }) {
  const t = useTranslations("planner")
  const now = useNow()
  const plan = useMemo(() => (now ? planNearbyQuery(places, now) : null), [places, now])
  if (!plan || plan.pinned.length < 2) return null
  return (
    <Link
      href={{ pathname: "/my-day", query: plan.query }}
      className="inline-flex items-center gap-2 rounded-full bg-taxi px-4 py-2 text-sm font-bold text-taxi-foreground"
    >
      <Route aria-hidden className="size-4" />
      {t("fromGuide", { count: plan.pinned.length })}
    </Link>
  )
}
