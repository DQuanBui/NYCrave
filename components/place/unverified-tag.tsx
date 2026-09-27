import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export function UnverifiedTag({ className }: { className?: string }) {
  const t = useTranslations("place")
  return (
    <span
      title={t("unverifiedHint")}
      className={cn(
        "shrink-0 rounded-sm border border-dashed border-muted-foreground/60 px-1.5 py-px text-[0.7rem] font-semibold text-muted-foreground",
        className,
      )}
    >
      {t("unverified")}
      <span className="sr-only">: {t("unverifiedHint")}</span>
    </span>
  )
}
