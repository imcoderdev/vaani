import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-brutal-fg/10 bg-brutal-bg/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-3 h-3 bg-brutal-accent group-hover:scale-125 transition-transform duration-300"></div>
          <span className="font-mono font-bold text-xl tracking-tighter uppercase relative top-px">Bridge<span className="text-brutal-accent">AI</span></span>
        </Link>
        <nav className="hidden md:flex gap-8">
          <Link href="#features" className="font-mono text-[10px] tracking-[0.2em] uppercase hover:text-brutal-accent transition-colors">Architecture</Link>
          <Link href="#action" className="font-mono text-[10px] tracking-[0.2em] uppercase hover:text-brutal-accent transition-colors">Deploy</Link>
        </nav>
        <Link href="/login" className="px-6 py-2 bg-brutal-fg text-brutal-bg font-mono text-xs font-bold uppercase tracking-widest hover:bg-brutal-accent hover:text-brutal-bg transition-colors">
          Access Portal
        </Link>
      </div>
    </header>
  )
}
