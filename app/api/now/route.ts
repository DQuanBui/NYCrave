import { toCard } from "@/lib/card-place"
import { liveHome } from "@/lib/home"
import { nycDateString } from "@/lib/hours"
import { getPlaces } from "@/lib/places"
import { getRainForecast } from "@/lib/weather"

// One small response for every visitor, refreshed every 10 minutes. The home
// page itself is cached for hours and fetches this for its live parts.
export const dynamic = "force-static"
export const revalidate = 600

/** What is open right now, free today and the day's forecast in New York. */
export async function GET() {
  const now = new Date()
  const today = nycDateString(now)
  const all = await getPlaces({}, { sort: "trending" })
  const { openCount, open, free } = liveHome(all, now)
  const rain = await getRainForecast(today, today)
  return Response.json({
    at: now.toISOString(),
    openCount,
    open: open.map(toCard),
    free: free.map(toCard),
    forecast:
      rain && rain.tempMaxC !== null
        ? {
            tempMaxF: Math.round((rain.tempMaxC * 9) / 5 + 32),
            chance: rain.precipitationProbability,
            rainLikely: rain.rainLikely,
            extreme: rain.extreme,
          }
        : null,
  })
}
