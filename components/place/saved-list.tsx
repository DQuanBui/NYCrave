"use client"

import { Heart } from "lucide-react"
import { useTranslations } from "next-intl"
import { EmptyState } from "@/components/brand/empty-state"
import { PlaceCardSkeleton } from "@/components/place/place-card-skeleton"
import { PlaceGrid } from "@/components/place/place-grid"
import { Button } from "@/components/ui/button"
import { useHydrated } from "@/hooks/use-now"
import { useSaved } from "@/hooks/use-saved"
import { Link } from "@/i18n/navigation"
import type { Place } from "@/types/place"

export function SavedList({ places }: { places: Place[] }) {
  const t = useTranslations("saved")
  const hydrated = useHydrated()
  const { slugs } = useSaved()

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
    .filter((p): p is Place => p !== undefined)

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
      <p className="text-sm font-semibold text-muted-foreground" aria-live="polite">
        {t("count", { count: saved.length })}
      </p>
      <PlaceGrid places={saved} />
    </div>
  )
}
