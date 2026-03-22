export function HeroSection() {
  return (
    <section className="relative w-full min-h-[90vh] flex flex-col justify-center px-4 md:px-12 lg:px-24 pt-20 pb-10 overflow-hidden">
      {/* Background brutalist grid accent */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '100px 100px' }}>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-start gap-8">
        <div className="inline-block border border-brutal-accent px-4 py-1">
          <span className="font-mono text-brutal-accent text-xs md:text-sm tracking-[0.2em] uppercase">Status: Infrastructure Online</span>
        </div>
        
        <h1 className="font-sans font-black text-[12vw] md:text-[8vw] lg:text-[7.5vw] leading-[0.85] tracking-tighter text-brutal-fg mix-blend-difference max-w-5xl uppercase">
          No student <br/>
          <span className="text-transparent" style={{ WebkitTextStroke: '2px #00E5CC' }}>should be</span> <br/>
          invisible.
        </h1>
        
        <p className="max-w-xl font-mono text-lg md:text-xl text-brutal-fg/70 tracking-tight leading-relaxed mt-6 border-l-2 border-brutal-accent pl-6">
          Autonomous communication infrastructure for schools. 
          Real-time distress detection. Inbound hotline. 
          Zero teacher effort.
        </p>
        
        <div className="flex flex-wrap gap-4 mt-8">
          <a href="#action" className="px-8 py-4 bg-brutal-accent text-brutal-bg font-mono font-bold text-sm uppercase tracking-widest hover:bg-brutal-fg transition-all duration-300 shadow-[4px_4px_0px_#ffffff] hover:shadow-[6px_6px_0px_#ffffff] hover:-translate-y-0.5">
            Deploy Infrastructure
          </a>
          <a href="#features" className="px-8 py-4 bg-transparent border-2 border-brutal-fg text-brutal-fg font-mono font-bold text-sm uppercase tracking-widest hover:border-brutal-accent hover:text-brutal-accent transition-colors duration-300">
            View Protocol
          </a>
        </div>
      </div>
    </section>
  )
}
