"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

type CopyButtonProps = {
  value: string
  label: string
  copiedLabel: string
  className?: string
}

export function CopyButton({ value, label, copiedLabel, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch {
          // Clipboard blocked; the value is visible on the page to copy by hand.
        }
      }}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border-2 border-foreground/15 px-3 text-xs font-semibold transition-colors hover:border-foreground",
        className,
      )}
    >
      {copied ? (
        <Check aria-hidden className="size-3.5" />
      ) : (
        <Copy aria-hidden className="size-3.5" />
      )}
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  )
}
