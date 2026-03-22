import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const envFile = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8')
const env: Record<string, string> = {}
envFile.split('\n').forEach(line => {
  if (line && !line.startsWith('#') && line.includes('=')) {
    const [key, ...rest] = line.split('=')
    env[key.trim()] = rest.join('=').trim().replace(/^['"]|['"]$/g, '')
  }
})

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']
const supabaseServiceKey = env['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing supabase URL or service key in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
  try {
    console.log("Starting pure database seed (FAKE STUDENTS ONLY)...")

    // 1. Fake Students
    const fakeUsers = [
      { id: '22222222-0000-0000-0000-000000000001', email: 'rahul.demo@bridgecall.ai', name: 'Rahul Sharma', role: 'student' },
      { id: '22222222-0000-0000-0000-000000000002', email: 'priya.demo@bridgecall.ai', name: 'Priya Patil', role: 'student' },
      { id: '22222222-0000-0000-0000-000000000003', email: 'aman.demo@bridgecall.ai', name: 'Aman Desai', role: 'student' },
      { id: '22222222-0000-0000-0000-000000000004', email: 'sneha.demo@bridgecall.ai', name: 'Sneha Joshi', role: 'student' }
    ]
    await supabase.from('users').upsert(fakeUsers, { onConflict: 'id' })

    const fakeProfiles = [
      { user_id: fakeUsers[0].id, roll_number: 'ENTC-2023-002', class_group: 'SE', section: 'A', phone: '+91XXXXXXXXX1', risk_level: 'red', risk_score: 72 },
      { user_id: fakeUsers[1].id, roll_number: 'ENTC-2023-003', class_group: 'SE', section: 'A', phone: '+91XXXXXXXXX2', risk_level: 'yellow', risk_score: 45 },
      { user_id: fakeUsers[2].id, roll_number: 'ENTC-2023-004', class_group: 'SE', section: 'B', phone: '+91XXXXXXXXX3', risk_level: 'green', risk_score: 8 },
      { user_id: fakeUsers[3].id, roll_number: 'ENTC-2023-005', class_group: 'SE', section: 'B', phone: '+91XXXXXXXXX4', risk_level: 'red', risk_score: 65 }
    ]
    await supabase.from('student_profiles').upsert(fakeProfiles, { onConflict: 'user_id' })

    console.log("2. Seeding Attendance for Fake Students...")
    const seedAttendance = async (roll_number: string, patternFn: (day: number) => boolean) => {
      const { data: prof } = await supabase.from('student_profiles').select('id').eq('roll_number', roll_number).single()
      if (!prof) return
      const attendanceRecords = []
      const today = new Date()
      for (let i = 1; i <= 30; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        attendanceRecords.push({ student_id: prof.id, date: d.toISOString().split('T')[0], status: patternFn(i) ? 'present' : 'absent', present: patternFn(i) })
      }
      await supabase.from('attendance').delete().eq('student_id', prof.id)
      await supabase.from('attendance').insert(attendanceRecords)
    }

    await seedAttendance('ENTC-2023-002', (day) => day % 3 !== 0)
    await seedAttendance('ENTC-2023-003', (day) => day % 3 !== 0)
    await seedAttendance('ENTC-2023-004', (day) => day % 3 !== 0)
    await seedAttendance('ENTC-2023-005', (day) => day % 3 !== 0)

    console.log("3. Seeding Fake Call Logs...")
    const { data: rahul } = await supabase.from('student_profiles').select('id').eq('roll_number', 'ENTC-2023-002').single()
    const { data: priya } = await supabase.from('student_profiles').select('id').eq('roll_number', 'ENTC-2023-003').single()

    if (rahul) {
      await supabase.from('call_logs').upsert({
        vapi_call_id: 'demo-call-001', direction: 'outbound', student_id: rahul.id,
        transcript: 'AI: Hello Rahul bhai, kaisa chal raha hai?\nStudent: Nahi yaar, bohot stress hai. Exams aa rahe hain aur ghar pe bhi problems hain.',
        summary: 'Rahul expressed feeling overwhelmed with upcoming exams and family issues.',
        sentiment: 'distress', flag_counselor: true, duration_seconds: 127
      }, { onConflict: 'vapi_call_id' })

      const { data: callLog } = await supabase.from('call_logs').select('id').eq('vapi_call_id', 'demo-call-001').single()
      if (callLog) {
        await supabase.from('counselor_alerts').upsert({
          call_log_id: callLog.id, student_id: rahul.id, status: 'open',
          reason: 'Student expressed feeling overwhelmed and not wanting to attend college.'
        }, { onConflict: 'call_log_id' })
      }
    }

    if (priya) {
      await supabase.from('call_logs').upsert({
        vapi_call_id: 'demo-call-002', direction: 'outbound', student_id: priya.id,
        transcript: 'AI: Hello Priya, how are you doing?\nStudent: Hi, I am okay.',
        summary: 'Priya mentioned being busy with lab work. She acknowledged her attendance issue.',
        sentiment: 'concerned', flag_counselor: false, duration_seconds: 89
      }, { onConflict: 'vapi_call_id' })
    }

    console.log("✅ Fake Students Seed COMPLETE!")
  } catch (err) {
    console.error("Fatal:", err)
  }
}

run()
