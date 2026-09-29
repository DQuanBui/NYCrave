import { toCard } from "@/lib/card-place"
import { getPlaces } from "@/lib/places"

// Built once and refreshed every few minutes: the same list for every visitor
export const dynamic = "force-static"
export const revalidate = 300

/**
 * Every place as a card, for "What's next" on place pages. Suggestions are worked
 * out in the browser, so visitors never send their location.
 */
export async function GET() {
  const places = (await getPlaces({}, { sort: "trending" })).map((p) => ({
    ...toCard(p),
    trendingScore: p.trendingScore,
  }))
  return Response.json(places)
}
