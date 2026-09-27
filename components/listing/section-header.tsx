import { ArrowLeft } from "lucide-react"
import { LineBullet } from "@/components/brand/line-bullet"
import { Link } from "@/i18n/navigation"
import { LINES, type LineColor } from "@/lib/lines"
import { cn } from "@/lib/utils"

type SectionHeaderProps = {
  line: LineColor
  bullet: React.ReactNode
  title: string
  tagline: string
  back?: { href: string; label: string }
}

/** Page header for a line: route-color rule, big bullet, poster headline. */
export function SectionHeader({ line, bullet, title, tagline, back }: SectionHeaderProps) {
  return (
    <header className="relative overflow-hidden border-b">
      <span aria-hidden className={cn("absolute inset-x-0 top-0 h-2", LINES[line].bg)} />
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-8 lg:px-8 lg:pt-14">
        {back ? (
          <Link
            href={back.href}
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft aria-hidden className="size-4" />
            {back.label}
          </Link>
        ) : null}
        <div className="flex items-end gap-5">
          <LineBullet line={line} size="xl" className="mb-1 sm:size-20 sm:text-4xl">
            {bullet}
          </LineBullet>
          <div className="min-w-0 space-y-2">
            <h1 className="font-display text-display-xl text-balance">{title}</h1>
            <p className="max-w-xl text-lg text-muted-foreground">{tagline}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
