'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface CounselorAlert {
  id: string
  created_at: string | null
  status: 'open' | 'reviewed' | 'resolved' | null
  reason: string | null
  notes: string | null
  assigned_to_id: string | null
  resolved_at: string | null
  student_id: string | null
  call_log_id: string | null
  student: { user: { name: string } | null } | null
}

export function useRealtimeAlerts(initialAlerts: CounselorAlert[]) {
  const [alerts, setAlerts] = useState<CounselorAlert[]>(initialAlerts)
  const [newAlertBanner, setNewAlertBanner] = useState<CounselorAlert | null>(null)

  const dismissBanner = useCallback(() => setNewAlertBanner(null), [])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('counselor-alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'counselor_alerts' },
        (payload) => {
          const newAlert = payload.new as CounselorAlert
          setAlerts((prev) => [newAlert, ...prev])
          setNewAlertBanner(newAlert)
          setTimeout(() => setNewAlertBanner(null), 8000)
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'counselor_alerts' },
        (payload) => {
          const updated = payload.new as CounselorAlert
          setAlerts((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return { alerts, newAlertBanner, dismissBanner }
}
