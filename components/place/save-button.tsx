"use client"

import { Heart } from "lucide-react"
import { motion } from "motion/react"
import { useTranslations } from "next-intl"
import { useHydrated } from "@/hooks/use-now"
import { useSaved } from "@/hooks/use-saved"
import { cn } from "@/lib/utils"

type SaveButtonProps = {
  slug: string
  name: string
  variant?: "overlay" | "outline"
  className?: string
}

export function SaveButton({ slug, name, variant = "overlay", className }: SaveButtonProps) {
  const t = useTranslations("place")
  const { isSaved, toggle } = useSaved()
  const hydrated = useHydrated()
  const saved = hydrated && isSaved(slug)

  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={saved}
      aria-label={saved ? t("unsave", { name }) : t("save", { name })}
      className={cn(
        "grid size-10 place-items-center rounded-full transition-colors",
        variant === "overlay"
          ? "bg-white/90 text-[#1d1f21] shadow-sm backdrop-blur hover:bg-white"
          : "border-2 border-foreground hover:bg-accent",
        className,
      )}
    >
      <motion.span
        key={saved ? "saved" : "unsaved"}
        initial={saved ? { scale: 0.4 } : false}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
        className="grid place-items-center"
      >
        <Heart
          aria-hidden
          className={cn("size-5", saved && "fill-line-red text-line-red")}
          strokeWidth={2.25}
        />
      </motion.span>
    </button>
  )
}
