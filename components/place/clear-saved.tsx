"use client"

import { Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { useSaved } from "@/hooks/use-saved"
import { cn } from "@/lib/utils"

/**
 * "Clear all" for saved places, with a second tap to confirm (the first tap
 * only arms it for a few seconds), since nothing brings the list back.
 */
export function ClearSaved({ className }: { className?: string }) {
  const t = useTranslations("saved")
  const { clear } = useSaved()
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!armed) return
    const timer = setTimeout(() => setArmed(false), 4000)
    return () => clearTimeout(timer)
  }, [armed])

  return (
    <button
      type="button"
      onClick={() => {
        if (!armed) return setArmed(true)
        clear()
        setArmed(false)
      }}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full border-2 px-4 text-sm font-semibold transition-colors",
        armed
          ? "border-[#b3261e] bg-[#b3261e] text-white"
          : "border-foreground/15 hover:border-foreground",
        className,
      )}
    >
      <Trash2 aria-hidden className="size-4" />
      <span aria-live="polite">{armed ? t("clearConfirm") : t("clearAll")}</span>
    </button>
  )
}
