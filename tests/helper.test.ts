import { describe, expect, it } from "vitest"
import { findPlaceIn, helperAnswer } from "@/lib/assistant/helper"
import { getPlaces } from "@/lib/places"

const places = await getPlaces()
// Saturday 2026-10-03, 1 PM in New York
const NOW = new Date("2026-10-03T17:00:00Z")
const ask = (q: string, locale: "en" | "vi" | "es" | "zh" | "ko" = "en") =>
  helperAnswer(q, places, NOW, locale)

describe("free helper", () => {
  it("greets and explains what it can do", () => {
    expect(ask("hi").text).toMatch(/Ask me about/)
    expect(ask("xin chào", "vi").text).toMatch(/Xin chào/)
    expect(ask("thanks!").places).toEqual([])
  })

  it("answers cravings with NYCrave places and a link to all results", () => {
    const a = ask("Where can I get dumplings in Chinatown?")
    expect(a.places).toContain("nom-wah-tea-parlor")
    expect(a.text).toContain("](/place/nom-wah-tea-parlor)")
    expect(a.text).toContain("/search?q=")
  })

  it("recognizes places by name, short name or nickname", () => {
    expect(findPlaceIn("When does Katz's close?", places)?.slug).toBe("katzs-delicatessen")
    expect(findPlaceIn("how do I get to the Met", places)?.slug).toBe("the-met-fifth-avenue")
    expect(findPlaceIn("is the guggenheim open monday", places)?.slug).toBe("guggenheim-museum")
    expect(findPlaceIn("what times is it open", places)).toBeUndefined()
    expect(findPlaceIn("pizza in the west village", places)).toBeUndefined()
  })

  it("gives one place's status, address and subway", () => {
    const a = ask("is joe's pizza open now")
    expect(a.places).toEqual(["joes-pizza-carmine-street"])
    expect(a.text).toContain("7 Carmine St")
    expect(a.text).toMatch(/Nearest subway: W 4 St/)
    expect(a.text).toMatch(/check before you go/)
  })

  it("plans a day, indoors when it rains", () => {
    const a = ask("Plan a rainy day starting in Midtown")
    expect(a.text).toContain("](/my-day?")
    expect(a.places.length).toBeGreaterThanOrEqual(4)
    const outdoor = places.filter((p) => a.places.includes(p.slug) && p.category === "park_pier")
    expect(outdoor).toEqual([])
    expect(ask("romantic plan for a day in the West Village").text).toContain("from=west-village")
  })

  it("answers practical questions from the tips", () => {
    expect(ask("How do I get from JFK to Midtown?").text).toMatch(/AirTrain/)
    expect(ask("how much should I tip").text).toMatch(/18 to 22 percent/)
    expect(ask("Đi từ sân bay JFK vào Midtown thế nào?", "vi").text).toMatch(/AirTrain/)
  })

  it("speaks Vietnamese", () => {
    const a = ask("Ăn há cảo ở Chinatown ở đâu ngon?", "vi")
    expect(a.text).toMatch(/^Đây là những gì NYCrave có/)
    expect(a.text).toMatch(/đang mở, đến \d{1,2}:\d{2}/)
    expect(a.text).not.toMatch(/[\s\u202f](AM|PM)/)
    expect(a.places).toContain("nom-wah-tea-parlor")
  })

  it("says so instead of inventing when nothing fits", () => {
    const a = ask("sushi in queens")
    expect(a.places).toEqual([])
    expect(a.text).toMatch(/couldn't find a NYCrave place/)
  })
})

describe("free helper in Spanish, Chinese and Korean", () => {
  it("answers in the visitor's language with local times", () => {
    const es = ask("¿Dónde como dumplings en Chinatown?", "es")
    expect(es.places).toContain("nom-wah-tea-parlor")
    expect(es.text).toMatch(/^Esto es lo que tiene NYCrave/)
    expect(es.text).toMatch(/abierto ahora, hasta las \d/)

    const zh = ask("唐人街哪里有好吃的饺子点心？", "zh")
    expect(zh.places).toContain("nom-wah-tea-parlor")
    expect(zh.text).toMatch(/正在营业，营业至 \d{1,2}:\d{2}/)

    const ko = ask("차이나타운에서 딤섬 먹을 곳은?", "ko")
    expect(ko.places).toContain("nom-wah-tea-parlor")
    expect(ko.text).toMatch(/영업 중, \d{1,2}:\d{2}까지/)
  })

  it("plans days and answers tips from translated questions", () => {
    expect(ask("Planea un día de lluvia en Manhattan", "es").text).toContain("](/my-day?")
    expect(ask("帮两个人规划曼哈顿的一个雨天", "zh").text).toContain("](/my-day?")
    expect(ask("두 사람이 맨해튼에서 보낼 비 오는 날 일정 짜 줘", "ko").text).toContain(
      "](/my-day?",
    )
    expect(ask("¿Cómo llego del aeropuerto JFK a Midtown?", "es").text).toMatch(/AirTrain/)
    expect(ask("从 JFK 机场怎么去 Midtown？", "zh").text).toMatch(/AirTrain/)
    expect(ask("JFK 공항에서 미드타운까지 어떻게 가요?", "ko").text).toMatch(/AirTrain/)
  })
})
