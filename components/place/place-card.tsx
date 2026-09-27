import { Navigation } from "lucide-react"
import { useTranslations } from "next-intl"
import { LineBullet } from "@/components/brand/line-bullet"
import { HoursBadge } from "@/components/place/hours-badge"
import { PlacePhoto } from "@/components/place/place-photo"
import { PriceLevel } from "@/components/place/price-level"
import { SaveButton } from "@/components/place/save-button"
import { UnverifiedTag } from "@/components/place/unverified-tag"
import { Link } from "@/i18n/navigation"
import { placeTagKeys } from "@/lib/place-display"
import { CATEGORY_META } from "@/lib/taxonomy"
import { cn } from "@/lib/utils"
import type { Travel } from "@/lib/planner/types"
import type { Place } from "@/types/place"

type PlaceCardProps = {
  place: Place
  className?: string
  priority?: boolean
  /** Distance from the viewer, when they asked to sort by "near me". */
  travel?: Travel
}

export function PlaceCard({ place, className, priority, travel }: PlaceCardProps) {
  const t = useTranslations()
  const meta = CATEGORY_META[place.category]
  const tags = placeTagKeys(place).map((key) => t(key))
  if (place.category === "attraction" && place.timeNeededMinutes) {
    tags.unshift(t("place.timeNeeded", { minutes: place.timeNeededMinutes }))
    tags.splice(2)
  }

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground transition-shadow hover:shadow-[0_10px_30px_-12px_rgba(29,31,33,0.35)]",
        className,
      )}
    >
      <div className="relative aspect-[4/3]">
        <PlacePhoto
          place={place}
          sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 80vw"
          priority={priority}
          className="absolute inset-0 transition-transform duration-500 ease-(--ease-out-quint) group-hover:scale-[1.03]"
        />
        <LineBullet
          line={meta.line}
          size="md"
          label={t(`categories.${place.category}.label`)}
          className="absolute top-3 left-3 shadow-sm ring-2 ring-white"
        >
          {meta.bullet}
        </LineBullet>
        <SaveButton slug={place.slug} name={place.name} className="absolute top-3 right-3 z-10" />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg leading-snug font-bold text-balance">
            <Link
              href={`/place/${place.slug}`}
              className="after:absolute after:inset-0 focus-visible:outline-none after:focus-visible:rounded-2xl after:focus-visible:ring-3 after:focus-visible:ring-ring"
            >
              {place.name}
            </Link>
          </h3>
          <PriceLevel place={place} className="shrink-0 pt-0.5 text-sm" />
        </div>
        <p className="text-sm text-muted-foreground">
          {place.neighborhood}, {t(`borough.${place.borough}`)}
        </p>
        {travel ? (
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <Navigation aria-hidden className="size-3.5 text-line-blue" />
            {t(travel.mode === "walk" ? "place.distanceWalk" : "place.distanceSubway", {
              distance: (travel.km / 1.609).toFixed(1),
              minutes: travel.minutes,
            })}
          </p>
        ) : null}
        {place.editorialTake ? (
          <p className="line-clamp-2 text-sm leading-snug text-pretty">{place.editorialTake}</p>
        ) : null}
        {tags.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li key={tag} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold">
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <HoursBadge hours={place.hours} />
          {!place.verified ? <UnverifiedTag /> : null}
        </div>
      </div>
    </article>
  )
}
