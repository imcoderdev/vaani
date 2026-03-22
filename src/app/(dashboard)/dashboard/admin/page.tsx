import { Users, Phone, GraduationCap, Settings } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6 space-y-6">
      <div>
        <h1 className="font-black text-3xl text-white uppercase tracking-tight">Admin Dashboard</h1>
        <p className="text-[#666] font-mono text-sm mt-1">System overview and management</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 flex flex-col items-start gap-4">
          <div className="p-3 rounded-lg bg-[#222] text-[#00E5CC]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#555]">Total Users</p>
            <p className="text-3xl font-black text-white mt-1">0</p>
          </div>
        </div>

        {/* Students */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 flex flex-col items-start gap-4">
          <div className="p-3 rounded-lg bg-[#222] text-[#00E5CC]">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#555]">Students</p>
            <p className="text-3xl font-black text-white mt-1">0</p>
          </div>
        </div>

        {/* Calls This Week */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 flex flex-col items-start gap-4">
          <div className="p-3 rounded-lg bg-[#222] text-[#00E5CC]">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#555]">Calls This Week</p>
            <p className="text-3xl font-black text-white mt-1">0</p>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 flex flex-col items-start gap-4">
          <div className="p-3 rounded-lg bg-[#222] text-[#00E5CC]">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#555]">System Status</p>
            <p className="text-xl font-bold text-green-400 mt-2 uppercase tracking-wider">Active</p>
          </div>
        </div>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl p-6">
        <h2 className="font-bold text-white text-sm uppercase tracking-widest font-mono mb-2">Quick Actions</h2>
        <p className="text-[#666] text-sm font-mono">
          Use the sidebar to manage users, view students, and configure system settings.
        </p>
      </div>
    </div>
  )
}
