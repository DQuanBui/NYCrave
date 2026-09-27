import type { MapPoint } from "@/components/map/map-view"
import { CATEGORY_META } from "@/lib/taxonomy"
import type { Place } from "@/types/place"

export function placeToPoint(p: Place, label = CATEGORY_META[p.category].bullet): MapPoint {
  return {
    id: p.id,
    lat: p.lat,
    lng: p.lng,
    name: p.name,
    subtitle: p.neighborhood,
    href: `/place/${p.slug}`,
    line: CATEGORY_META[p.category].line,
    label,
  }
}
