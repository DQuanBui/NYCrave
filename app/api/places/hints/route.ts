import { getPlaces } from "@/lib/places"
import type { SearchHint } from "@/components/home/smart-search"

// Built once and cached: the same list for every visitor
export const dynamic = "force-static"
export const revalidate = 86400

/**
 * Every place's name and neighborhood, for suggestions in the search box.
 * Fetched when the box is first focused instead of riding along with the page.
 */
export async function GET() {
  const hints: SearchHint[] = (await getPlaces({}, { sort: "trending" })).map((p) => ({
    slug: p.slug,
    name: p.name,
    neighborhood: p.neighborhood,
    category: p.category,
  }))
  return Response.json(hints)
}
