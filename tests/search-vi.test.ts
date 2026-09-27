import { describe, expect, it } from "vitest"
import { getPlaces } from "@/lib/places"
import { parseQuery, scorePlace } from "@/lib/search"

const places = await getPlaces()
const search = (q: string) => {
  const intent = parseQuery(q)
  return places
    .map((p) => ({ p, s: scorePlace(p, intent) }))
    .filter((x) => x.s !== null)
    .sort((a, b) => b.s! - a.s!)
    .map((x) => x.p.slug)
}

describe("Vietnamese search", () => {
  it("understands dishes and drinks with or without tone marks", () => {
    expect(parseQuery("phở").dishTypes).toContain("noodle_soup")
    expect(parseQuery("há cảo ở Chinatown")).toMatchObject({
      dishTypes: ["dumplings"],
      neighborhood: "Chinatown",
      terms: [],
    })
    expect(parseQuery("tra sua").drinkTypes).toEqual(["bubble_tea"])
    expect(parseQuery("trà sữa").drinkTypes).toEqual(["bubble_tea"])
  })

  it("keeps đ as d instead of dropping it", () => {
    expect(parseQuery("đang mở cửa").openNow).toBe(true)
    expect(parseQuery("đồ si").shopTypes).toEqual(["thrift"])
  })

  it("maps moods, prices and categories", () => {
    expect(parseQuery("bảo tàng miễn phí")).toMatchObject({
      categories: ["attraction"],
      isFree: true,
    })
    expect(parseQuery("hẹn hò").vibes).toEqual(["date_night"])
    expect(parseQuery("ăn chay").dietary).toEqual(["vegetarian"])
    expect(parseQuery("món Hàn Quốc").cuisines).toEqual(["korean"])
  })

  it("finds real places", () => {
    expect(search("há cảo ở Chinatown")[0]).toBe("nom-wah-tea-parlor")
    expect(search("trà sữa")).toContain("xing-fu-tang-east-village")
    expect(search("bảo tàng").length).toBeGreaterThan(3)
  })

  it("leaves English queries alone", () => {
    expect(parseQuery("my favorite coffee").cuisines).toEqual([])
    expect(parseQuery("an Italian place").cuisines).toEqual(["italian"])
  })
})
