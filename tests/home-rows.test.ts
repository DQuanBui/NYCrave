import { describe, expect, it } from "vitest"
import { freshFirst, markShown } from "@/lib/home"

const row = (...slugs: string[]) => slugs.map((slug) => ({ slug }))

describe("home rows", () => {
  it("puts places not shown yet first, keeping the rest at the end", () => {
    const shown = new Set(["a", "c"])
    expect(freshFirst(row("a", "b", "c", "d"), shown).map((p) => p.slug)).toEqual([
      "b",
      "d",
      "a",
      "c",
    ])
  })

  it("marks the start of a row as shown", () => {
    const shown = new Set<string>()
    markShown(row("a", "b", "c"), shown, 2)
    expect([...shown]).toEqual(["a", "b"])
  })
})
