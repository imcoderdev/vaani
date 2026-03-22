import { createClient } from '@/lib/supabase/server'
import { ParentDashboardClient } from './client'

interface StudentRow {
  id: string
  class_group: string
  section: string
  risk_level: string
  risk_score: number
  user: { name: string; email: string } | null
}

export default async function ParentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: parentProfile } = await supabase
    .from('parent_profiles')
    .select(`id, parent_students(student:student_profiles(id, class_group, section, risk_level, risk_score, user:users(name, email)))`)
    .eq('user_id', user?.id ?? '')
    .single()

  // Extract first linked student
  const rawStudent = (parentProfile as { parent_students?: { student: StudentRow }[] } | null)?.parent_students?.[0]?.student ?? null

  const { data: recentCalls } = rawStudent
    ? await supabase
        .from('call_logs')
        .select('id, created_at, summary, sentiment, duration_seconds')
        .eq('student_id', rawStudent.id)
        .order('created_at', { ascending: false })
        .limit(5)
    : { data: [] }

  const { data: userData } = await supabase.from('users').select('name').eq('id', user?.id ?? '').single()

  return (
    <ParentDashboardClient
      parentName={(userData as { name?: string } | null)?.name ?? 'Parent'}
      student={rawStudent ? {
        name: rawStudent.user?.name ?? 'Your Child',
        class_group: rawStudent.class_group,
        section: rawStudent.section,
        risk_level: rawStudent.risk_level as 'green' | 'yellow' | 'red',
        risk_score: rawStudent.risk_score,
      } : null}
      recentCalls={(recentCalls ?? []) as { id: string; created_at: string; summary: string | null; sentiment: string | null; duration_seconds: number | null }[]}
    />
  )
}

