import Anthropic from "@anthropic-ai/sdk"
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod"
import { z } from "zod"
import { nycDateString } from "@/lib/hours"
import { getPlaces } from "@/lib/places"
import {
  buildCandidates,
  describeSlots,
  selectionSchema,
  validateSelection,
} from "@/lib/planner/enhance"
import { parsePlanParams, planQuery } from "@/lib/planner/params"
import { planDay } from "@/lib/planner/plan"
import { getRainForecast } from "@/lib/weather"

const bodySchema = z.object({ query: z.record(z.string(), z.string()) })

const SYSTEM = `You refine one-day New York City itineraries for NYCrave.
Choose only from the candidate places listed for each slot, using their ids exactly. Never invent places or facts.
Pick the candidate that best fits the traveler's mood and interests while keeping consecutive stops close together (kmFromPreviousStop). Keeping the current pick is fine when it is already the best fit.
For every slot, write a note of at most 20 words explaining the choice, based only on the details provided.`

// Best-effort abuse guard for a paid endpoint; per server instance.
const WINDOW_MS = 10 * 60_000
const MAX_REQUESTS = 10
const hits = new Map<string, number[]>()

function rateLimited(key: string): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(key, recent)
  return recent.length > MAX_REQUESTS
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "AI refinement is not configured" }, { status: 501 })
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local"
  if (rateLimited(ip)) return Response.json({ error: "Too many requests" }, { status: 429 })

  const body = bodySchema.safeParse(await request.json().catch(() => null))
  if (!body.success) return Response.json({ error: "Invalid request" }, { status: 400 })

  const { input, adjustments, submitted } = parsePlanParams(body.data.query)
  if (!submitted) return Response.json({ error: "Missing plan" }, { status: 400 })

  const places = await getPlaces()
  const forecast = input.weatherAware
    ? await getRainForecast(input.date, nycDateString(new Date()))
    : null
  const base = planDay(input, places, { ...adjustments, rainLikely: forecast?.rainLikely })
  const slots = buildCandidates(base, places).filter((s) => s.candidates.length > 1)
  if (slots.length === 0) {
    return Response.json({ query: planQuery(input, adjustments), notes: [] })
  }

  const client = new Anthropic({ timeout: 60_000 })
  try {
    const response = await client.beta.messages.parse({
      model: "claude-opus-5",
      max_tokens: 4000,
      // Server-side refusal fallback: a declined request is retried on a fallback model
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM,
      output_config: { effort: "low", format: betaZodOutputFormat(selectionSchema) },
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            traveler: {
              mood: input.mood,
              interests: input.interests,
              dietary: input.dietary,
              pace: input.pace,
              budgetUsd: input.budget,
              rainLikely: forecast?.rainLikely ?? null,
            },
            slots: describeSlots(base, slots),
          }),
        },
      ],
    })

    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return Response.json({ error: "No refinement available" }, { status: 502 })
    }

    const picks = validateSelection(response.parsed_output, slots)
    const locks = Object.fromEntries(base.stops.map((s) => [s.slot, s.place.id]))
    for (const pick of picks) locks[pick.slot] = pick.placeId

    // The deterministic planner re-validates every pick against hours, budget and dietary needs
    const refined = planDay(input, places, { locks, rainLikely: forecast?.rainLikely })
    const finalLocks = Object.fromEntries(refined.stops.map((s) => [s.slot, s.place.id]))
    const notes = picks.flatMap((p) => {
      const stop = refined.stops.find((s) => s.slot === p.slot && s.place.id === p.placeId)
      return stop ? [{ slot: p.slot, name: stop.place.name, note: p.note }] : []
    })

    return Response.json({ query: planQuery(input, { locks: finalLocks }), notes })
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json({ error: "AI is busy, try again shortly" }, { status: 429 })
    }
    if (error instanceof Anthropic.APIError) {
      return Response.json({ error: "AI request failed" }, { status: 502 })
    }
    throw error
  }
}
