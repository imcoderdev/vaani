import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    // Use service_role key to bypass RLS and access auth.admin
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Get all auth users to find their IDs
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) throw new Error(`Auth Error: ${authError.message}`)

    const emailToId: Record<string, string> = {}
    authUsers.forEach(u => {
      if (u.email) emailToId[u.email] = u.id
    })

    const requiredEmails = [
      'kalenamdev168@gmail.com',
      'mistyraju0@gmail.com',
      'kalen5471@gmail.com',
      'factt80@gmail.com',
      'nskale370223@kkwagh.edu.in'
    ]

    // Verify all 5 exist in auth
    for (const em of requiredEmails) {
      if (!emailToId[em]) {
        console.warn(`User ${em} not found in auth.users. They must sign in once first for a full demo linking.`)
      }
    }

    // 2. Clean up old Namdev's phone number
    // We update those where phone = '+919067038936' AND email != namdev
    const { data: wrongProfiles } = await supabase
      .from('student_profiles')
      .select('user_id, id')
      .eq('phone', '+919067038936')
    
    if (wrongProfiles && emailToId['nskale370223@kkwagh.edu.in']) {
      for (const p of wrongProfiles) {
        if (p.user_id !== emailToId['nskale370223@kkwagh.edu.in']) {
          await supabase.from('student_profiles').update({ phone: '+910000000000' }).eq('id', p.id)
        }
      }
    }

    // 3. Upsert real users into public.users
    const usersToInsert = [
      { email: 'kalenamdev168@gmail.com', name: 'Namdev Kale', role: 'admin' },
      { email: 'mistyraju0@gmail.com', name: 'Raju Misty', role: 'teacher' },
      { email: 'kalen5471@gmail.com', name: 'BridgeCall Counselor', role: 'counselor' },
      { email: 'factt80@gmail.com', name: 'Yash Kale', role: 'parent' },
      { email: 'nskale370223@kkwagh.edu.in', name: 'Namdev Kale', role: 'student' }
    ].filter(u => emailToId[u.email]).map(u => ({
      id: emailToId[u.email],
      email: u.email,
      name: u.name,
      role: u.role
    }))

    if (usersToInsert.length > 0) {
      await supabase.from('users').upsert(usersToInsert, { onConflict: 'id' })
      await supabase.from('user_roles').upsert(
        usersToInsert.map(u => ({ user_id: u.id, role: u.role })),
        { onConflict: 'user_id' }
      )
    }

    // 4. Create Teacher Profile for Raju Misty
    const teacherId = emailToId['mistyraju0@gmail.com']
    if (teacherId) {
      await supabase.from('teacher_profiles').upsert({
        user_id: teacherId,
        class_group: 'SE',
        section: 'A',
        department: 'Electronics & Telecom'
      }, { onConflict: 'user_id' })
    }

    // 5. Create Student Profile for Namdev
    const namdevStudentId = emailToId['nskale370223@kkwagh.edu.in']
    if (namdevStudentId) {
      await supabase.from('student_profiles').upsert({
        user_id: namdevStudentId,
        roll_number: 'ENTC-2023-001',
        class_group: 'SE',
        section: 'A',
        phone: '+919067038936',
        risk_level: 'yellow',
        risk_score: 38
      }, { onConflict: 'user_id' })
    }

    // 6. Create Parent Profile for Yash Kale
    const yashParentId = emailToId['factt80@gmail.com']
    if (yashParentId && namdevStudentId) {
      const { data: parentProf } = await supabase.from('parent_profiles').upsert({
        user_id: yashParentId,
        phone: null
      }, { onConflict: 'user_id' }).select('id').single()

      const { data: studentProf } = await supabase.from('student_profiles').select('id').eq('user_id', namdevStudentId).single()

      // Link Yash to Namdev
      if (parentProf && studentProf) {
        await supabase.from('parent_students').upsert({
          parent_id: parentProf.id,
          student_id: studentProf.id
        }, { onConflict: 'parent_id,student_id' })
      }
    }

    // 7. Seed 4 Fake Students into public.users
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

    // 8. Seed Attendance
    const seedAttendance = async (roll_number: string, patternFn: (day: number) => boolean) => {
      const { data: prof } = await supabase.from('student_profiles').select('id').eq('roll_number', roll_number).single()
      if (!prof) return

      const attendanceRecords = []
      const today = new Date()
      for (let i = 1; i <= 30; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        attendanceRecords.push({
          student_id: prof.id,
          date: d.toISOString().split('T')[0],
          status: patternFn(i) ? 'present' : 'absent',
          present: patternFn(i) // include both for safety against schema drift
        })
      }
      
      // Instead of throwing on conflict, we delete old and re-seed to ensure it works
      await supabase.from('attendance').delete().eq('student_id', prof.id)
      await supabase.from('attendance').insert(attendanceRecords)
    }

    // Namdev
    await seedAttendance('ENTC-2023-001', (day) => ![2, 5, 8, 11, 14, 17, 20, 28].includes(day))
    // Fakes
    await seedAttendance('ENTC-2023-002', (day) => day % 3 !== 0)
    await seedAttendance('ENTC-2023-003', (day) => day % 3 !== 0)
    await seedAttendance('ENTC-2023-004', (day) => day % 3 !== 0)
    await seedAttendance('ENTC-2023-005', (day) => day % 3 !== 0)

    // 9. Call Logs
    const { data: rahul } = await supabase.from('student_profiles').select('id').eq('roll_number', 'ENTC-2023-002').single()
    const { data: priya } = await supabase.from('student_profiles').select('id').eq('roll_number', 'ENTC-2023-003').single()
    const { data: teacherProf } = await supabase.from('teacher_profiles').select('id').eq('user_id', emailToId['mistyraju0@gmail.com']).single()

    if (rahul && teacherProf) {
      await supabase.from('call_logs').upsert({
        vapi_call_id: 'demo-call-001',
        direction: 'outbound',
        student_id: rahul.id,
        triggered_by_id: teacherProf.id,
        transcript: 'AI: Hello Rahul bhai, kaisa chal raha hai?\nStudent: Nahi yaar, bohot stress hai. Exams aa rahe hain aur ghar pe bhi problems hain.\nAI: Arre tension mat le, bata kya ho raha hai?\nStudent: Bas sab overwhelming lag raha hai, kabhi kabhi college aane ka mann hi nahi karta.\nAI: Samajh sakta hoon yaar. Counselor se baat kar, woh help karenge.',
        summary: 'Rahul expressed feeling overwhelmed with upcoming exams and family issues. He mentioned not wanting to come to college and feeling stressed.',
        sentiment: 'distress',
        flag_counselor: true,
        duration_seconds: 127
      }, { onConflict: 'vapi_call_id' })

      const { data: callLog } = await supabase.from('call_logs').select('id').eq('vapi_call_id', 'demo-call-001').single()
      if (callLog) {
        await supabase.from('counselor_alerts').upsert({
          call_log_id: callLog.id,
          student_id: rahul.id,
          status: 'open',
          reason: 'Student expressed feeling overwhelmed and not wanting to attend college. Possible burnout or family crisis. Immediate counselor check-in recommended.'
        }, { onConflict: 'call_log_id' })
      }
    }

    if (priya && teacherProf) {
      await supabase.from('call_logs').upsert({
        vapi_call_id: 'demo-call-002',
        direction: 'outbound',
        student_id: priya.id,
        triggered_by_id: teacherProf.id,
        transcript: 'AI: Hello Priya, how are you doing?\nStudent: Hi, I am okay. Just was busy with lab assignments.\nAI: That is fine! Attendance is a bit low — 55%. Everything alright?\nStudent: Yes sir, will be regular from now.',
        summary: 'Priya mentioned being busy with lab work. She acknowledged her attendance issue and committed to being more regular.',
        sentiment: 'concerned',
        flag_counselor: false,
        duration_seconds: 89
      }, { onConflict: 'vapi_call_id' })
    }

    return NextResponse.json({ success: true, message: 'Database seeded successfully for demo.' })

  } catch (error: any) {
    console.error('Seed error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
