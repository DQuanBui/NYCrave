import { PlaceCard } from "@/components/place/place-card"
import type { Place } from "@/types/place"

export function PlaceGrid({ places }: { places: Place[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {places.map((place, i) => (
        <li key={place.id}>
          <PlaceCard place={place} className="h-full" priority={i < 2} />
        </li>
      ))}
    </ul>
  )
}
