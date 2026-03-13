import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useGameStore } from '@/lib/stores/gameStore'
import type { Room, RoomPlayer, Round, Answer, Score } from '@/types/game.types'

const supabase = createClient()

// ============================================================
// useRoom — écoute les changements de statut de la salle
// ============================================================
export function useRoom(roomId: string) {
  const setRoom = useGameStore((s) => s.setRoom)
  const setPhase = useGameStore((s) => s.setPhase)
  const setCurrentRound = useGameStore((s) => s.setCurrentRound)

  useEffect(() => {
    if (!roomId) return

    // Polling de secours toutes les 3s pour attraper les événements manqués
    let lastRoomStatus = ''
    let lastRoundId = ''
    const poll = setInterval(async () => {
      const { data: room } = await supabase.from('rooms').select('*').eq('id', roomId).single()
      if (!room) return
      // Ne mettre à jour que si le statut a changé
      if (room.status !== lastRoomStatus) {
        lastRoomStatus = room.status
        setRoom(room)
        if (room.status === 'finished') setPhase('finished')
      }
      if (room.status === 'playing') {
        const { data: round } = await supabase
          .from('rounds').select('*').eq('room_id', roomId).eq('status', 'active').single()
        // Ne mettre à jour que si c'est un nouveau round
        if (round && round.id !== lastRoundId) {
          lastRoundId = round.id
          setCurrentRound(round)
          setPhase('letter-reveal')
        }
      }
    }, 3000)

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          const room = payload.new as Room
          setRoom(room)
          if (room.status === 'finished') setPhase('finished')
        }
      )
      .subscribe()

    return () => {
      clearInterval(poll)
      supabase.removeChannel(channel)
    }
  }, [roomId, setRoom, setPhase, setCurrentRound])
}

// ============================================================
// usePlayers — écoute les joueurs qui rejoignent / quittent
// ============================================================
export function usePlayers(roomId: string) {
  const upsertPlayer = useGameStore((s) => s.upsertPlayer)
  const removePlayer = useGameStore((s) => s.removePlayer)

  useEffect(() => {
    if (!roomId) return

    const channel = supabase
      .channel(`players:${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomId}` },
        (payload) => upsertPlayer(payload.new as RoomPlayer)
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomId}` },
        (payload) => upsertPlayer(payload.new as RoomPlayer)
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomId}` },
        (payload) => removePlayer((payload.old as RoomPlayer).player_id)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [roomId, upsertPlayer, removePlayer])
}

// ============================================================
// useRound — écoute les nouvelles manches et changements de statut
// ============================================================
export function useRound(roomId: string) {
  const setCurrentRound = useGameStore((s) => s.setCurrentRound)
  const setPhase = useGameStore((s) => s.setPhase)

  useEffect(() => {
    if (!roomId) return

    const channel = supabase
      .channel(`round:${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'rounds', filter: `room_id=eq.${roomId}` },
        (payload) => {
          const round = payload.new as Round
          setCurrentRound(round)
          setPhase('letter-reveal')
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rounds', filter: `room_id=eq.${roomId}` },
        (payload) => {
          const round = payload.new as Round
          setCurrentRound(round)
          if (round.status === 'voting') setPhase('voting')
          if (round.status === 'finished') setPhase('round-summary')
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [roomId, setCurrentRound, setPhase])
}

// ============================================================
// useAnswers — écoute les réponses soumises en temps réel
// ============================================================
export function useAnswers(roundId: string | null) {
  const upsertAnswer = useGameStore((s) => s.upsertAnswer)

  useEffect(() => {
    if (!roundId) return

    const channel = supabase
      .channel(`answers:${roundId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'answers', filter: `round_id=eq.${roundId}` },
        (payload) => upsertAnswer(payload.new as Answer)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [roundId, upsertAnswer])
}

// ============================================================
// useScores — écoute les scores mis à jour après chaque manche
// ============================================================
export function useScores(roundId: string | null) {
  const setScores = useGameStore((s) => s.setScores)
  const scores = useGameStore((s) => s.scores)

  useEffect(() => {
    if (!roundId) return

    const channel = supabase
      .channel(`scores:${roundId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scores', filter: `round_id=eq.${roundId}` },
        async () => {
          // Re-fetch les scores complets avec les profils
          const { data } = await supabase
            .from('scores')
            .select('*, profiles(username, avatar_url)')
            .eq('round_id', roundId)

          if (data) {
            const mapped = data.map((s: any) => ({
              player_id: s.player_id,
              username: s.profiles?.username ?? 'Joueur',
              avatar_url: s.profiles?.avatar_url ?? null,
              total_points: s.points + s.bac_bonus,
              rounds: [],
            }))
            setScores(mapped)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [roundId, setScores])

  return scores
}