"use client"

import { Download } from "lucide-react"
import { useSyncExternalStore } from "react"

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<unknown> }

// Browsers that can install the site fire this once; keep it for the button
let deferred: InstallPrompt | null = null
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault()
    deferred = e as InstallPrompt
    notify()
  })
  window.addEventListener("appinstalled", () => {
    deferred = null
    notify()
  })
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

/**
 * "Install the app", shown only where the browser offers installing NYCrave
 * (Chrome, Edge, Android). Elsewhere it renders nothing.
 */
export function InstallButton({ label, className }: { label: string; className?: string }) {
  const available = useSyncExternalStore(
    subscribe,
    () => deferred !== null,
    () => false,
  )
  if (!available) return null
  return (
    <button
      type="button"
      onClick={async () => {
        const prompt = deferred
        if (!prompt) return
        await prompt.prompt()
        await prompt.userChoice
        deferred = null
        notify()
      }}
      className={className}
    >
      <Download aria-hidden className="size-4" />
      {label}
    </button>
  )
}
