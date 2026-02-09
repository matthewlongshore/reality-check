"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"

interface AnimatedNumberProps {
  value: number
  duration?: number
  delay?: number
  suffix?: string
  className?: string
}

export function AnimatedNumber({
  value,
  duration = 1.5,
  delay = 0,
  suffix = "%",
  className = "",
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!isInView || hasAnimated.current) return
    hasAnimated.current = true

    const startTime = Date.now()
    const delayMs = delay * 1000
    const durationMs = duration * 1000

    const timer = setTimeout(() => {
      const animate = () => {
        const elapsed = Date.now() - startTime - delayMs
        const progress = Math.min(elapsed / durationMs, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplayValue(Math.round(eased * value))

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      animate()
    }, delayMs)

    return () => clearTimeout(timer)
  }, [isInView, value, duration, delay])

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.3, delay }}
    >
      {displayValue}
      {suffix}
    </motion.span>
  )
}
