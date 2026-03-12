import Nav from '@/components/shared/Nav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-20">
      {children}
      <Nav />
    </div>
  )
}
