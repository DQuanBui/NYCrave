import { describe, expect, it } from "vitest"
import { breadcrumbJsonLd } from "@/lib/structured-data"

describe("breadcrumb structured data", () => {
  it("numbers the trail from 1 and keeps each URL", () => {
    const ld = breadcrumbJsonLd([
      { name: "Home", url: "https://nycrave.vercel.app/" },
      { name: "Eat", url: "https://nycrave.vercel.app/eat" },
      { name: "Katz's Delicatessen", url: "https://nycrave.vercel.app/place/katzs-delicatessen" },
    ])
    expect(ld["@type"]).toBe("BreadcrumbList")
    expect(ld.itemListElement.map((i) => i.position)).toEqual([1, 2, 3])
    expect(ld.itemListElement[2]).toMatchObject({
      name: "Katz's Delicatessen",
      item: "https://nycrave.vercel.app/place/katzs-delicatessen",
    })
  })
})
