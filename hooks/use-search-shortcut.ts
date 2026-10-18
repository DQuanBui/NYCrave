"use client"

import { useEffect } from "react"
import { useRouter } from "@/i18n/navigation"

const typing = (el: Element | null) =>
  el instanceof HTMLInputElement ||
  el instanceof HTMLTextAreaElement ||
  el instanceof HTMLSelectElement ||
  (el instanceof HTMLElement && el.isContentEditable)

/**
 * Press "/" anywhere to search: focuses the search box on the page when there
 * is one (home, search), otherwise opens the search page.
 */
export function useSearchShortcut() {
  const router = useRouter()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return
      if (typing(document.activeElement)) return
      e.preventDefault()
      const box = document.querySelector<HTMLInputElement>('input[type="search"][name="q"]')
      if (box && box.offsetParent !== null) {
        box.focus()
        box.select()
      } else {
        router.push("/search")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [router])
}
