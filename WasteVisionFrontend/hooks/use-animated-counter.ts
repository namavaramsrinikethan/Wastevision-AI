"use client"

import { useEffect, useRef, useState } from "react"

export function useAnimatedCounter(
  target: number,
  duration = 1400,
  shouldStart = true
) {
  const [count, setCount] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (!shouldStart || started.current) return
    started.current = true

    const startTime = performance.now()
    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
      else setCount(target)
    }
    requestAnimationFrame(step)
  }, [target, duration, shouldStart])

  return count
}
