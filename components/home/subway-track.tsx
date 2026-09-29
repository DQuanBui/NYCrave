"use client"

import { AnimatePresence, useReducedMotion } from "motion/react"
import * as m from "motion/react-m"
import { LINES, type LineColor } from "@/lib/lines"
import { cn } from "@/lib/utils"

/** Route colors along the track, in the order of the site's lines. */
const SEGMENTS: LineColor[] = ["red", "orange", "yellow", "green", "blue", "purple"]
const STOPS = [8, 30, 58, 84]

/**
 * A line with a train that pulls into the station for each "next stop". When the
 * destination changes, the train leaves to the right and the next one arrives.
 */
export function SubwayTrack({
  trainKey,
  line,
  bullet,
  className,
}: {
  trainKey: string
  line: LineColor
  bullet: string
  className?: string
}) {
  const reduce = useReducedMotion()
  const duration = reduce ? 0 : 1.6

  return (
    <div aria-hidden className={cn("relative h-12 overflow-hidden", className)}>
      <div className="absolute inset-x-0 top-1/2 flex h-1.5 -translate-y-1/2 overflow-hidden rounded-full">
        {SEGMENTS.map((c) => (
          <span key={c} className={cn("h-full flex-1", LINES[c].bg)} />
        ))}
      </div>
      {STOPS.map((left) => (
        <span
          key={left}
          style={{ left: `${left}%` }}
          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-foreground bg-background"
        />
      ))}
      <AnimatePresence initial>
        <m.div
          key={trainKey}
          className="absolute top-0 flex h-full items-center"
          initial={{ left: "-30%" }}
          animate={{
            left: "44%",
            transition: { duration, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.35 },
          }}
          exit={{
            left: "115%",
            transition: { duration: reduce ? 0 : 0.9, ease: [0.55, 0, 0.9, 0.4] },
          }}
        >
          <TrainCar line={line} bullet={bullet} />
        </m.div>
      </AnimatePresence>
    </div>
  )
}

/** A stainless-steel subway car, side view, with the line's bullet on its nose. */
function TrainCar({ line, bullet }: { line: LineColor; bullet: string }) {
  const color = LINES[line].hex
  return (
    <svg
      viewBox="0 0 132 40"
      className="h-10 w-[8.25rem] drop-shadow-[0_6px_8px_rgba(29,31,33,0.25)]"
    >
      <rect
        x="1.5"
        y="3"
        width="124"
        height="28"
        rx="9"
        fill="#d7dbe0"
        stroke="#1d1f21"
        strokeWidth="2.5"
      />
      <rect x="1.5" y="22" width="124" height="4" fill={color} />
      {[10, 34, 58, 82].map((x) => (
        <rect key={x} x={x} y="9" width="16" height="9" rx="2" fill="#1d1f21" />
      ))}
      {[29, 77].map((x) => (
        <line key={x} x1={x} y1="6" x2={x} y2="30" stroke="#9aa1a9" strokeWidth="1.5" />
      ))}
      <circle cx="113" cy="14" r="8" fill={color} stroke="#1d1f21" strokeWidth="1.5" />
      <text
        x="113"
        y="17.8"
        textAnchor="middle"
        fontSize="11"
        fontWeight="800"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fill={line === "yellow" || line === "orange" || line === "lime" ? "#1d1f21" : "#fff"}
      >
        {bullet}
      </text>
      <circle cx="24" cy="34" r="4" fill="#1d1f21" />
      <circle cx="104" cy="34" r="4" fill="#1d1f21" />
    </svg>
  )
}
