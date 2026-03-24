import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true })
  const { count: totalStudents } = await supabase.from('student_profiles').select('*', { count: 'exact', head: true })
  
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { count: callsThisWeek } = await supabase.from('call_logs').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo)
  const { count: openAlerts } = await supabase.from('counselor_alerts').select('*', { count: 'exact', head: true }).eq('status', 'open')

  const { data: recentCalls } = await supabase
    .from('call_logs')
    .select('id, created_at, summary, sentiment, direction, student:student_profiles(user:users(name))')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="p-4 space-y-4">
      {/* Stats — 4 compact cards */}
      <div className="grid grid-cols-4 gap-2.5">
        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-3">
          <div className="text-[#444] text-[10px] uppercase tracking-[1px] mb-1">Total Users</div>
          <div className="text-white text-xl font-medium">{totalUsers ?? 0}</div>
        </div>
        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-3">
          <div className="text-[#444] text-[10px] uppercase tracking-[1px] mb-1">Students</div>
          <div className="text-[#00E5CC] text-xl font-medium">{totalStudents ?? 0}</div>
        </div>
        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-3">
          <div className="text-[#444] text-[10px] uppercase tracking-[1px] mb-1">Calls (7d)</div>
          <div className="text-[#D97706] text-xl font-medium">{callsThisWeek ?? 0}</div>
        </div>
        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-3">
          <div className="text-[#444] text-[10px] uppercase tracking-[1px] mb-1">Open Alerts</div>
          <div className={`text-xl font-medium ${(openAlerts ?? 0) > 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>{openAlerts ?? 0}</div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-3">
        <div className="text-[#444] text-[10px] uppercase tracking-[1px] mb-2">System Status</div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { name: 'Supabase', status: true },
            { name: 'Vapi AI', status: !!process.env.VAPI_API_KEY },
            { name: 'Gemini', status: !!process.env.GEMINI_API_KEY },
          ].map((s) => (
            <div key={s.name} className="flex items-center gap-2 bg-[#0A0A0A] rounded-md p-2">
              <div className={`w-1.5 h-1.5 rounded-full ${s.status ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`} />
              <span className="text-[#888] text-[11px]">{s.name}</span>
              <span className={`text-[9px] ml-auto uppercase tracking-[0.5px] font-medium ${s.status ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                {s.status ? 'Online' : 'Missing'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-2.5">
        <div className="text-[#444] text-[10px] uppercase tracking-[1.5px]">Recent Activity</div>
        {(recentCalls ?? []).length === 0 ? (
          <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-6 text-center">
            <p className="text-[#555] text-xs">No recent activity</p>
          </div>
        ) : (
          (recentCalls ?? []).map((call: any) => {
            const studentName = Array.isArray(call.student) ? call.student[0]?.user?.name : call.student?.user?.name
            return (
              <div key={call.id} className="bg-[#111] border border-[#1a1a1a] rounded-lg p-3 flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  call.sentiment === 'distress' ? 'bg-[#DC2626]' : call.sentiment === 'concerned' ? 'bg-[#D97706]' : 'bg-[#16A34A]'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-white text-[11px] font-medium">{studentName ?? 'Unknown'}</div>
                  <div className="text-[#555] text-[10px] truncate">{call.summary ?? '—'}</div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium uppercase tracking-[0.5px] ${
                    call.sentiment === 'distress' ? 'bg-[rgba(220,38,38,0.15)] text-[#DC2626] border-[rgba(220,38,38,0.3)]'
                    : call.sentiment === 'concerned' ? 'bg-[rgba(217,119,6,0.15)] text-[#D97706] border-[rgba(217,119,6,0.3)]'
                    : 'bg-[rgba(22,163,74,0.15)] text-[#16A34A] border-[rgba(22,163,74,0.3)]'
                  }`}>{call.sentiment ?? 'neutral'}</span>
                  <div className="text-[#555] text-[9px] mt-1">{call.direction === 'inbound' ? '← inbound' : '→ outbound'}</div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
