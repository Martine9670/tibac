'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@/lib/hooks/useChat'

interface Props {
  roomId: string
  currentUserId: string
}

export default function LobbyChat({ roomId, currentUserId }: Props) {
  const { messages, sendMessage } = useChat(roomId)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!input.trim()) return
    const text = input
    setInput('')
    await sendMessage(text, currentUserId)
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col h-52">
      <div className="px-4 py-2.5 border-b border-zinc-800">
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">💬 Chat</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5 scrollbar-hide">
        {messages.length === 0 && (
          <p className="text-zinc-600 text-xs italic text-center pt-4">Soyez le premier à écrire !</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.player_id === currentUserId
          return (
            <div key={msg.id} className={`flex gap-1.5 ${isMe ? 'flex-row-reverse' : ''}`}>
              <span className="text-sm shrink-0">
                {msg.profiles?.avatar_url ?? msg.profiles?.username?.[0]?.toUpperCase() ?? '?'}
              </span>
              <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                {!isMe && (
                  <span className="text-zinc-500 text-xs mb-0.5">{msg.profiles?.username}</span>
                )}
                <div className={`px-3 py-1.5 rounded-xl text-sm ${
                  isMe
                    ? 'bg-yellow-400 text-zinc-900 font-medium'
                    : 'bg-zinc-800 text-zinc-200'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-2 border-t border-zinc-800 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Dis quelque chose..."
          maxLength={200}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-white placeholder-zinc-600 text-xs focus:outline-none focus:ring-1 focus:ring-yellow-400"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-zinc-900 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
        >
          →
        </button>
      </div>
    </div>
  )
}
