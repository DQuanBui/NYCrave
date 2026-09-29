"use client"

import { useReducedMotion } from "motion/react"
import * as m from "motion/react-m"
import { useMemo } from "react"

const COLORS = ["#ee352e", "#ff6319", "#fccc0a", "#00933c", "#0039a6", "#b933ad", "#6cbe45"]

/**
 * A one-shot burst of subway-colored confetti from a point on screen.
 * Renders nothing for reduced motion. Remount (change `key`) to fire again.
 */
export function Confetti({ x, y, count = 36 }: { x: number; y: number; count?: number }) {
  const reduce = useReducedMotion()
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        // Spread evenly around the circle with a little jitter, biased upward
        const angle = (i / count) * Math.PI * 2 + Math.sin(i * 12.9898) * 0.4
        const speed = 90 + ((i * 37) % 110)
        return {
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed - 80,
          rotate: ((i * 83) % 540) - 270,
          color: COLORS[i % COLORS.length],
          round: i % 3 === 0,
          size: 6 + (i % 4) * 2,
        }
      }),
    [count],
  )
  if (reduce) return null

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p, i) => (
        <m.span
          key={i}
          className="absolute block"
          style={{
            left: x,
            top: y,
            width: p.size,
            height: p.round ? p.size : p.size * 0.45,
            borderRadius: p.round ? "9999px" : "2px",
            background: p.color,
          }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 0.6 }}
          animate={{
            x: [0, p.dx, p.dx * 1.15],
            y: [0, p.dy, p.dy + 220],
            rotate: p.rotate,
            opacity: [1, 1, 0],
            scale: 1,
          }}
          transition={{ duration: 1.4, ease: [0.2, 0.8, 0.4, 1], times: [0, 0.35, 1] }}
        />
      ))}
    </div>
  )
}
