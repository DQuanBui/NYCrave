import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import { LineBullet } from "@/components/brand/line-bullet"
import { Link } from "@/i18n/navigation"
import { LINES, type LineColor } from "@/lib/lines"
import { cn } from "@/lib/utils"
import type { Photo } from "@/types/place"

type SectionHeaderProps = {
  line: LineColor
  bullet: React.ReactNode
  title: string
  tagline: string
  back?: { href: string; label: string }
  /** Up to three photos pinned like prints on the right, on large screens. */
  photos?: Photo[]
}

const TILTS = ["-rotate-6 translate-y-3", "rotate-3 -translate-y-2", "-rotate-2 translate-y-4"]

/** Page header for a line: route-color rule, big bullet, poster headline. */
export function SectionHeader({
  line,
  bullet,
  title,
  tagline,
  back,
  photos = [],
}: SectionHeaderProps) {
  const prints = photos.slice(0, 3)
  return (
    <header className="relative overflow-hidden border-b">
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-2 origin-left animate-[line-draw_0.9s_cubic-bezier(0.65,0,0.35,1)_both]",
          LINES[line].bg,
        )}
      />
      <div className="mx-auto flex max-w-7xl items-end gap-8 px-4 pt-10 pb-8 lg:px-8 lg:pt-14">
        <div className="min-w-0 flex-1">
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
            <LineBullet
              line={line}
              size="xl"
              className="mb-1 animate-[bullet-roll_0.9s_cubic-bezier(0.2,0.9,0.3,1.05)_0.1s_both] sm:size-20 sm:text-4xl"
            >
              {bullet}
            </LineBullet>
            <div className="min-w-0 space-y-2">
              <h1 className="font-display text-display-xl text-balance">{title}</h1>
              <p className="max-w-xl text-lg text-muted-foreground">{tagline}</p>
            </div>
          </div>
        </div>
        {prints.length ? (
          <div aria-hidden className="relative hidden shrink-0 items-end lg:flex">
            {prints.map((photo, i) => (
              <div
                key={photo.url}
                style={{ animationDelay: `${300 + i * 140}ms` }}
                className={cn(
                  "relative -ml-6 size-36 animate-[print-drop_0.6s_cubic-bezier(0.2,0.9,0.3,1.1)_both] overflow-hidden rounded-md border-[6px] border-white bg-white shadow-lg first:ml-0 xl:size-40",
                  TILTS[i],
                )}
              >
                <Image src={photo.url} alt="" fill sizes="160px" className="object-cover" />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  )
}
