import { describe, expect, it } from "vitest"
import { splitBill } from "@/lib/bill"

describe("splitBill", () => {
  it("adds NYC sales tax and a tip on the pre-tax amount", () => {
    expect(splitBill(100, 0.2, 1)).toEqual({ tax: 8.88, tip: 20, total: 128.88, each: 128.88 })
  })

  it("rounds each share up to the cent", () => {
    const { total, each } = splitBill(60, 0.18, 3)
    expect(total).toBe(76.13)
    expect(each).toBe(25.38)
    expect(each * 3).toBeGreaterThanOrEqual(total)
  })
})
