'use client'

import { useEffect, useState } from 'react'

interface Props {
  seconds: number
  onExpire: () => void
  paused?: boolean
}

export default function Timer({ seconds, onExpire, paused = false }: Props) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    if (paused || remaining <= 0) return

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onExpire()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [paused])

  const pct = (remaining / seconds) * 100
  const isUrgent = remaining <= 10

  return (
    <div className="flex flex-col items-end gap-1">
      <span className={`font-black text-2xl tabular-nums transition-colors ${
        isUrgent ? 'text-red-400' : 'text-white'
      }`}>
        {remaining}s
      </span>
      <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            isUrgent ? 'bg-red-400' : 'bg-yellow-400'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
