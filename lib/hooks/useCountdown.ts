'use client'

import { useEffect, useRef, useState } from 'react'

export function useCountdown(initialSeconds: number, onExpire?: () => void) {
  const [remaining, setRemaining] = useState(initialSeconds)
  const [running, setRunning] = useState(true)
  const callbackRef = useRef(onExpire)
  callbackRef.current = onExpire

  useEffect(() => {
    if (!running) return
    if (remaining <= 0) {
      callbackRef.current?.()
      return
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(t)
  }, [remaining, running])

  return {
    remaining,
    running,
    pause: () => setRunning(false),
    resume: () => setRunning(true),
    reset: () => { setRemaining(initialSeconds); setRunning(true) },
    pct: (remaining / initialSeconds) * 100,
    isUrgent: remaining <= 10,
  }
}
