import { describe, expect, it } from "vitest"
import { extremeOf } from "@/lib/weather"

describe("extremeOf", () => {
  it("flags hot and cold days by the daily high", () => {
    expect(extremeOf(34)).toBe("hot")
    expect(extremeOf(32)).toBe("hot")
    expect(extremeOf(24)).toBeNull()
    expect(extremeOf(1)).toBe("cold")
    expect(extremeOf(-5)).toBe("cold")
    expect(extremeOf(null)).toBeNull()
  })
})
