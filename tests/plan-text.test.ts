import { describe, expect, it } from "vitest"
import { planText } from "@/lib/planner/plan-text"
import type { Stop } from "@/lib/planner/types"

const stop = (slot: Stop["slot"], start: number, name: string, address: string) =>
  ({ slot, start, place: { name, address } }) as Pick<Stop, "slot" | "start" | "place">

describe("planText", () => {
  it("lists each stop with its time, slot and address, then the cost and link", () => {
    const text = planText({
      label: "Saturday, October 24 (Foodie)",
      stops: [
        stop("breakfast", 9 * 60, "Bagel Place", "1 Main St"),
        stop("night", 24 * 60 + 30, "Late Bar", "2 Side St"),
      ],
      costLine: "About $40 per person",
      url: "https://example.com/my-day?x=1",
      locale: "en-US",
      slotName: (s) => s.toUpperCase(),
    })
    expect(text.split("\n")).toEqual([
      "Saturday, October 24 (Foodie)",
      "",
      "9 AM      BREAKFAST: Bagel Place",
      "          1 Main St",
      "12:30 AM  NIGHT: Late Bar",
      "          2 Side St",
      "",
      "About $40 per person",
      "https://example.com/my-day?x=1",
    ])
  })
})
