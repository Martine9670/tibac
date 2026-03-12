export default function LoadingScreen({ message = 'Chargement...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 bg-yellow-400/10 rounded-2xl flex items-center justify-center">
          <span className="text-3xl animate-bounce">🎲</span>
        </div>
        <div className="absolute -inset-1 rounded-2xl border border-yellow-400/20 animate-ping" />
      </div>
      <p className="text-zinc-500 text-sm animate-pulse">{message}</p>
    </div>
  )
}
