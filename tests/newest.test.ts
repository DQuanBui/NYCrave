import { describe, expect, it } from "vitest"
import { newest } from "@/lib/home"
import { seedPlaces } from "@/lib/places"

describe("new on NYCrave", () => {
  it("lists the latest additions first", () => {
    const list = newest(seedPlaces())
    expect(list).toHaveLength(12)
    for (let i = 1; i < list.length; i++)
      expect(list[i - 1].updatedAt >= list[i].updatedAt).toBe(true)
  })

  it("breaks ties by trending score", () => {
    const a = { updatedAt: "2026-10-20T12:00:00.000Z", trendingScore: 10 }
    const b = { updatedAt: "2026-10-20T12:00:00.000Z", trendingScore: 90 }
    expect(newest([a, b])[0]).toBe(b)
  })
})
