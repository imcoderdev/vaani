export function ValueProps() {
  const props = [
    {
      id: '01',
      title: 'Zero Teacher Effort',
      desc: 'AI calls every at-risk student automatically.',
      metric: '100% Outreach'
    },
    {
      id: '02',
      title: 'Inbound Hotline',
      desc: 'Parents call anytime, AI answers with live data.',
      metric: '24/7 Availability'
    },
    {
      id: '03',
      title: 'Distress Detection',
      desc: 'Counselor alerted instantly with full transcript.',
      metric: '<1s Latency'
    },
    {
      id: '04',
      title: '2-Min Dashboard',
      desc: "Entire day's student communication in one scroll.",
      metric: 'Zero Friction'
    }
  ]

  return (
    <section id="features" className="w-full py-24 px-4 md:px-12 lg:px-24 bg-brutal-bg border-t border-brutal-fg/10 relative">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 lg:gap-16">
        
        <div className="w-full md:w-1/3 flex flex-col relative">
           <div className="sticky top-32">
             <h2 className="font-sans font-black text-5xl lg:text-7xl tracking-tighter uppercase leading-[0.9]">
               System <br/>
               <span className="text-transparent" style={{ WebkitTextStroke: '2px #ffffff' }}>Archi-<br/>tecture</span>
             </h2>
             <p className="mt-8 font-mono text-sm tracking-widest text-brutal-accent uppercase">
               {'/// Tech specs'}
             </p>
           </div>
        </div>

        <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-px bg-brutal-fg/10 border border-brutal-fg/10 p-px">
          {props.map((prop) => (
            <div key={prop.id} className="bg-brutal-bg p-8 md:p-12 flex flex-col justify-between group hover:bg-brutal-accent focus-within:bg-brutal-accent transition-colors duration-300 aspect-square md:aspect-auto">
              <div className="flex justify-between items-start mb-12">
                <span className="font-mono text-lg font-bold text-brutal-accent group-hover:text-brutal-bg transition-colors">{prop.id}</span>
                <span className="font-mono text-[10px] px-2 py-1 border border-brutal-fg/20 text-brutal-fg/50 group-hover:border-brutal-bg group-hover:text-brutal-bg transition-colors uppercase tracking-[0.2em]">{prop.metric}</span>
              </div>
              <div className="mt-auto">
                <h3 className="font-sans font-black text-2xl lg:text-3xl uppercase tracking-tighter mb-4 group-hover:text-brutal-bg transition-colors leading-tight">{prop.title}</h3>
                <p className="font-mono text-sm text-brutal-fg/60 group-hover:text-brutal-bg/80 leading-relaxed transition-colors">{prop.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
