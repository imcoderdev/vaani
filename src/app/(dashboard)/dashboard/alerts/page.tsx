import { createClient } from '@/lib/supabase/server'
import { AlertTriangle, CheckCircle } from 'lucide-react'

function formatRelativeTime(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default async function AlertsPage() {
  const supabase = await createClient()

  const { data: alerts } = await supabase
    .from('counselor_alerts')
    .select(`
      id, created_at, status, reason, resolved_at,
      student:student_profiles(user:users(name))
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  const openAlerts = (alerts ?? []).filter((a: any) => a.status === 'open')
  const otherAlerts = (alerts ?? []).filter((a: any) => a.status !== 'open')

  return (
    <div className="p-4 space-y-4">
      {/* Urgent banner */}
      {openAlerts.length > 0 && (
        <div className="bg-[rgba(220,38,38,0.08)] border border-[rgba(220,38,38,0.2)] rounded-lg px-3.5 py-2.5 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-[#DC2626] rounded-full animate-pulse shrink-0" />
          <span className="text-[#DC2626] text-[11px] font-medium">
            {openAlerts.length} alert{openAlerts.length > 1 ? 's' : ''} pending review
          </span>
        </div>
      )}

      {/* Open alerts */}
      {openAlerts.length === 0 && otherAlerts.length === 0 && (
        <div className="text-center py-16">
          <CheckCircle className="w-12 h-12 text-[#16A34A] mx-auto mb-3" />
          <p className="text-white font-medium text-sm">All Clear</p>
          <p className="text-[#555] text-[11px] mt-1">No alerts at this time.</p>
        </div>
      )}

      {openAlerts.map((alert: any) => {
        const studentName = Array.isArray(alert.student) ? alert.student[0]?.user?.name : alert.student?.user?.name
        return (
          <div key={alert.id} className="bg-[#111] border border-[#1a1a1a] border-l-2 border-l-[#DC2626] rounded-lg p-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="bg-[rgba(220,38,38,0.15)] text-[#DC2626] border border-[rgba(220,38,38,0.3)] text-[9px] px-1.5 py-0.5 rounded font-medium uppercase tracking-[0.5px]">
                  Distress
                </span>
                <span className="text-white text-xs font-medium">{studentName ?? 'Unknown'}</span>
              </div>
              <span className="text-[#444] text-[10px]">
                {alert.created_at ? formatRelativeTime(alert.created_at) : '—'}
              </span>
            </div>
            <p className="text-[#888] text-[11px] leading-relaxed">
              {alert.reason ?? 'Distress detected in AI call.'}
            </p>
          </div>
        )
      })}

      {/* Resolved/Reviewed */}
      {otherAlerts.length > 0 && (
        <div className="space-y-2.5">
          <div className="text-[#444] text-[10px] uppercase tracking-[1.5px]">Resolved / Reviewed</div>
          {otherAlerts.map((alert: any) => {
            const studentName = Array.isArray(alert.student) ? alert.student[0]?.user?.name : alert.student?.user?.name
            return (
              <div key={alert.id} className="bg-[#111] border border-[#1a1a1a] rounded-lg p-3 opacity-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-[11px]">{studentName ?? 'Unknown'}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded border text-[#16A34A] bg-[rgba(22,163,74,0.15)] border-[rgba(22,163,74,0.3)] font-medium uppercase tracking-[0.5px]">
                    {alert.status}
                  </span>
                </div>
                <p className="text-[#555] text-[10px] truncate">{alert.reason ?? '—'}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
