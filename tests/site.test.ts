import { describe, expect, it } from "vitest"
import { toOrigin } from "@/lib/site"

describe("toOrigin", () => {
  it("accepts full URLs, bare hosts and trailing slashes", () => {
    expect(toOrigin("https://nycrave.vercel.app/")).toBe("https://nycrave.vercel.app")
    expect(toOrigin("nycrave.vercel.app")).toBe("https://nycrave.vercel.app")
    expect(toOrigin("  http://localhost:3000  ")).toBe("http://localhost:3000")
  })

  it("ignores empty or broken values instead of crashing the build", () => {
    expect(toOrigin("")).toBeUndefined()
    expect(toOrigin(undefined)).toBeUndefined()
    expect(toOrigin("https://")).toBeUndefined()
  })
})
