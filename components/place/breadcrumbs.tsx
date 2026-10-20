import { ChevronRight } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { LineBullet } from "@/components/brand/line-bullet"
import { Link } from "@/i18n/navigation"
import type { LineColor } from "@/lib/lines"

export type Crumb = { label: string; href: string }

/** Where a page sits: Home › Eat › Lower East Side, with the line's bullet on the section. */
export async function Breadcrumbs({
  crumbs,
  line,
  bullet,
  children,
}: {
  crumbs: Crumb[]
  line: LineColor
  bullet: string
  children?: React.ReactNode
}) {
  const t = await getTranslations("breadcrumb")
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold">
      <nav aria-label={t("label")}>
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          {crumbs.map((crumb, i) => (
            <li key={crumb.href} className="flex items-center gap-1.5">
              {i > 0 ? (
                <ChevronRight aria-hidden className="size-3.5 text-muted-foreground" />
              ) : null}
              <Link
                href={crumb.href}
                className="inline-flex items-center gap-1.5 rounded-full underline-offset-4 hover:underline"
              >
                {i === 1 ? (
                  <LineBullet line={line} size="xs">
                    {bullet}
                  </LineBullet>
                ) : null}
                {crumb.label}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
      {children}
    </div>
  )
}
