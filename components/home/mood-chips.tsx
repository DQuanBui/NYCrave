import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { MOODS } from "@/lib/home"
import { cn } from "@/lib/utils"

export function MoodChips({ className }: { className?: string }) {
  const t = useTranslations("moods")
  return (
    <nav aria-label={t("title")} className={className}>
      <ul
        className={cn(
          "relative -mx-4 scrollbar-none flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0",
        )}
      >
        <li className="shrink-0">
          <Link
            href="/next"
            className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-foreground bg-foreground px-4 text-sm font-semibold text-background transition-transform hover:-translate-y-px"
          >
            <span aria-hidden>📍</span>
            {t("whatsNext")}
          </Link>
        </li>
        <li className="shrink-0">
          <Link
            href="/walks"
            className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-line-green bg-card px-4 text-sm font-semibold transition-colors hover:bg-line-green hover:text-white"
          >
            <span aria-hidden>🥾</span>
            {t("walks")}
          </Link>
        </li>
        {MOODS.map((mood) => (
          <li key={mood.key} className="shrink-0">
            <Link
              href={{ pathname: "/search", query: { q: mood.query } }}
              className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-foreground/15 bg-card px-4 text-sm font-semibold transition-colors hover:border-foreground"
            >
              <span aria-hidden>{mood.emoji}</span>
              {t(mood.key)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
