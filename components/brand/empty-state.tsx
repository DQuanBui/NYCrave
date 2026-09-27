import { LineBullet } from "@/components/brand/line-bullet"
import type { LineColor } from "@/lib/lines"
import { cn } from "@/lib/utils"

type EmptyStateProps = {
  title: string
  body: string
  action?: React.ReactNode
  line?: LineColor
  bullet?: React.ReactNode
  as?: "h1" | "h2" | "h3"
  className?: string
}

/** A "service change" notice: the sign riders see when a line is not running. */
export function EmptyState({
  title,
  body,
  action,
  line = "gray",
  bullet = "!",
  as: Heading = "h2",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border-2 border-dashed border-foreground/80 px-6 py-10 text-center sm:px-10",
        className,
      )}
    >
      <div className="mx-auto flex max-w-md flex-col items-center gap-4">
        <LineBullet line={line} size="xl">
          {bullet}
        </LineBullet>
        <Heading className="font-display text-display-md">{title}</Heading>
        <p className="leading-relaxed text-pretty text-muted-foreground">{body}</p>
        {action ? <div className="pt-2">{action}</div> : null}
      </div>
    </div>
  )
}
