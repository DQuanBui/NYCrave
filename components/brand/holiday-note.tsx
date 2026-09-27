import { CalendarHeart } from "lucide-react"
import { useTranslations } from "next-intl"
import type { Holiday } from "@/lib/holidays"
import { cn } from "@/lib/utils"

/** "Thanksgiving: many places close…" for a plan date or today. */
export function HolidayNote({ holiday, className }: { holiday: Holiday; className?: string }) {
  const t = useTranslations("holidays")
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-xl px-3 py-2 text-sm",
        holiday.major ? "bg-taxi/25 font-semibold" : "bg-muted",
        className,
      )}
    >
      <CalendarHeart aria-hidden className="mt-0.5 size-4 shrink-0" />
      {t(holiday.major ? "major" : "minor", { name: t(`names.${holiday.key}`) })}
    </p>
  )
}
