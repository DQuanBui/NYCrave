import { describe, expect, it } from "vitest"
import { holidayOn, holidaysOf } from "@/lib/holidays"

describe("holidays", () => {
  it("computes the floating holidays", () => {
    const y2026 = Object.fromEntries(holidaysOf(2026).map((h) => [h.key, h.date]))
    expect(y2026.mlkDay).toBe("2026-01-19")
    expect(y2026.presidentsDay).toBe("2026-02-16")
    expect(y2026.memorialDay).toBe("2026-05-25")
    expect(y2026.laborDay).toBe("2026-09-07")
    expect(y2026.indigenousPeoplesDay).toBe("2026-10-12")
    expect(y2026.thanksgiving).toBe("2026-11-26")
    expect(holidayOn("2027-11-25")?.key).toBe("thanksgiving")
  })

  it("marks the days most places close", () => {
    expect(holidayOn("2026-12-25")).toMatchObject({ key: "christmas", major: true })
    expect(holidayOn("2026-07-04")).toMatchObject({ major: false })
    expect(holidayOn("2026-10-03")).toBeUndefined()
  })
})
