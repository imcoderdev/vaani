export function CTABlock() {
  return (
    <section id="action" className="w-full py-32 px-4 md:px-12 lg:px-24 bg-brutal-accent border-t-4 border-brutal-fg">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="flex flex-col items-start gap-6">
          <h2 className="font-sans font-black text-6xl md:text-8xl tracking-tighter leading-[0.85] uppercase text-brutal-bg mix-blend-color-burn">
            Initiate<br/>Protocol.
          </h2>
          <p className="font-mono text-lg max-w-md mt-4 text-brutal-bg/80 border-l-2 border-brutal-bg pl-4 font-bold">
            Stop letting students slip through the cracks. Deploy the autonomous infrastructure today.
          </p>
        </div>
        
        <div className="flex flex-col gap-6 lg:ml-auto w-full max-w-md">
          <div className="bg-brutal-bg p-8 border-4 border-brutal-bg relative shadow-[12px_12px_0px_rgba(0,0,0,0.3)] hover:shadow-[16px_16px_0px_#ffffff] transition-shadow duration-300">
            <span className="absolute -top-3 left-6 bg-brutal-accent px-3 py-1 font-mono text-[10px] font-bold text-brutal-bg uppercase tracking-[0.2em] border border-brutal-bg">
              System Access
            </span>
            <form className="flex flex-col gap-6 mt-4">
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-brutal-fg/70">District Email</label>
                <input 
                  type="email" 
                  placeholder="admin@school.edu" 
                  className="w-full bg-transparent border-b-2 border-brutal-fg/20 py-3 text-brutal-fg font-mono text-sm focus:outline-none focus:border-brutal-accent transition-colors rounded-none placeholder:text-brutal-fg/20"
                />
              </div>
              <button 
                type="button"
                className="mt-6 w-full py-4 bg-brutal-fg text-brutal-bg font-mono font-bold text-sm uppercase tracking-[0.2em] hover:bg-brutal-accent transition-colors focus:outline-none focus:ring-2 focus:ring-brutal-bg focus:ring-offset-2 focus:ring-offset-brutal-accent"
              >
                Request Authorization
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
