import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { clientMessages, SERVER_ONLY_NAMESPACES } from "@/lib/client-messages"
import en from "@/messages/en.json"

const ROOT = join(__dirname, "..")

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.(ts|tsx)$/.test(name) ? [path] : []
  })
}

describe("messages sent to the browser", () => {
  it("leaves out only namespaces that exist", () => {
    for (const ns of SERVER_ONLY_NAMESPACES) expect(Object.keys(en)).toContain(ns)
    const sent = clientMessages(en)
    expect(Object.keys(sent).length).toBe(Object.keys(en).length - SERVER_ONLY_NAMESPACES.length)
  })

  it("never needs a server-only namespace in code that can run in the browser", () => {
    // Anything with "use client" or the hook-style useTranslations can render in the browser
    const files = ["app", "components", "hooks", "lib"].flatMap((d) => sourceFiles(join(ROOT, d)))
    const offenders: string[] = []
    for (const file of files) {
      const src = readFileSync(file, "utf8")
      const browserSide = /^\s*["']use client["']/.test(src) || src.includes("useTranslations(")
      if (!browserSide) continue
      for (const ns of SERVER_ONLY_NAMESPACES) {
        const used =
          new RegExp(String.raw`useTranslations\(\s*["'${"`"}]${ns}["'.${"`"}]`).test(src) ||
          new RegExp(String.raw`\bt\(\s*["'${"`"}]${ns}\.`).test(src)
        if (used) offenders.push(`${file.slice(ROOT.length)} uses ${ns}`)
      }
    }
    expect(offenders).toEqual([])
  })
})
