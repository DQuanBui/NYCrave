"use client"

import { Check, Share2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { cn } from "@/lib/utils"

type ShareButtonProps = {
  title: string
  /** Defaults to the current page. */
  url?: string
  className?: string
}

export function ShareButton({ title, url: shareUrl, className }: ShareButtonProps) {
  const t = useTranslations("place")
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = shareUrl ?? window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // Dismissed share sheet: nothing to do.
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked; the URL is still in the address bar.
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full border-2 border-foreground px-4 text-sm font-semibold transition-colors hover:bg-accent",
        className,
      )}
    >
      {copied ? (
        <Check aria-hidden className="size-4" />
      ) : (
        <Share2 aria-hidden className="size-4" />
      )}
      <span aria-live="polite">{copied ? t("linkCopied") : t("share")}</span>
    </button>
  )
}
