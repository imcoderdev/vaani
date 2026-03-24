import { createClient } from '@/lib/supabase/server'
import { Phone, ArrowDownLeft, ArrowUpRight } from 'lucide-react'

export default async function CallsHistory() {
  const supabase = await createClient()

  const { data: calls } = await supabase
    .from('call_logs')
    .select('id, created_at, direction, summary, sentiment, duration_seconds, flag_counselor, student:student_profiles(user:users(name))')
    .order('created_at', { ascending: false })
    .limit(50)

  const sentimentColors: Record<string, string> = {
    positive: 'text-[#16A34A] bg-[rgba(22,163,74,0.15)] border-[rgba(22,163,74,0.3)]',
    neutral: 'text-[#888] bg-[rgba(136,136,136,0.1)] border-[rgba(136,136,136,0.3)]',
    concerned: 'text-[#D97706] bg-[rgba(217,119,6,0.15)] border-[rgba(217,119,6,0.3)]',
    distress: 'text-[#DC2626] bg-[rgba(220,38,38,0.15)] border-[rgba(220,38,38,0.3)]',
  }

  return (
    <div className="p-4 space-y-4">
      <div className="text-[#444] text-[10px] uppercase tracking-[1.5px]">
        {calls?.length ?? 0} Call Records
      </div>

      {(calls ?? []).length === 0 ? (
        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-12 text-center">
          <Phone className="w-10 h-10 text-[#333] mx-auto mb-3" />
          <p className="text-white text-sm font-medium">No Calls Recorded</p>
          <p className="text-[#555] text-[11px] mt-1">Calls will appear here after AI check-ins.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {(calls ?? []).map((call: any) => {
            const studentName = Array.isArray(call.student) ? call.student[0]?.user?.name : call.student?.user?.name
            const duration = call.duration_seconds ? `${Math.floor(call.duration_seconds / 60)}m ${call.duration_seconds % 60}s` : '—'

            return (
              <div key={call.id} className="bg-[#111] border border-[#1a1a1a] rounded-lg p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {call.direction === 'inbound' ? (
                      <ArrowDownLeft className="w-3 h-3 text-[#16A34A]" />
                    ) : (
                      <ArrowUpRight className="w-3 h-3 text-[#00E5CC]" />
                    )}
                    <span className="text-white text-[11px] font-medium">{studentName ?? 'Unknown'}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium uppercase tracking-[0.5px] ${sentimentColors[call.sentiment] ?? sentimentColors.neutral}`}>
                      {call.sentiment ?? 'neutral'}
                    </span>
                    {call.flag_counselor && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded border font-medium uppercase tracking-[0.5px] bg-[rgba(220,38,38,0.15)] text-[#DC2626] border-[rgba(220,38,38,0.3)]">
                        🚨 Flagged
                      </span>
                    )}
                  </div>
                  <div className="text-[#444] text-[10px]">
                    {call.created_at ? new Date(call.created_at).toLocaleDateString('en-US') : '—'} · {duration}
                  </div>
                </div>
                <p className="text-[#888] text-[11px] leading-relaxed">
                  {call.summary ?? 'No summary available.'}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
