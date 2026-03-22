import { createClient } from '@/lib/supabase/server'
import { TeacherDashboardClient } from './client'
export default async function TeacherDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch teacher profile
  const { data: teacherProfile } = await supabase
    .from('teacher_profiles')
    .select('id')
    .eq('user_id', user?.id ?? '')
    .single()

  // Fetch students with user info
  const { data: students } = await supabase
    .from('student_profiles')
    .select(`*, user:users(id, name, email, avatar_url, phone)`)
    .order('risk_score', { ascending: false })

  // Fetch today's stats
  const today = new Date().toISOString().split('T')[0]
  const { count: callsToday } = await supabase
    .from('call_logs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${today}T00:00:00`)

  const { count: openAlerts } = await supabase
    .from('counselor_alerts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open')

  const totalStudents = students?.length ?? 0
  const atRisk = students?.filter((s) => s.risk_level === 'red' || s.risk_level === 'yellow').length ?? 0

  const mappedStudents = (students ?? []).map((s) => {
    // Supabase joins can return arrays if unique constraint is missing
    const userObj = Array.isArray(s.user) ? s.user[0] : s.user;
    
    return {
      id: s.id as string,
      name: userObj?.name ?? 'Unknown',
      phone: userObj?.phone ?? '+10000000000', // fallback to valid E164 to prevent Vapi crashes
      class_group: s.class_group as string,
      section: s.section as string ?? '',
      attendance_pct: s.risk_score ? Math.max(0, 100 - (s.risk_score as number)) : 75,
      risk_level: (s.risk_level ?? 'green') as 'green' | 'yellow' | 'red',
      risk_score: (s.risk_score ?? 0) as number,
      roll_number: s.roll_number as string | null,
      teacher_profile_id: teacherProfile?.id,
    }
  })

  return (
    <TeacherDashboardClient 
      students={mappedStudents} 
      totalStudents={totalStudents}
      callsToday={callsToday ?? 0}
      atRisk={atRisk}
      openAlerts={openAlerts ?? 0}
    />
  )
}
