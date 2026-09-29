import { describe, expect, it } from "vitest"
import en from "@/messages/en.json"
import es from "@/messages/es.json"
import ko from "@/messages/ko.json"
import vi from "@/messages/vi.json"
import zh from "@/messages/zh.json"
import { routing } from "@/i18n/routing"

type Tree = { [key: string]: string | string[] | Tree }

function leaves(tree: Tree, prefix = ""): Map<string, string | string[]> {
  const out = new Map<string, string | string[]>()
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === "string" || Array.isArray(value)) out.set(path, value)
    else for (const [k, v] of leaves(value, path)) out.set(k, v)
  }
  return out
}

// ICU arguments: {name} or {count, plural, ...}. Plural branch text such as
// "=0 {没有地点}" is not an argument, so skip braces right after a selector.
const args = (s: string) => [
  ...new Set(
    [...s.matchAll(/(?<!=\d+ )(?<!one )(?<!other )\{([A-Za-z_]\w*)(?=[,}])/g)].map((m) => m[1]),
  ),
]

const TRANSLATIONS = { vi, es, zh, ko } as Record<string, Tree>

describe("translations", () => {
  const base = leaves(en as Tree)

  it("covers every locale the site serves", () => {
    expect(Object.keys(TRANSLATIONS).sort()).toEqual(
      routing.locales.filter((l) => l !== "en").sort(),
    )
  })

  it.each(Object.entries(TRANSLATIONS))("%s has exactly the same keys as en", (_, messages) => {
    expect([...leaves(messages).keys()].sort()).toEqual([...base.keys()].sort())
  })

  it.each(Object.entries(TRANSLATIONS))(
    "%s keeps every ICU argument and list length",
    (_, messages) => {
      const other = leaves(messages)
      for (const [key, value] of base) {
        const translated = other.get(key)!
        if (Array.isArray(value)) {
          expect(Array.isArray(translated) && translated.length, key).toBe(value.length)
        } else {
          expect(args(translated as string).sort(), key).toEqual(args(value).sort())
        }
      }
    },
  )
})
