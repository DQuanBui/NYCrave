import { cn } from "@/lib/utils"
import { LINES, type LineColor } from "@/lib/lines"

const SIZES = {
  xs: "size-5 text-[0.7rem]",
  sm: "size-6 text-xs",
  md: "size-8 text-sm",
  lg: "size-11 text-lg",
  xl: "size-14 text-2xl",
} as const

type LineBulletProps = {
  line: LineColor
  children: React.ReactNode
  size?: keyof typeof SIZES
  /** Accessible name. Omit when a visible label sits next to the bullet. */
  label?: string
  className?: string
}

/** A subway route bullet: the circle-with-a-letter sign used on every MTA map. */
export function LineBullet({ line, children, size = "md", label, className }: LineBulletProps) {
  const color = LINES[line]
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full leading-none font-bold select-none",
        color.bg,
        color.fg,
        SIZES[size],
        className,
      )}
    >
      {children}
    </span>
  )
}
