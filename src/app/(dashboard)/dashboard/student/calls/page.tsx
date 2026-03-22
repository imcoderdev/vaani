import { Phone } from 'lucide-react'

export default async function StudentCallsHistory() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6 space-y-6">
      <div>
        <h1 className="font-black text-3xl text-white uppercase tracking-tight">My Calls</h1>
        <p className="text-[#666] font-mono text-sm mt-1">History of your interactions with school services.</p>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-[#222] rounded-full flex items-center justify-center mb-4">
          <Phone className="w-6 h-6 text-[#555]" />
        </div>
        <h2 className="text-white font-bold text-lg mb-2">No Activity</h2>
        <p className="text-[#666] font-mono text-sm max-w-md mx-auto">
          You don't have any recorded calls in the system yet.
        </p>
      </div>
    </div>
  )
}
