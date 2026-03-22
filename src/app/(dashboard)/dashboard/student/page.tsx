import { createClient } from '@/lib/supabase/server'
import { Calendar, Phone, TrendingUp, User } from 'lucide-react'

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get student profile
  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', user?.id ?? '')
    .single()

  // Get recent attendance
  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('student_id', studentProfile?.id ?? '')
    .order('date', { ascending: false })
    .limit(7)

  const presentDays = attendance?.filter(a => a.present).length || 0
  const totalDays = attendance?.length || 0
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100

  const riskLevel = studentProfile?.risk_level || 'green'

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6 space-y-6">
      <div>
        <h1 className="font-black text-3xl text-white uppercase tracking-tight">My Dashboard</h1>
        <p className="text-[#666] font-mono text-sm mt-1">View your attendance and call history</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Class Info */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 flex flex-col items-start gap-4">
          <div className="p-3 rounded-lg bg-[#222] text-[#00E5CC]">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#555]">Class</p>
            <p className="text-2xl font-black text-white mt-1">
              {studentProfile?.class_group ?? 'N/A'} {studentProfile?.section ?? ''}
            </p>
          </div>
        </div>

        {/* Attendance */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 flex flex-col items-start gap-4">
          <div className="p-3 rounded-lg bg-[#222] text-[#00E5CC]">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#555]">Attendance (7 days)</p>
            <p className={`text-2xl font-black mt-1 ${attendanceRate < 75 ? 'text-red-400' : 'text-green-400'}`}>
              {attendanceRate}%
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 flex flex-col items-start gap-4">
          <div className="p-3 rounded-lg bg-[#222] text-[#00E5CC]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#555]">Status</p>
            <p className={`text-xl font-bold uppercase tracking-wider mt-2 ${riskLevel === 'red' ? 'text-red-400' : riskLevel === 'yellow' ? 'text-yellow-400' : 'text-green-400'}`}>
              {riskLevel === 'green' ? 'Good' : riskLevel === 'yellow' ? 'Notice' : 'At Risk'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl p-6">
        <h2 className="font-bold text-white text-sm uppercase tracking-widest font-mono mb-2 flex items-center gap-2">
          <Phone className="w-4 h-4 text-[#555]" />
          Recent Check-ins
        </h2>
        <p className="text-[#666] text-sm font-mono mt-4">
          Your recent check-in calls will appear here once the system has processed them.
        </p>
      </div>
    </div>
  )
}
