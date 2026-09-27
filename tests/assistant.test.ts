import { afterEach, describe, expect, it, vi } from "vitest"
import { POST } from "@/app/api/assistant/route"
import { MAX_MESSAGE_CHARS } from "@/lib/assistant/limits"
import { assistantSystemPrompt, extractPlaceSlugs } from "@/lib/assistant/prompt"
import { placeTool, planTool, searchTool, TIPS } from "@/lib/assistant/tools"
import { getPlaces } from "@/lib/places"

const places = await getPlaces()
// Saturday 2026-10-03, 1 PM in New York
const NOW = new Date("2026-10-03T17:00:00Z")

describe("assistant tools", () => {
  it("search returns NYCrave places with live status and links", () => {
    const { results } = searchTool(places, "dumplings in Chinatown", NOW)
    expect(results[0]).toMatchObject({ slug: "nom-wah-tea-parlor", url: "/place/nom-wah-tea-parlor" })
    expect(results[0].status).toMatch(/^open now, until/)
    expect(results.length).toBeLessThanOrEqual(6)
  })

  it("search says so when nothing matches", () => {
    const out = searchTool(places, "ethiopian injera in staten island", NOW)
    expect(out.results).toEqual([])
    expect(out.note).toMatch(/No NYCrave places match/)
  })

  it("place details come only from the data", () => {
    const d = placeTool(places, "katzs-delicatessen", NOW)
    if ("error" in d) throw new Error(d.error)
    expect(d.address).toBe("205 E Houston St, New York, NY 10002")
    expect(d.hours.Saturday).toBe("24h")
    expect(d.nearestSubway[0]).toMatchObject({ station: "2 Av", trains: "F" })
    expect(d.hoursNote).toMatch(/not yet confirmed/)
    expect(placeTool(places, "made-up-place", NOW)).toHaveProperty("error")
  })

  it("plans a day and links to it", () => {
    const plan = planTool(places, { from: "Chinatown", mood: "foodie", budget: 100 }, NOW)
    if ("error" in plan) throw new Error(plan.error)
    expect(plan.link).toMatch(/^\/my-day\?d=2026-10-03&/)
    expect(plan.stops.length).toBeGreaterThanOrEqual(4)
    expect(plan.stops.every((s) => places.some((p) => p.slug === s.slug))).toBe(true)
    expect(planTool(places, { from: "Atlantis" }, NOW)).toHaveProperty("error")
  })

  it("has tips for every topic", () => {
    for (const text of Object.values(TIPS)) expect(text.length).toBeGreaterThan(50)
  })
})

describe("assistant prompt", () => {
  it("sets the date, language and the no-invention rule", () => {
    const p = assistantSystemPrompt(NOW, "vi")
    expect(p).toContain("today is 2026-10-03")
    expect(p).toContain("Vietnamese")
    expect(p).toContain("Never name a restaurant")
  })

  it("finds linked places, once each, with or without a locale prefix", () => {
    expect(
      extractPlaceSlugs("Try [Katz's](/place/katzs-delicatessen), [Joe's](/vi/place/joes-pizza-carmine-street) and [Katz's](/place/katzs-delicatessen)."),
    ).toEqual(["katzs-delicatessen", "joes-pizza-carmine-street"])
  })
})

describe("assistant route", () => {
  afterEach(() => vi.unstubAllEnvs())
  const call = (body: unknown) =>
    POST(new Request("http://x/api/assistant", { method: "POST", body: JSON.stringify(body) }))

  it("is off without an API key", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "")
    expect((await call({ messages: [{ role: "user", content: "hi" }] })).status).toBe(501)
  })

  it("rejects bad and overlong questions before calling the model", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test")
    expect((await call({ messages: [] })).status).toBe(400)
    expect((await call({ messages: [{ role: "assistant", content: "hi" }] })).status).toBe(400)
    const long = "a".repeat(MAX_MESSAGE_CHARS + 1)
    expect((await call({ messages: [{ role: "user", content: long }] })).status).toBe(400)
  })
})
