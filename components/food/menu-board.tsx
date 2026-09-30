import { cn } from "@/lib/utils"

/**
 * A deli's felt letter board: white plastic letters pressed into the grooves one
 * by one, each a little crooked, with a neon OPEN sign flickering on in the corner.
 */
export function MenuBoard({ text, className }: { text: string; className?: string }) {
  let i = 0
  return (
    <div
      aria-hidden
      className={cn(
        "relative overflow-hidden rounded-3xl border-[10px] border-[#6b4a2f] bg-[#232427] px-5 pt-10 pb-8 shadow-[inset_0_2px_12px_rgba(0,0,0,0.6)] sm:px-10 sm:pt-14 sm:pb-12",
        className,
      )}
      style={{
        backgroundImage:
          "repeating-linear-gradient(to bottom, transparent 0 13px, rgba(0,0,0,0.38) 13px 15px)",
      }}
    >
      <span className="absolute top-3 right-4 animate-[neon-on_1.6s_steps(1,end)_0.6s_both] rounded-lg border-2 border-[#ff4d6d] px-2 py-0.5 font-display text-lg tracking-wider text-[#ff4d6d] shadow-[0_0_12px_#ff4d6d,inset_0_0_8px_#ff4d6d] [text-shadow:0_0_6px_#ff4d6d,0_0_18px_#ff4d6d] sm:top-4 sm:right-5 sm:text-2xl">
        OPEN
      </span>
      <p className="flex flex-wrap gap-x-[0.5em] gap-y-2 font-sans text-[clamp(2rem,7vw,4.5rem)] leading-none font-extrabold tracking-[0.06em] text-[#f4f1ea]">
        {text.split(" ").map((word, w) => (
          <span key={w} className="inline-flex whitespace-nowrap">
            {Array.from(word).map((ch) => {
              const n = i++
              // Deterministic "hand-placed" wobble per letter
              const tilt = ((n * 37) % 7) - 3
              const lift = ((n * 53) % 5) - 2
              return (
                <span
                  key={n}
                  style={
                    {
                      "--i": n,
                      rotate: `${tilt * 0.6}deg`,
                      translate: `0 ${lift}px`,
                    } as React.CSSProperties
                  }
                  className="inline-block animate-[letter-press_0.45s_cubic-bezier(0.3,1.4,0.5,1)_both] [animation-delay:calc(var(--i)*45ms+150ms)] [text-shadow:0_2px_0_rgba(0,0,0,0.35)]"
                >
                  {ch}
                </span>
              )
            })}
          </span>
        ))}
      </p>
    </div>
  )
}
