import { Settings } from 'lucide-react'

export default async function AdminSettings() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6 space-y-6">
      <div>
        <h1 className="font-black text-3xl text-white uppercase tracking-tight">System Settings</h1>
        <p className="text-[#666] font-mono text-sm mt-1">Configure global application parameters.</p>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-[#222] rounded-full flex items-center justify-center mb-4">
          <Settings className="w-6 h-6 text-[#555]" />
        </div>
        <h2 className="text-white font-bold text-lg mb-2">Configuration Required</h2>
        <p className="text-[#666] font-mono text-sm max-w-md mx-auto">
          System settings require active API keys and Vapi agent configurations.
        </p>
      </div>
    </div>
  )
}
