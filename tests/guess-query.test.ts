import { describe, expect, it } from "vitest"
import { guessQuery } from "@/lib/guess-query"

describe("guessQuery", () => {
  it("turns the last part of a broken link into search words", () => {
    expect(guessQuery("/place/katzs-deli")).toBe("katzs deli")
    expect(guessQuery("/neighborhoods/long_island_city")).toBe("long island city")
    expect(guessQuery("/place/ph%E1%BB%9F")).toBe("phở")
  })

  it("skips links with nothing worth searching", () => {
    expect(guessQuery("/")).toBe("")
    expect(guessQuery("/x")).toBe("")
    expect(guessQuery("/place/%E0%A4%A")).toBe("E0A4A")
  })
})
