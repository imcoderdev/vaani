'use client'

import { useRealtimeAlerts, CounselorAlert } from '@/hooks/useRealtimeAlerts'
import { createClient } from '@/lib/supabase/client'
import { Eye, CheckCircle, X, Clock } from 'lucide-react'
import { useTransition } from 'react'

function formatRelativeTime(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

export function CounselorAlertsClient({ initialAlerts }: { initialAlerts: CounselorAlert[] }) {
  const { alerts, newAlertBanner, dismissBanner } = useRealtimeAlerts(initialAlerts)
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()

  const updateStatus = (id: string, status: 'reviewed' | 'resolved') => {
    startTransition(async () => {
      await supabase.from('counselor_alerts').update({ status, resolved_at: status === 'resolved' ? new Date().toISOString() : null }).eq('id', id)
    })
  }

  const openAlerts = alerts.filter((a) => a.status === 'open')
  const resolvedAlerts = alerts.filter((a) => a.status !== 'open')

  return (
    <div className="p-4 space-y-4">
      {/* New alert banner (floating) */}
      {newAlertBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-4 rounded-xl flex items-center gap-4 shadow-2xl border border-red-500 animate-pulse max-w-lg w-full mx-4">
          <div className="flex-1">
            <p className="font-bold text-sm">🚨 DISTRESS ALERT</p>
            <p className="text-xs text-red-100">{newAlertBanner.reason ?? 'Student needs immediate attention.'}</p>
          </div>
          <button onClick={dismissBanner} className="shrink-0 hover:bg-red-700 rounded-lg p-1"><X size={16} /></button>
        </div>
      )}

      {/* Urgent banner */}
      {openAlerts.length > 0 && (
        <div className="bg-[rgba(220,38,38,0.08)] border border-[rgba(220,38,38,0.2)] rounded-lg px-3.5 py-2.5 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-[#DC2626] rounded-full animate-pulse shrink-0" />
          <span className="text-[#DC2626] text-[11px] font-medium">
            {openAlerts.length} student{openAlerts.length > 1 ? 's' : ''} need{openAlerts.length === 1 ? 's' : ''} immediate attention
          </span>
        </div>
      )}

      {/* Open alerts */}
      <div className="space-y-2.5">
        {openAlerts.length === 0 && (
          <div className="text-center py-16">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-white font-medium text-sm">All Clear</p>
            <p className="text-[#666] text-[11px] mt-1">No open alerts at this time.</p>
          </div>
        )}
        {openAlerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} onUpdate={updateStatus} />
        ))}
      </div>

      {/* Resolved */}
      {resolvedAlerts.length > 0 && (
        <div className="space-y-2.5">
          <h2 className="text-[#444] text-[10px] uppercase tracking-[1.5px]">Resolved / Reviewed</h2>
          {resolvedAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} onUpdate={updateStatus} dimmed />
          ))}
        </div>
      )}
    </div>
  )
}

function AlertCard({
  alert,
  onUpdate,
  dimmed = false,
}: {
  alert: CounselorAlert
  onUpdate: (id: string, status: 'reviewed' | 'resolved') => void
  dimmed?: boolean
}) {
  const studentName = (alert.student as { user?: { name?: string } } | null)?.user?.name ?? 'Unknown Student'

  return (
    <div className={`bg-[#111] border border-[#1a1a1a] border-l-2 border-l-[#DC2626] rounded-lg p-3.5 transition-opacity ${dimmed ? 'opacity-40' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="bg-[rgba(220,38,38,0.15)] text-[#DC2626] border border-[rgba(220,38,38,0.3)] text-[9px] px-1.5 py-0.5 rounded font-medium uppercase tracking-[0.5px]">
            Distress
          </span>
          <span className="text-white text-xs font-medium">{studentName}</span>
        </div>
        <span className="text-[#444] text-[10px]">
          {alert.created_at ? formatRelativeTime(alert.created_at) : '—'}
        </span>
      </div>

      {/* Reason */}
      <p className="text-[#888] text-[11px] leading-relaxed mb-2.5">
        &ldquo;{alert.reason ?? 'Distress detected in AI call'}&rdquo;
      </p>

      {/* AI Summary box */}
      {alert.reason && (
        <div className="bg-[#0A0A0A] border border-[#1a1a1a] rounded-md p-2 mb-2.5">
          <div className="text-[#444] text-[9px] uppercase tracking-[1px] mb-1">AI Summary</div>
          <div className="text-[#888] text-[11px] leading-relaxed">
            {alert.reason}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {alert.status === 'open' && (
        <div className="flex gap-2">
          <button
            onClick={() => onUpdate(alert.id, 'reviewed')}
            className="text-[10px] py-1 px-2.5 rounded border border-[#00E5CC] text-[#00E5CC] bg-transparent cursor-pointer hover:bg-[#00E5CC] hover:text-black transition-all"
          >
            View Transcript
          </button>
          <button
            onClick={() => onUpdate(alert.id, 'reviewed')}
            className="text-[10px] py-1 px-2.5 rounded border border-[#333] text-[#888] bg-transparent cursor-pointer hover:bg-[#1a1a1a] transition-all"
          >
            Mark Reviewed
          </button>
          <button
            onClick={() => onUpdate(alert.id, 'resolved')}
            className="text-[10px] py-1 px-2.5 rounded border border-[#DC2626] text-[#DC2626] bg-transparent cursor-pointer hover:bg-[#DC2626] hover:text-white transition-all"
          >
            Escalate
          </button>
        </div>
      )}
    </div>
  )
}
