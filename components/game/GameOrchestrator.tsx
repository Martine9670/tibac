'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/lib/stores/gameStore'
import { useRoom, usePlayers, useRound, useAnswers, useScores } from '@/lib/hooks/useRealtime'
import { usePresence } from '@/lib/hooks/usePresence'
import { createClient } from '@/lib/supabase/client'
import LetterReveal from '@/components/game/LetterReveal'
import PlayingPhase from '@/components/game/PlayingPhase'
import VotingPhase from '@/components/game/VotingPhase'
import RoundSummary from '@/components/game/RoundSummary'
import ScoreBoard from '@/components/game/ScoreBoard'
import BacCelebration from '@/components/game/BacCelebration'
import LoadingScreen from '@/components/shared/LoadingScreen'
import type { Room, RoomPlayer, Round, Category } from '@/types/game.types'

interface Props {
  room: Room
  initialRound: Round | null
  initialPlayers: RoomPlayer[]
  categories: Category[]
  currentUserId: string
  currentUsername: string
  initialScores: any[]
}

const supabase = createClient()

export default function GameOrchestrator({
  room, initialRound, initialPlayers, categories, currentUserId, currentUsername, initialScores,
}: Props) {
  const router = useRouter()
  const {
    setRoom, setPlayers, setCategories, setCurrentRound,
    setPhase, phase, currentRound, players,
  } = useGameStore()

  const [bacWinner, setBacWinner] = useState<{ username: string; isMe: boolean } | null>(null)
  const [reconnecting, setReconnecting] = useState(false)

  useEffect(() => {
    setRoom(room)
    setPlayers(initialPlayers)
    setCategories(categories)
    if (initialRound) {
      setCurrentRound(initialRound)
      if (initialRound.status === 'active') setPhase('playing')
      else if (initialRound.status === 'voting') setPhase('voting')
      else if (initialRound.status === 'finished') setPhase('round-summary')
    }
  }, [])

  useRoom(room.id)
  usePlayers(room.id)
  useRound(room.id)
  useAnswers(currentRound?.id ?? null)
  useScores(currentRound?.id ?? null)
  usePresence(room.id, currentUserId, currentUsername)

  useEffect(() => {
    if (!currentRound?.winner_id) return
    const winner = players.find((p) => p.player_id === currentRound.winner_id)
    const username = (winner as any)?.profiles?.username ?? 'Un joueur'
    setBacWinner({ username, isMe: currentRound.winner_id === currentUserId })
  }, [currentRound?.winner_id])

  useEffect(() => {
    function handleOnline() {
      setReconnecting(true)
      supabase.from('rounds')
        .select('*')
        .eq('room_id', room.id)
        .order('round_number', { ascending: false })
        .limit(1)
        .single()
        .then(({ data }) => {
          if (data) {
            setCurrentRound(data as Round)
            if (data.status === 'active') setPhase('playing')
            else if (data.status === 'voting') setPhase('voting')
            else if (data.status === 'finished') setPhase('round-summary')
          }
          setReconnecting(false)
        })
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [room.id])

  useEffect(() => {
    if (phase === 'finished') router.push(`/game/${room.code}/results`)
  }, [phase])

  if (reconnecting) return <LoadingScreen message="Reconnexion en cours..." />

  return (
    <main className="min-h-screen bg-zinc-950">
      <BacCelebration
        winner={bacWinner?.username ?? null}
        isMe={bacWinner?.isMe ?? false}
      />
      <ScoreBoard roomId={room.id} currentUserId={currentUserId} />
      <div className="px-4 pb-10">
        {phase === 'lobby' && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-zinc-500 animate-pulse">En attente du démarrage...</p>
          </div>
        )}
        {phase === 'letter-reveal' && currentRound && (
          <LetterReveal
            letter={currentRound.letter}
            roundNumber={currentRound.round_number}
            totalRounds={room.round_count}
            onDone={() => setPhase('playing')}
          />
        )}
        {phase === 'playing' && currentRound && (
          <PlayingPhase
            round={currentRound}
            categories={categories}
            timeLimit={room.time_limit}
            currentUserId={currentUserId}
            isHost={room.host_id === currentUserId}
          />
        )}
        {phase === 'voting' && currentRound && (
          <VotingPhase
            round={currentRound}
            categories={categories}
            currentUserId={currentUserId}
            isHost={room.host_id === currentUserId}
            roomId={room.id}
          />
        )}
        {phase === 'round-summary' && currentRound && (
          <RoundSummary
            round={currentRound}
            totalRounds={room.round_count}
            roomId={room.id}
            isHost={room.host_id === currentUserId}
          />
        )}
      </div>
    </main>
  )
}
