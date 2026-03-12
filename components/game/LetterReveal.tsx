'use client'

import { useEffect, useState } from 'react'

interface Props {
  letter: string
  roundNumber: number
  totalRounds: number
  onDone: () => void
}

export default function LetterReveal({ letter, roundNumber, totalRounds, onDone }: Props) {
  const [stage, setStage] = useState<'intro' | 'reveal' | 'go'>('intro')

  useEffect(() => {
    const t1 = setTimeout(() => setStage('reveal'), 800)
    const t2 = setTimeout(() => setStage('go'), 2200)
    const t3 = setTimeout(() => onDone(), 3200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] select-none">
      {/* Manche */}
      <p className="text-zinc-500 text-sm font-medium mb-8 tracking-widest uppercase">
        Manche {roundNumber} / {totalRounds}
      </p>

      {/* Lettre */}
      <div
        className={`transition-all duration-500 ${
          stage === 'intro'
            ? 'opacity-0 scale-50'
            : stage === 'reveal'
            ? 'opacity-100 scale-100'
            : 'opacity-100 scale-125'
        }`}
      >
        <div className="relative">
          {/* Glow */}
          <div className="absolute inset-0 rounded-3xl bg-yellow-400 blur-3xl opacity-30 scale-110" />
          <div className="relative bg-yellow-400 text-zinc-900 font-black text-[10rem] leading-none w-56 h-56 flex items-center justify-center rounded-3xl shadow-2xl">
            {letter}
          </div>
        </div>
      </div>

      {/* GO */}
      <div
        className={`mt-12 transition-all duration-300 ${
          stage === 'go' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}
      >
        <p className="text-white font-black text-4xl tracking-widest">C&apos;EST PARTI !</p>
      </div>
    </div>
  )
}
