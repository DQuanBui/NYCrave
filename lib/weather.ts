import { z } from "zod"

/**
 * Daily rain outlook for New York from Open-Meteo (free, no key). Forecasts only
 * cover about two weeks ahead; anything else returns null and the planner ignores weather.
 */

const RAIN_THRESHOLD = 50
const MAX_DAYS_AHEAD = 15

const responseSchema = z.object({
  daily: z.object({
    time: z.array(z.string()),
    precipitation_probability_max: z.array(z.number().nullable()),
    temperature_2m_max: z.array(z.number().nullable()),
  }),
})

export type RainForecast = {
  precipitationProbability: number
  tempMaxC: number | null
  rainLikely: boolean
}

export async function getRainForecast(date: string, today: string): Promise<RainForecast | null> {
  const days = (Date.parse(date) - Date.parse(today)) / 86_400_000
  if (!(days >= 0 && days <= MAX_DAYS_AHEAD)) return null

  const url = new URL("https://api.open-meteo.com/v1/forecast")
  url.searchParams.set("latitude", "40.7128")
  url.searchParams.set("longitude", "-74.006")
  url.searchParams.set("daily", "precipitation_probability_max,temperature_2m_max")
  url.searchParams.set("timezone", "America/New_York")
  url.searchParams.set("start_date", date)
  url.searchParams.set("end_date", date)

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const { daily } = responseSchema.parse(await res.json())
    const probability = daily.precipitation_probability_max[0]
    if (probability == null) return null
    return {
      precipitationProbability: probability,
      tempMaxC: daily.temperature_2m_max[0] ?? null,
      rainLikely: probability >= RAIN_THRESHOLD,
    }
  } catch {
    return null
  }
}
