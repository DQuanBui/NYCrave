import Anthropic from "@anthropic-ai/sdk"
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod"
import { z } from "zod"
import { MAX_MESSAGE_CHARS } from "@/lib/assistant/limits"
import { assistantSystemPrompt, extractPlaceSlugs } from "@/lib/assistant/prompt"
import { helperAnswer } from "@/lib/assistant/helper"
import { placeTool, planTool, searchTool, TIPS } from "@/lib/assistant/tools"
import { toCard } from "@/lib/card-place"
import { getPlaces } from "@/lib/places"
import { INTERESTS, MOODS } from "@/lib/planner/types"

const MAX_TURNS = 12

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(4000),
      }),
    )
    .min(1)
    .max(MAX_TURNS),
  locale: z.enum(["en", "vi", "es", "zh", "ko"]).default("en"),
})

// Best-effort guards for a paid endpoint, per server instance
const WINDOW_MS = 10 * 60_000
const PER_VISITOR = 20
const PER_VISITOR_FREE = 60
const OVERALL = 400
const hits = new Map<string, number[]>()
let overall: number[] = []

function limited(ip: string, perVisitor: number, ai: boolean): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  overall = overall.filter((t) => now - t < WINDOW_MS)
  // The overall cap only protects AI spending
  if (recent.length >= perVisitor || (ai && overall.length >= OVERALL)) return true
  hits.set(ip, [...recent, now])
  overall.push(now)
  return false
}

/**
 * The site assistant. Without an API key it answers for free from NYCrave's own
 * data (lib/assistant/helper). With ANTHROPIC_API_KEY set, Claude answers with NYCrave's own tools (search, place
 * details, the day planner and tips) and streams newline-delimited JSON:
 * {type:"text"} deltas, then {type:"places"} cards for places it linked, then {type:"done"}.
 */
export async function POST(request: Request) {
  const ai = Boolean(process.env.ANTHROPIC_API_KEY)
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local"
  if (limited(ip, ai ? PER_VISITOR : PER_VISITOR_FREE, ai)) {
    return Response.json({ error: "rate_limited" }, { status: 429 })
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 })
  const { messages, locale } = parsed.data
  const last = messages[messages.length - 1]
  if (last.role !== "user" || last.content.length > MAX_MESSAGE_CHARS) {
    return Response.json({ error: "invalid" }, { status: 400 })
  }

  const places = await getPlaces()
  const now = new Date()

  // Free mode: answer from NYCrave's own search, planner and tips, no AI
  if (!ai) {
    const answer = helperAnswer(last.content, places, now, locale)
    const cards = answer.places
      .map((slug) => places.find((p) => p.slug === slug))
      .filter((p) => p !== undefined)
      .slice(0, 6)
      .map(toCard)
    const lines = [
      { type: "text", text: answer.text },
      ...(cards.length ? [{ type: "places", places: cards }] : []),
      { type: "done" },
    ]
    return new Response(lines.map((l) => `${JSON.stringify(l)}\n`).join(""), {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store",
      },
    })
  }

  const tools = [
    betaZodTool({
      name: "search_places",
      description:
        "Search NYCrave's places by dish, drink, cuisine, category, vibe, neighborhood, borough, price or time, in plain words (English or Vietnamese), e.g. 'dumplings in Chinatown', 'free museums', 'late night pizza', 'rooftop open now'. Returns up to 6 places with their live open status. The only source of place recommendations.",
      inputSchema: z.object({
        query: z.string().describe("What to look for, in a few words"),
      }),
      run: ({ query }) => JSON.stringify(searchTool(places, query, now)),
    }),
    betaZodTool({
      name: "get_place",
      description:
        "Full details for one NYCrave place by slug: address, weekly hours, open now, must-try items, tickets, best time, time needed, nearest subway stations and website.",
      inputSchema: z.object({ slug: z.string() }),
      run: ({ slug }) => JSON.stringify(placeTool(places, slug, now)),
    }),
    betaZodTool({
      name: "plan_day",
      description:
        "Build a timed one-day itinerary from NYCrave places around what is open, and get a link to it. Use when someone asks for a plan, itinerary or what to do all day.",
      inputSchema: z.object({
        from: z
          .string()
          .describe("Starting neighborhood name or slug, e.g. 'Midtown' or 'east-village'"),
        mood: z.enum(MOODS).optional(),
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional()
          .describe("YYYY-MM-DD; defaults to today"),
        start: z
          .string()
          .regex(/^\d{2}:\d{2}$/)
          .optional()
          .describe("HH:MM, 24-hour"),
        end: z
          .string()
          .regex(/^\d{2}:\d{2}$/)
          .optional()
          .describe("HH:MM, 24-hour"),
        budget: z.number().int().min(0).max(2000).optional().describe("USD per person"),
        interests: z.array(z.enum(INTERESTS)).optional(),
      }),
      run: (input) => JSON.stringify(planTool(places, input, now)),
    }),
    betaZodTool({
      name: "get_tips",
      description:
        "Practical New York facts: subway and fares, tipping and tax, safety, airports, seasons.",
      inputSchema: z.object({
        topic: z.enum(["subway", "tipping", "safety", "airports", "seasons"]),
      }),
      run: ({ topic }) => TIPS[topic],
    }),
  ]

  const client = new Anthropic({ timeout: 60_000 })
  const runner = client.beta.messages.toolRunner(
    {
      model: process.env.ASSISTANT_MODEL || "claude-sonnet-5",
      max_tokens: 1200,
      max_iterations: 6,
      // A declined request is retried on a fallback model
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: assistantSystemPrompt(now, locale),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      tools,
      stream: true,
    },
    { signal: request.signal },
  )

  const encoder = new TextEncoder()
  const body = new ReadableStream({
    async start(controller) {
      const send = (event: object) =>
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`))
      let text = ""
      try {
        for await (const stream of runner) {
          // Keep text from separate model turns apart
          if (text && !/\s$/.test(text)) {
            text += "\n\n"
            send({ type: "text", text: "\n\n" })
          }
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              text += event.delta.text
              send({ type: "text", text: event.delta.text })
            }
          }
        }
        const cards = extractPlaceSlugs(text)
          .map((slug) => places.find((p) => p.slug === slug))
          .filter((p) => p !== undefined)
          .slice(0, 6)
          .map(toCard)
        if (cards.length) send({ type: "places", places: cards })
        send({ type: "done" })
      } catch (error) {
        const code =
          error instanceof Anthropic.RateLimitError
            ? "busy"
            : request.signal.aborted
              ? "aborted"
              : "failed"
        send({ type: "error", error: code })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(body, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  })
}
