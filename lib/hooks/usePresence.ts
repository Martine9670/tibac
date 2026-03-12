'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export function usePresence(roomId: string, userId: string, username: string) {
  const [onlineIds, setOnlineIds] = useState<string[]>([])

  useEffect(() => {
    if (!roomId || !userId) return

    const channel = supabase.channel(`presence:${roomId}`, {
      config: { presence: { key: userId } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ username: string }>()
        setOnlineIds(Object.keys(state))
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setOnlineIds((prev) => [...new Set([...prev, key])])
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineIds((prev) => prev.filter((id) => id !== key))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ username, online_at: new Date().toISOString() })
        }
      })

    return () => { supabase.removeChannel(channel) }
  }, [roomId, userId, username])

  return { onlineIds }
}
