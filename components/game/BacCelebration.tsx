'use client'

import { useEffect, useState } from 'react'
import Confetti from '@/components/shared/Confetti'

interface Props {
  winner: string | null  // username du gagnant
  isMe: boolean
}

export default function BacCelebration({ winner, isMe }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!winner) return
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(t)
  }, [winner])

  if (!visible || !winner) return null

  return (
    <>
      <Confetti active={visible} />
      <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
        <div className="text-center animate-pop">
          <div className="text-8xl mb-4">🛑</div>
          <h2 className="text-white font-black text-4xl mb-2">
            {isMe ? 'Tu as crié BAC !' : `${winner} a crié BAC !`}
          </h2>
          <p className="text-zinc-400 text-lg">
            {isMe ? '+1 point bonus 🎉' : 'La manche est terminée'}
          </p>
        </div>
      </div>
    </>
  )
}
