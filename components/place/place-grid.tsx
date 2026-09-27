import { PlaceCard } from "@/components/place/place-card"
import type { Travel } from "@/lib/planner/types"
import type { Place } from "@/types/place"

export function PlaceGrid({
  places,
  travel,
}: {
  places: Place[]
  /** Travel from the viewer to each place, keyed by place id. */
  travel?: Record<string, Travel>
}) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {places.map((place, i) => (
        <li key={place.id}>
          <PlaceCard
            place={place}
            className="h-full"
            priority={i < 2}
            travel={travel?.[place.id]}
          />
        </li>
      ))}
    </ul>
  )
}
