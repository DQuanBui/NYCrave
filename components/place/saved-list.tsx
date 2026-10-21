"use client"

import { Clock, Heart, Route } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { EmptyState } from "@/components/brand/empty-state"
import { inKind, KindTabs, type KindTab } from "@/components/place/kind-tabs"
import { PlaceCardSkeleton } from "@/components/place/place-card-skeleton"
import { LazyMap } from "@/components/map/lazy-map"
import { PlaceGrid } from "@/components/place/place-grid"
import { ShareButton } from "@/components/place/share-button"
import { Button } from "@/components/ui/button"
import { useHydrated, useNow } from "@/hooks/use-now"
import { useSaved } from "@/hooks/use-saved"
import { Link } from "@/i18n/navigation"
import type { CardPlace } from "@/lib/card-place"
import { getOpenStatus, isOpen } from "@/lib/hours"
import { placeToPoint } from "@/lib/map-points"
import { planSavedQuery } from "@/lib/planner/around"
import { MAX_SHARED } from "@/lib/shared-list"
import { cn } from "@/lib/utils"

/** A link that opens this list on anyone's device, ready to save. */
function shareListUrl(slugs: string[]) {
  const url = new URL("/saved", window.location.origin)
  url.searchParams.set("list", slugs.slice(0, MAX_SHARED).join(","))
  return url.toString()
}

export function SavedList({ places }: { places: CardPlace[] }) {
  const t = useTranslations("saved")
  const hydrated = useHydrated()
  const { slugs } = useSaved()
  const now = useNow()
  const [tab, setTab] = useState<KindTab>("all")
  const [openOnly, setOpenOnly] = useState(false)

  if (!hydrated) {
    return (
      <div aria-busy className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 3 }, (_, i) => (
          <PlaceCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Keep the order the user saved them in (newest first)
  const saved = slugs
    .map((slug) => places.find((p) => p.slug === slug))
    .filter((p): p is CardPlace => p !== undefined)

  const plan = planSavedQuery(saved)
  const shown = inKind(saved, tab).filter(
    (p) => !openOnly || !now || isOpen(getOpenStatus(p.hours, now)),
  )

  if (saved.length === 0) {
    return (
      <EmptyState
        line="red"
        bullet={<Heart aria-hidden className="size-6" />}
        title={t("emptyTitle")}
        body={t("emptyBody")}
        action={
          <Button asChild size="lg" className="rounded-full">
            <Link href="/eat">{t("emptyCta")}</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-muted-foreground" aria-live="polite">
          {t("count", { count: saved.length })}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={{ pathname: "/my-day", query: plan.query }}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-taxi px-4 text-sm font-bold text-taxi-foreground"
          >
            <Route aria-hidden className="size-4" />
            {t("planDay", { count: plan.pinned.length })}
          </Link>
          <ShareButton
            title={t("shareTitle")}
            url={shareListUrl(saved.map((p) => p.slug))}
            label={t("shareList")}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-pressed={openOnly}
          onClick={() => setOpenOnly((v) => !v)}
          className={cn(
            "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border-2 px-4 text-sm font-semibold transition-colors",
            openOnly
              ? "border-foreground bg-foreground text-background"
              : "border-foreground/15 bg-card hover:border-foreground",
          )}
        >
          <Clock aria-hidden className="size-4" />
          {t("openNow")}
        </button>
        <KindTabs places={saved} value={tab} onChange={setTab} label={t("byKind")} />
      </div>
      {shown.length === 0 ? (
        <p aria-live="polite" className="rounded-2xl border bg-card p-6 text-muted-foreground">
          {t("noneOpen")}
        </p>
      ) : (
        <PlaceGrid places={shown} />
      )}
      <LazyMap
        points={(shown.length ? shown : saved).map((p) => placeToPoint(p))}
        ariaLabel={t("mapLabel")}
        className="h-72 sm:h-96"
      />
    </div>
  )
}
