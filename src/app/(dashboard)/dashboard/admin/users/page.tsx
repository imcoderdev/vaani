import { Users } from 'lucide-react'

export default async function AdminUsers() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6 space-y-6">
      <div>
        <h1 className="font-black text-3xl text-white uppercase tracking-tight">System Users</h1>
        <p className="text-[#666] font-mono text-sm mt-1">Manage staff, students, and parent accounts.</p>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-[#222] rounded-full flex items-center justify-center mb-4">
          <Users className="w-6 h-6 text-[#555]" />
        </div>
        <h2 className="text-white font-bold text-lg mb-2">User Directory</h2>
        <p className="text-[#666] font-mono text-sm max-w-md mx-auto">
          The user management table will be enabled shortly in the full admin release.
        </p>
      </div>
    </div>
  )
}
