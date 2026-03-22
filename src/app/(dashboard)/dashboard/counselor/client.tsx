'use client'

import { useRealtimeAlerts, CounselorAlert } from '@/hooks/useRealtimeAlerts'
import { createClient } from '@/lib/supabase/client'
import { AlertTriangle, CheckCircle, Eye, X, Clock } from 'lucide-react'
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
    <div className="min-h-screen bg-[#0A0A0A] p-6 space-y-8">
      {/* New alert banner */}
      {newAlertBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-4 rounded-xl flex items-center gap-4 shadow-2xl border border-red-500 animate-pulse max-w-lg w-full mx-4">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-sm">🚨 DISTRESS ALERT</p>
            <p className="text-xs text-red-100">{newAlertBanner.reason ?? 'Student needs immediate attention.'}</p>
          </div>
          <button onClick={dismissBanner} className="shrink-0 hover:bg-red-700 rounded-lg p-1"><X size={16} /></button>
        </div>
      )}

      <div>
        <h1 className="font-black text-3xl text-white uppercase tracking-tight">Alert Feed</h1>
        <p className="text-[#666] font-mono text-sm mt-1">
          Real-time distress alerts · <span className="text-red-400 font-bold">{openAlerts.length} open</span>
        </p>
      </div>

      {/* Open alerts */}
      <div className="space-y-3">
        {openAlerts.length === 0 && (
          <div className="text-center py-16">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-white font-bold">All Clear</p>
            <p className="text-[#666] text-sm font-mono mt-1">No open alerts at this time.</p>
          </div>
        )}
        {openAlerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} onUpdate={updateStatus} />
        ))}
      </div>

      {/* Resolved */}
      {resolvedAlerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-[#444] font-mono text-xs uppercase tracking-widest">Resolved / Reviewed</h2>
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
    <div className={`bg-[#111] border rounded-xl p-5 flex items-start justify-between gap-4 transition-opacity ${dimmed ? 'opacity-40' : 'border-red-500/40'}`}>
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-red-900/40 border border-red-500/40 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>
        <div className="space-y-1">
          <p className="font-bold text-white text-sm">{studentName}</p>
          <p className="text-[#888] text-xs font-mono">{alert.reason ?? 'Distress detected in AI call'}</p>
          <div className="flex items-center gap-1 text-[#555] text-xs font-mono">
            <Clock size={10} />
            <span>{alert.created_at ? formatRelativeTime(alert.created_at) : '—'}</span>
          </div>
        </div>
      </div>
      {alert.status === 'open' && (
        <div className="flex gap-2 shrink-0">
          <button onClick={() => onUpdate(alert.id, 'reviewed')}
            className="px-3 py-1.5 border border-[#333] rounded-lg text-white text-xs font-mono hover:bg-[#1a1a1a] flex items-center gap-1.5">
            <Eye size={12} /> Review
          </button>
          <button onClick={() => onUpdate(alert.id, 'resolved')}
            className="px-3 py-1.5 bg-green-900/40 border border-green-500/40 rounded-lg text-green-400 text-xs font-mono hover:bg-green-900/60 flex items-center gap-1.5">
            <CheckCircle size={12} /> Resolve
          </button>
        </div>
      )}
    </div>
  )
}
