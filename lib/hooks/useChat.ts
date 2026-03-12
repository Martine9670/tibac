'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ChatMessage {
  id: string
  player_id: string
  content: string
  created_at: string
  profiles?: { username: string; avatar_url: string | null }
}

const supabase = createClient()

export function useChat(roomId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)

  // Charger les messages existants
  useEffect(() => {
    if (!roomId) return
    supabase
      .from('chat_messages')
      .select('*, profiles(username, avatar_url)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(50)
      .then(({ data }) => {
        if (data) setMessages(data as ChatMessage[])
        setLoading(false)
      })
  }, [roomId])

  // Realtime nouveaux messages
  useEffect(() => {
    if (!roomId) return
    const channel = supabase
      .channel(`chat:${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
        async (payload) => {
          // Fetch le profil du nouveau message
          const { data: msg } = await supabase
            .from('chat_messages')
            .select('*, profiles(username, avatar_url)')
            .eq('id', payload.new.id)
            .single()
          if (msg) setMessages((prev) => [...prev, msg as ChatMessage])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [roomId])

  const sendMessage = useCallback(async (content: string, playerId: string) => {
    if (!content.trim()) return
    await supabase.from('chat_messages').insert({
      room_id: roomId,
      player_id: playerId,
      content: content.trim().slice(0, 200),
    })
  }, [roomId])

  return { messages, loading, sendMessage }
}
