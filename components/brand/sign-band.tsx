import { cn } from "@/lib/utils"

type SignBandProps = {
  title: string
  /** Line bullets shown to the right of the title, like a platform sign. */
  bullets?: React.ReactNode
  action?: React.ReactNode
  as?: "h1" | "h2" | "h3"
  id?: string
  className?: string
}

/** Section heading styled as a subway station sign. */
export function SignBand({
  title,
  bullets,
  action,
  as: Heading = "h2",
  id,
  className,
}: SignBandProps) {
  return (
    <div
      className={cn(
        "flex min-h-14 items-center gap-3 rounded-md sign-band px-4 pt-3.5 pb-2.5",
        className,
      )}
    >
      <Heading id={id} className="text-xl leading-none font-semibold tracking-tight sm:text-2xl">
        {title}
      </Heading>
      {bullets ? <div className="flex items-center gap-1">{bullets}</div> : null}
      {action ? <div className="ml-auto shrink-0">{action}</div> : null}
    </div>
  )
}
