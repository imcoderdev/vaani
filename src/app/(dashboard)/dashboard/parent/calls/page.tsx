import { createClient } from '@/lib/supabase/server'
import { Phone, ArrowDownLeft, Clock, MessageCircle } from 'lucide-react'

export default async function ParentCallsHistory() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get parent profile → linked student
  const { data: parentProfile } = await supabase
    .from('parent_profiles')
    .select('id, parent_students(student:student_profiles(id))')
    .eq('user_id', user?.id ?? '')
    .single()

  const studentId = (parentProfile as any)?.parent_students?.[0]?.student?.id

  const { data: calls } = studentId
    ? await supabase
        .from('call_logs')
        .select('id, created_at, summary, sentiment, duration_seconds, direction')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(20)
    : { data: [] }

  const sentimentColors: Record<string, string> = {
    positive: 'text-[#16A34A] bg-[rgba(22,163,74,0.15)] border-[rgba(22,163,74,0.3)]',
    neutral: 'text-[#888] bg-[rgba(136,136,136,0.1)] border-[rgba(136,136,136,0.3)]',
    concerned: 'text-[#D97706] bg-[rgba(217,119,6,0.15)] border-[rgba(217,119,6,0.3)]',
    distress: 'text-[#DC2626] bg-[rgba(220,38,38,0.15)] border-[rgba(220,38,38,0.3)]',
  }

  return (
    <div className="p-4 space-y-4">
      <div className="text-[#444] text-[10px] uppercase tracking-[1.5px]">
        {(calls ?? []).length} Call{(calls ?? []).length !== 1 ? 's' : ''} Recorded
      </div>

      {(calls ?? []).length === 0 ? (
        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-12 text-center">
          <Phone className="w-10 h-10 text-[#333] mx-auto mb-3" />
          <p className="text-white text-sm font-medium">No Calls Yet</p>
          <p className="text-[#555] text-[11px] mt-1">Start a call from the Parent Dashboard to see records here.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {(calls ?? []).map((call: any) => {
            const duration = call.duration_seconds ? `${Math.floor(call.duration_seconds / 60)}m ${call.duration_seconds % 60}s` : '—'
            return (
              <div key={call.id} className="bg-[#111] border border-[#1a1a1a] rounded-lg p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-3.5 h-3.5 text-[#444]" />
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium uppercase tracking-[0.5px] ${sentimentColors[call.sentiment] ?? sentimentColors.neutral}`}>
                      {call.sentiment ?? 'neutral'}
                    </span>
                    <span className="text-[#555] text-[10px]">{call.direction === 'inbound' ? '← Parent Call' : '→ AI Check-in'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#444] text-[10px]">
                    <Clock className="w-3 h-3" />
                    {duration}
                    <span className="text-[#333]">·</span>
                    {call.created_at ? new Date(call.created_at).toLocaleDateString('en-US') : '—'}
                  </div>
                </div>
                <p className="text-[#888] text-[11px] leading-relaxed">{call.summary ?? 'No summary available.'}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
