import { getTranslations } from "next-intl/server"
import { LineBullet } from "@/components/brand/line-bullet"
import { Link } from "@/i18n/navigation"
import { LINES } from "@/lib/lines"
import { CATEGORY_META } from "@/lib/taxonomy"
import { cn } from "@/lib/utils"
import { CATEGORIES } from "@/types/enums"
import type { Category } from "@/types/place"

/** Categories drawn as a strip map: one colored line per section, stations stacked like a route. */
export async function LineMap({ counts }: { counts: Record<Category, number> }) {
  const t = await getTranslations()
  return (
    <section aria-labelledby="lines-title" className="space-y-6">
      <h2 id="lines-title" className="font-display text-display-lg">
        {t("home.linesTitle")}
      </h2>
      <ol className="grid gap-x-10 md:grid-cols-2">
        {CATEGORIES.map((category) => {
          const meta = CATEGORY_META[category]
          const line = LINES[meta.line]
          return (
            <li key={category} className="group relative">
              <Link
                href={meta.href}
                className="relative flex gap-5 py-4 pr-3 pl-1 transition-colors hover:bg-accent/70"
              >
                <span className="relative flex w-11 shrink-0 justify-center">
                  <span aria-hidden className={cn("absolute -inset-y-4 w-2", line.bg)} />
                  <LineBullet
                    line={meta.line}
                    size="lg"
                    className="relative ring-4 ring-background"
                  >
                    {meta.bullet}
                  </LineBullet>
                </span>
                <span className="min-w-0 pt-1">
                  <span className="flex items-baseline gap-3">
                    <span className="font-display text-display-sm sm:text-3xl">
                      {t(`categories.${category}.title`)}
                    </span>
                    <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                      {t("home.linesCount", { count: counts[category] })}
                    </span>
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                    {t(`categories.${category}.tagline`)}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
