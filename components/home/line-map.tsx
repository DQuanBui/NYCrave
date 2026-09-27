import { ArrowRight, Map as MapIcon } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { LineBullet } from "@/components/brand/line-bullet"
import { SignBand } from "@/components/brand/sign-band"
import { Link } from "@/i18n/navigation"
import { LINES } from "@/lib/lines"
import { CATEGORY_META } from "@/lib/taxonomy"
import { cn } from "@/lib/utils"
import { CATEGORIES } from "@/types/enums"
import type { Category } from "@/types/place"

/** Every section as a line on a subway-tile wall, right under the hero. */
export async function LineMap({ counts }: { counts: Record<Category, number> }) {
  const t = await getTranslations()
  return (
    <section aria-labelledby="lines-title" className="subway-tiles py-10 lg:py-14">
      <div className="mx-auto max-w-7xl space-y-5 px-4 lg:px-8">
        <SignBand
          id="lines-title"
          title={t("home.linesTitle")}
          bullets={CATEGORIES.map((c) => (
            <LineBullet key={c} line={CATEGORY_META[c].line} size="xs">
              {CATEGORY_META[c].bullet}
            </LineBullet>
          ))}
          action={
            <Link
              href="/map"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold hover:bg-white/10"
            >
              <MapIcon aria-hidden className="size-4" />
              <span className="sm:hidden">{t("nav.map")}</span>
              <span className="hidden sm:inline">{t("home.seeMap")}</span>
            </Link>
          }
        />
        <ol className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {CATEGORIES.map((category) => {
            const meta = CATEGORY_META[category]
            return (
              <li key={category}>
                <Link
                  href={meta.href}
                  className="group relative flex h-full flex-col gap-3 overflow-hidden rounded-xl bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
                >
                  <span
                    aria-hidden
                    className={cn("absolute inset-x-0 top-0 h-1.5", LINES[meta.line].bg)}
                  />
                  <span className="flex items-center justify-between gap-2">
                    <LineBullet line={meta.line} size="lg">
                      {meta.bullet}
                    </LineBullet>
                    <ArrowRight
                      aria-hidden
                      className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1"
                    />
                  </span>
                  <span className="font-display text-2xl leading-none sm:text-3xl">
                    {t(`categories.${category}.title`)}
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                    {t("home.linesCount", { count: counts[category] })}
                  </span>
                  <span className="hidden text-sm leading-relaxed text-muted-foreground sm:block">
                    {t(`categories.${category}.tagline`)}
                  </span>
                </Link>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
