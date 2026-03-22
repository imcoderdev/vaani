import { createClient } from '@/lib/supabase/server'
import { CounselorAlertsClient } from './client'

export default async function CounselorDashboard() {
  const supabase = await createClient()

  const { data: alerts } = await supabase
    .from('counselor_alerts')
    .select(`
      *,
      student:student_profiles(
        id, class_group, section, roll_number,
        user:users(name, email)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  return <CounselorAlertsClient initialAlerts={alerts ?? []} />
}
