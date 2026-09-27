import { describe, expect, it } from "vitest"
import en from "@/messages/en.json"
import vi from "@/messages/vi.json"

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

// {name}, {count, plural, ...} and friends: every argument must survive translation
const args = (s: string) =>
  [...s.matchAll(/\{(\w+)(?=[,}])/g)].map((m) => m[1]).filter((a) => a !== "other").sort()

describe("translations", () => {
  const base = leaves(en as Tree)
  const other = leaves(vi as Tree)

  it("vi has exactly the same keys as en", () => {
    expect([...other.keys()].sort()).toEqual([...base.keys()].sort())
  })

  it("keeps every ICU argument and list length", () => {
    for (const [key, value] of base) {
      const translated = other.get(key)!
      if (Array.isArray(value)) {
        expect(Array.isArray(translated) && translated.length, key).toBe(value.length)
      } else {
        expect([...new Set(args(translated as string))], key).toEqual([...new Set(args(value))])
      }
    }
  })
})
