import { createClient } from '@/lib/supabase/server'
import { MessageCircle, Clock } from 'lucide-react'

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('id, class_group, section, risk_level, risk_score, roll_number')
    .eq('user_id', user?.id ?? '')
    .single()

  const { data: recentCalls } = studentProfile
    ? await supabase
        .from('call_logs')
        .select('id, created_at, summary, sentiment, duration_seconds, direction')
        .eq('student_id', studentProfile.id)
        .order('created_at', { ascending: false })
        .limit(5)
    : { data: [] }

  const attendancePct = studentProfile ? Math.max(0, 100 - (studentProfile.risk_score ?? 0)) : 100
  const riskLevel = studentProfile?.risk_level ?? 'green'
  const riskLabel = riskLevel === 'red' ? 'At Risk' : riskLevel === 'yellow' ? 'Notice' : 'Good'

  const sentimentColors: Record<string, string> = {
    positive: 'text-[#16A34A] bg-[rgba(22,163,74,0.15)] border-[rgba(22,163,74,0.3)]',
    neutral: 'text-[#888] bg-[rgba(136,136,136,0.1)] border-[rgba(136,136,136,0.3)]',
    concerned: 'text-[#D97706] bg-[rgba(217,119,6,0.15)] border-[rgba(217,119,6,0.3)]',
    distress: 'text-[#DC2626] bg-[rgba(220,38,38,0.15)] border-[rgba(220,38,38,0.3)]',
  }

  return (
    <div className="p-4 space-y-4">
      {/* Stats — 3 cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-3">
          <div className="text-[#444] text-[10px] uppercase tracking-[1px] mb-1">Class</div>
          <div className="text-white text-xl font-medium">{studentProfile?.class_group ?? '—'} {studentProfile?.section ?? ''}</div>
        </div>
        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-3">
          <div className="text-[#444] text-[10px] uppercase tracking-[1px] mb-1">Attendance</div>
          <div className={`text-xl font-medium ${attendancePct < 75 ? 'text-[#DC2626]' : attendancePct < 85 ? 'text-[#D97706]' : 'text-[#16A34A]'}`}>{attendancePct}%</div>
        </div>
        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-3">
          <div className="text-[#444] text-[10px] uppercase tracking-[1px] mb-1">Status</div>
          <div className={`text-xl font-medium ${riskLevel === 'red' ? 'text-[#DC2626]' : riskLevel === 'yellow' ? 'text-[#D97706]' : 'text-[#16A34A]'}`}>{riskLabel}</div>
        </div>
      </div>

      {/* Recent Check-ins */}
      <div className="space-y-2.5">
        <div className="text-[#444] text-[10px] uppercase tracking-[1.5px]">
          Recent Check-ins
        </div>

        {(recentCalls ?? []).length === 0 ? (
          <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-8 text-center">
            <MessageCircle className="w-8 h-8 text-[#333] mx-auto mb-2" />
            <p className="text-white text-xs font-medium">No Check-ins Yet</p>
            <p className="text-[#555] text-[10px] mt-1">Your AI check-in history will appear here.</p>
          </div>
        ) : (
          (recentCalls ?? []).map((call: any) => {
            const duration = call.duration_seconds ? `${Math.floor(call.duration_seconds / 60)}m ${call.duration_seconds % 60}s` : '—'
            return (
              <div key={call.id} className="bg-[#111] border border-[#1a1a1a] rounded-lg p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium uppercase tracking-[0.5px] ${sentimentColors[call.sentiment] ?? sentimentColors.neutral}`}>
                    {call.sentiment ?? 'neutral'}
                  </span>
                  <div className="flex items-center gap-1.5 text-[#444] text-[10px]">
                    <Clock className="w-3 h-3" />
                    {duration} · {call.created_at ? new Date(call.created_at).toLocaleDateString('en-US') : '—'}
                  </div>
                </div>
                <p className="text-[#888] text-[11px] leading-relaxed">{call.summary ?? 'No summary.'}</p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
