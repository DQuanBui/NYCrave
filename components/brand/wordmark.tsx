import { cn } from "@/lib/utils"

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        aria-hidden
        className="inline-grid size-8 place-items-center rounded-full bg-taxi text-[0.8rem] font-bold tracking-tighter text-taxi-foreground"
      >
        NY
      </span>
      <span aria-hidden className="font-display text-[1.65rem] leading-none tracking-wide">
        Crave
      </span>
      <span className="sr-only">NYCrave</span>
    </span>
  )
}
