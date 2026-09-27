"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { useId, useRef } from "react"
import { LineBullet } from "@/components/brand/line-bullet"
import { SignBand } from "@/components/brand/sign-band"
import { PlaceCard } from "@/components/place/place-card"
import { PlaceCardSkeleton } from "@/components/place/place-card-skeleton"
import { useNow } from "@/hooks/use-now"
import { Link } from "@/i18n/navigation"
import { getOpenStatus, isOpen, isOpenLaterToday, nycClock } from "@/lib/hours"
import { CATEGORY_META } from "@/lib/taxonomy"
import { cn } from "@/lib/utils"
import { CATEGORIES, type Place } from "@/types/place"

/** Time-dependent filters run on the client, against the viewer's current time. */
export type LiveFilter = "open-now" | "free-today"

type PlaceRailProps = {
  title: string
  places: Place[]
  seeAllHref?: string
  live?: LiveFilter
  emptyText?: string
  limit?: number
}

function applyLive(places: Place[], live: LiveFilter, now: Date) {
  if (live === "open-now") return places.filter((p) => isOpen(getOpenStatus(p.hours, now)))
  const clock = nycClock(now)
  return places.filter((p) => p.isFree && isOpenLaterToday(p.hours, clock))
}

export function PlaceRail({
  title,
  places,
  seeAllHref,
  live,
  emptyText,
  limit = 10,
}: PlaceRailProps) {
  const t = useTranslations()
  const headingId = useId()
  const scroller = useRef<HTMLUListElement>(null)
  const now = useNow()

  const pending = live !== undefined && now === null
  const visible = (live && now ? applyLive(places, live, now) : places).slice(0, limit)
  const lines = CATEGORIES.filter((c) => visible.some((p) => p.category === c))

  const scrollBy = (direction: 1 | -1) => {
    const el = scroller.current
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" })
  }

  return (
    <section aria-labelledby={headingId} className="space-y-4">
      <SignBand
        id={headingId}
        title={title}
        bullets={lines.map((c) => (
          <LineBullet key={c} line={CATEGORY_META[c].line} size="xs">
            {CATEGORY_META[c].bullet}
          </LineBullet>
        ))}
        action={
          <div className="flex items-center gap-1">
            {seeAllHref ? (
              <Link
                href={seeAllHref}
                className="rounded-full px-3 py-1.5 text-sm font-semibold hover:bg-white/10"
              >
                {t("home.seeAll")}
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label={t("rail.previous", { title })}
              className="hidden size-8 place-items-center rounded-full hover:bg-white/10 md:grid"
            >
              <ChevronLeft aria-hidden className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label={t("rail.next", { title })}
              className="hidden size-8 place-items-center rounded-full hover:bg-white/10 md:grid"
            >
              <ChevronRight aria-hidden className="size-5" />
            </button>
          </div>
        }
      />

      {!pending && visible.length === 0 ? (
        <p className="rounded-xl border-2 border-dashed border-foreground/30 px-5 py-6 text-pretty text-muted-foreground">
          {emptyText}
        </p>
      ) : (
        <ul
          ref={scroller}
          aria-busy={pending}
          className="-mx-4 scrollbar-none flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 lg:-mx-8 lg:scroll-px-8 lg:px-8"
        >
          {pending
            ? Array.from({ length: 4 }, (_, i) => (
                <li key={i} className={cardWidth}>
                  <PlaceCardSkeleton className="h-full" />
                </li>
              ))
            : visible.map((place, i) => (
                <li key={place.id} className={cn(cardWidth, "snap-start")}>
                  <PlaceCard place={place} className="h-full" priority={i < 2 && !live} />
                </li>
              ))}
        </ul>
      )}
    </section>
  )
}

const cardWidth = "w-[78%] shrink-0 sm:w-[46%] md:w-[31%] lg:w-[23.5%]"
