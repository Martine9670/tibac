interface Props {
  emoji?: string | null
  username: string
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  isOnline?: boolean
}

const sizes = {
  sm: 'w-7 h-7 text-sm',
  md: 'w-9 h-9 text-base',
  lg: 'w-14 h-14 text-3xl',
}

export default function Avatar({ emoji, username, size = 'md', showName = false, isOnline }: Props) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative shrink-0">
        <div className={`${sizes[size]} bg-zinc-800 rounded-xl flex items-center justify-center font-bold`}>
          {emoji ?? username[0]?.toUpperCase()}
        </div>
        {isOnline !== undefined && (
          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-zinc-950 ${
            isOnline ? 'bg-green-400' : 'bg-zinc-600'
          }`} />
        )}
      </div>
      {showName && (
        <span className="text-white text-sm font-medium truncate">{username}</span>
      )}
    </div>
  )
}
