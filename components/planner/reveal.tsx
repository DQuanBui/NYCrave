import { cn } from "@/lib/utils"

/**
 * Stops slide onto the route one after another. Pure CSS, so the timeline paints
 * without waiting for JavaScript; the global reduced-motion rule turns it off.
 */
export function Reveal({
  index,
  children,
  className,
}: {
  index: number
  children: React.ReactNode
  className?: string
}) {
  return (
    <li
      style={{ animationDelay: `${index * 80}ms` }}
      className={cn(
        "animate-in duration-500 ease-(--ease-out-quint) fill-mode-both fade-in slide-in-from-left-3",
        className,
      )}
    >
      {children}
    </li>
  )
}
