import { describe, expect, it } from "vitest"
import { feedbackInputSchema, summarizeFeedback } from "@/lib/feedback-store"
import {
  ASK_AFTER_SENT,
  ASK_AGAIN_AFTER,
  parseMemory,
  shouldAsk,
  VIEWS_OTHERWISE,
  VIEWS_WHEN_ENGAGED,
} from "@/lib/feedback-timing"

const NOW = Date.UTC(2026, 8, 27)

describe("when to ask for feedback", () => {
  it("waits until the site has been used", () => {
    expect(shouldAsk({ views: 1, engaged: false }, NOW)).toBe(false)
    expect(shouldAsk({ views: VIEWS_OTHERWISE - 1, engaged: false }, NOW)).toBe(false)
    expect(shouldAsk({ views: VIEWS_OTHERWISE, engaged: false }, NOW)).toBe(true)
  })

  it("asks sooner once something was saved", () => {
    expect(shouldAsk({ views: VIEWS_WHEN_ENGAGED, engaged: true }, NOW)).toBe(true)
    expect(shouldAsk({ views: VIEWS_WHEN_ENGAGED - 1, engaged: true }, NOW)).toBe(false)
  })

  it("does not nag after a dismissal or after feedback was sent", () => {
    const used = { views: 50, engaged: true }
    expect(shouldAsk({ ...used, askedAt: NOW - 1000 }, NOW)).toBe(false)
    expect(shouldAsk({ ...used, askedAt: NOW - ASK_AGAIN_AFTER - 1 }, NOW)).toBe(true)
    expect(shouldAsk({ ...used, sentAt: NOW - ASK_AGAIN_AFTER - 1 }, NOW)).toBe(false)
    expect(shouldAsk({ ...used, sentAt: NOW - ASK_AFTER_SENT - 1 }, NOW)).toBe(true)
  })

  it("reads stored memory defensively", () => {
    expect(parseMemory(null)).toEqual({ views: 0, engaged: false })
    expect(parseMemory({ views: "9", engaged: "yes", askedAt: Number.NaN })).toEqual({
      views: 0,
      engaged: false,
      askedAt: undefined,
      sentAt: undefined,
    })
    expect(parseMemory({ views: 4.7, engaged: true, sentAt: 5 })).toMatchObject({
      views: 4,
      engaged: true,
      sentAt: 5,
    })
  })
})

describe("feedback input", () => {
  it("accepts a rating with optional features and comment", () => {
    const ok = feedbackInputSchema.safeParse({ rating: "4", features: ["map"], locale: "vi" })
    expect(ok.success && ok.data).toEqual({ rating: 4, features: ["map"], locale: "vi" })
  })

  it("rejects out-of-range ratings, unknown features and locales, and long comments", () => {
    const bad = [
      { rating: 0, locale: "en" },
      { rating: 6, locale: "en" },
      { rating: 3, features: ["ads"], locale: "en" },
      { rating: 3, locale: "fr" },
      { rating: 3, comment: "x".repeat(1001), locale: "en" },
    ]
    for (const input of bad) expect(feedbackInputSchema.safeParse(input).success).toBe(false)
  })

  it("summarizes ratings", () => {
    expect(summarizeFeedback([{ rating: 5 }, { rating: 4 }, { rating: 5 }])).toEqual({
      total: 3,
      average: 14 / 3,
      counts: [0, 0, 0, 1, 2],
    })
    expect(summarizeFeedback([])).toEqual({ total: 0, average: 0, counts: [0, 0, 0, 0, 0] })
  })
})
