"use client"

import { motion } from "motion/react"

/** Stops slide onto the route one after another. Reduced motion is honored by MotionConfig. */
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
    <motion.li
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.08 * index, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.li>
  )
}
