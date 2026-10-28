"use client"

import { Keyboard, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { Dialog } from "radix-ui"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "@/i18n/navigation"

/** Fired by the footer link to open the list without a keyboard. */
export const OPEN_SHORTCUTS_EVENT = "nycrave:shortcuts"

const typing = (el: Element | null) =>
  el instanceof HTMLInputElement ||
  el instanceof HTMLTextAreaElement ||
  el instanceof HTMLSelectElement ||
  (el instanceof HTMLElement && el.isContentEditable)

const SHORTCUTS = [
  { keys: ["/"], label: "search" },
  { keys: ["?"], label: "help" },
  { keys: ["←", "→"], label: "photos" },
  { keys: ["Esc"], label: "close" },
] as const

/** "g" then a letter jumps to a main page, like Gmail and GitHub. */
const GO = [
  { key: "h", href: "/", page: "home" },
  { key: "m", href: "/map", page: "map" },
  { key: "s", href: "/saved", page: "saved" },
  { key: "d", href: "/my-day", page: "myDay" },
  { key: "t", href: "/tonight", page: "tonight" },
] as const
/** How long after "g" the second key still counts. */
const GO_WINDOW_MS = 1500

/** Press "?" anywhere for the site's keyboard shortcuts. */
export function ShortcutsDialog() {
  const t = useTranslations("shortcuts")
  const tNav = useTranslations("nav")
  const router = useRouter()
  const [open, setOpen] = useState(false)
  /** When "g" was last pressed, so a following letter can jump to a page. */
  const goAt = useRef(0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return
      if (typing(document.activeElement)) return
      if (e.key === "?") {
        e.preventDefault()
        setOpen(true)
        return
      }
      const go = GO.find((g) => g.key === e.key)
      if (go && Date.now() - goAt.current < GO_WINDOW_MS) {
        e.preventDefault()
        goAt.current = 0
        setOpen(false)
        router.push(go.href)
        return
      }
      goAt.current = e.key === "g" ? Date.now() : 0
    }
    const onOpen = () => setOpen(true)
    window.addEventListener("keydown", onKey)
    window.addEventListener(OPEN_SHORTCUTS_EVENT, onOpen)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener(OPEN_SHORTCUTS_EVENT, onOpen)
    }
  }, [router])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(26rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 space-y-4 rounded-2xl border bg-card p-6 shadow-2xl outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div className="flex items-start justify-between gap-4">
            <Dialog.Title className="flex items-center gap-2 text-lg font-bold">
              <Keyboard aria-hidden className="size-5" />
              {t("title")}
            </Dialog.Title>
            <Dialog.Close className="grid size-9 place-items-center rounded-full hover:bg-accent">
              <X aria-hidden className="size-4" />
              <span className="sr-only">{t("close")}</span>
            </Dialog.Close>
          </div>
          <Dialog.Description className="text-sm text-muted-foreground">
            {t("intro")}
          </Dialog.Description>
          <dl className="space-y-3">
            {SHORTCUTS.map(({ keys, label }) => (
              <div key={label} className="flex items-center justify-between gap-4">
                <dt className="text-sm">{t(label)}</dt>
                <dd className="flex gap-1">
                  {keys.map((k) => (
                    <kbd
                      key={k}
                      className="grid min-w-8 place-items-center rounded-md border-2 border-b-4 border-foreground/20 bg-muted px-2 py-0.5 font-mono text-sm font-bold"
                    >
                      {k}
                    </kbd>
                  ))}
                </dd>
              </div>
            ))}
            {GO.map(({ key, page }) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <dt className="text-sm">{t("goTo", { page: tNav(page) })}</dt>
                <dd className="flex gap-1">
                  {["g", key].map((k) => (
                    <kbd
                      key={k}
                      className="grid min-w-8 place-items-center rounded-md border-2 border-b-4 border-foreground/20 bg-muted px-2 py-0.5 font-mono text-sm font-bold"
                    >
                      {k}
                    </kbd>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-muted-foreground">{t("sequence")}</p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/** The footer's way in, for people who don't know to press "?". */
export function ShortcutsLink({ className, label }: { className?: string; label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_SHORTCUTS_EVENT))}
      className={className}
    >
      {label}
    </button>
  )
}
