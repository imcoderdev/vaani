export function Footer() {
  return (
    <footer className="w-full mt-auto py-12 px-4 border-t-2 border-brutal-fg/5 bg-brutal-bg flex flex-col items-center justify-center">
      <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-brutal-fg/50 flex flex-col lg:flex-row gap-4 items-center">
        <span>© {new Date().getFullYear()} BridgeAI.</span>
        <span className="hidden lg:inline">///</span>
        <span>Infrastructure Active</span>
      </div>
    </footer>
  )
}
