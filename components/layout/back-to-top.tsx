"use client"

import { ArrowUp } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

/** Appears after scrolling a couple of screens down long pages, and takes you back up. */
export function BackToTop() {
  const t = useTranslations("nav")
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 2)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })
    // Put keyboard focus back at the top of the page too
    document.getElementById("main")?.focus({ preventScroll: true })
  }

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label={t("backToTop")}
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
      className={cn(
        "fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-4 z-40 grid size-12 place-items-center rounded-full border-2 border-foreground bg-background shadow-lg transition-all duration-300 hover:-translate-y-0.5 md:bottom-6",
        show ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <ArrowUp aria-hidden className="size-5" />
    </button>
  )
}
