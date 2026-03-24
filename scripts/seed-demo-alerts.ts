// Quick seed script — run with: npx tsx scripts/seed-demo-alerts.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://wwbtcwkkmaxvvzrkjxpm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3YnRjd2trbWF4dnZ6cmtqeHBtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA4NTk5NCwiZXhwIjoyMDg5NjYxOTk0fQ.WGN9_sSOzb4QpTJ6CamsxmcT3MrmDZ4W_RKagVmgxi0'
)

async function seed() {
  // Get the student profile
  const { data: student } = await supabase
    .from('student_profiles')
    .select('id, user:users(name)')
    .eq('roll_number', 'ENTC-2023-001')
    .single()

  if (!student) {
    console.log('No student found. Login as student first to create their profile.')
    return
  }

  console.log(`Found student: ${(student as any).user?.name} (${student.id})`)

  // Check if alerts already exist
  const { count } = await supabase
    .from('counselor_alerts')
    .select('*', { count: 'exact', head: true })

  if (count && count > 0) {
    console.log(`Already have ${count} alerts. Skipping seed.`)
    return
  }

  // Insert demo alerts
  const { error } = await supabase.from('counselor_alerts').insert([
    {
      student_id: student.id,
      status: 'open',
      reason: 'Bahut overwhelming lag raha hai, ghar pe bhi problems hain... — Student expressed feeling overwhelmed with exams and family issues during AI check-in call. AI Summary: Student mentioned exam stress and family problems. Showed signs of emotional distress. Recommend immediate counselor intervention.',
    },
    {
      student_id: student.id,
      status: 'open',
      reason: 'College aane ka mann nahi karta... — Student expressed reluctance to attend college and mentioned feeling isolated. AI Summary: Student showing signs of social withdrawal and possible depression. Needs counselor follow-up within 24 hours.',
    },
  ])

  if (error) {
    console.error('Seed failed:', error)
  } else {
    console.log('✅ Seeded 2 demo counselor alerts')
  }

  // Also insert a demo call_log for the student so calls pages have data
  const { error: callErr } = await supabase.from('call_logs').insert([
    {
      direction: 'outbound',
      student_id: student.id,
      transcript: 'AI: Hi Namdev, this is BridgeAI from K.K. Wagh Institute. How are you doing today?\nUser: Theek hoon sir, bas thoda stressed hoon exams ke baare mein.\nAI: I understand. Exam stress is very common. Can you tell me more about what is worrying you?\nUser: Bahut overwhelming lag raha hai, ghar pe bhi problems hain...\nAI: I hear you. It sounds like you are dealing with a lot right now. Have you talked to anyone about this?\nUser: Nahi, kisise nahi bola.\nAI: It is important that you share how you feel. I will make sure your counselor reaches out to you. You are not alone in this.',
      summary: 'Student mentioned exam stress and family problems. Showed signs of emotional distress.',
      sentiment: 'distress',
      flag_counselor: true,
      duration_seconds: 120,
    },
    {
      direction: 'outbound',
      student_id: student.id,
      transcript: 'AI: Hello Namdev, checking in from K.K. Wagh. How was your week?\nUser: College aane ka mann nahi karta... bahut akela feel hota hai.\nAI: That sounds really tough. Can you tell me more about why you feel this way?\nUser: Dost nahi hain, class mein koi baat nahi karta.\nAI: I understand that feeling isolated can be very painful. Your school cares about you. I will flag this so someone can connect with you soon.',
      summary: 'Student expressed reluctance to attend college and mentioned feeling isolated.',
      sentiment: 'distress',
      flag_counselor: true,
      duration_seconds: 95,
    },
    {
      direction: 'inbound',
      student_id: student.id,
      transcript: 'AI: Good morning! This is BridgeAI. How are things going?\nUser: Accha hai, last week better tha.\nAI: Great to hear! Keep it up. Is there anything else on your mind?\nUser: Nahi, sab theek hai. Thank you.',
      summary: 'Student reports improvement. Positive outlook compared to previous check-in.',
      sentiment: 'positive',
      flag_counselor: false,
      duration_seconds: 45,
    },
  ])

  if (callErr) {
    console.error('Call seed failed:', callErr)
  } else {
    console.log('✅ Seeded 3 demo call logs')
  }
}

seed()
