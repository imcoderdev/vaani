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

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
  try {
    console.log("Forcing link between Yash (Parent) and Namdev (Student)...")

    // 1. Get users from public.users (they exist here since they logged in once)
    const { data: publicUsers, error } = await supabase.from('users').select('id, email')
    if (error) throw new Error(`Users Error: ${error.message}`)
    
    const emailToId: Record<string, string> = {}
    publicUsers.forEach((u: any) => {
      if (u.email) emailToId[u.email] = u.id
    })

    const namdevId = emailToId['nskale370223@kkwagh.edu.in']
    const yashId = emailToId['factt80@gmail.com']
    const teacherId = emailToId['mistyraju0@gmail.com']

    if (!namdevId) console.error("Namdev user not found in auth!")
    if (!yashId) console.error("Yash user not found in auth!")
    
    // 2. Ensure Namdev Student Profile & Phone in users
    if (namdevId) {
      const { error: phoneErr } = await supabase.from('users').update({ phone: '+919067038936' }).eq('id', namdevId)
      if (phoneErr) console.error("Namdev Phone Error:", phoneErr)

      const { error: studentUpsertError } = await supabase.from('student_profiles').upsert({
        user_id: namdevId, roll_number: 'ENTC-2023-001', class_group: 'SE', section: 'A', risk_level: 'yellow', risk_score: 38
      }, { onConflict: 'user_id' })
      if (studentUpsertError) console.error("Namdev Upsert Error:", studentUpsertError)
    }

    // 3. Ensure Yash Parent Profile
    if (yashId) {
      await supabase.from('parent_profiles').upsert({
        user_id: yashId, phone: null
      }, { onConflict: 'user_id' })
    }

    // 4. Link them
    if (namdevId && yashId) {
      const { data: parentProf } = await supabase.from('parent_profiles').select('id').eq('user_id', yashId).single()
      const { data: studentProf } = await supabase.from('student_profiles').select('id').eq('user_id', namdevId).single()
      
      if (parentProf && studentProf) {
        await supabase.from('parent_students').upsert({
          parent_id: parentProf.id,
          student_id: studentProf.id
        }, { onConflict: 'parent_id,student_id' })
        console.log("Successfully linked Parent to Student!")
      } else {
        console.log("Failed to fetch profiles for linking.", { parentProf, studentProf })
      }
    }
    
    // 5. Ensure Teacher Profile
    if (teacherId) {
        await supabase.from('teacher_profiles').upsert({
            user_id: teacherId, class_group: 'SE', section: 'A', department: 'Electronics & Telecom'
        }, { onConflict: 'user_id' })
        console.log("Ensured Teacher profile!")
    }

    // 6. Seed Attendance for Namdev
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
      console.log(`Seeded attendance for ${roll_number}`)
    }
    await seedAttendance('ENTC-2023-001', (day) => ![2, 5, 8, 11, 14, 17, 20, 28].includes(day))

    console.log("Done.")
  } catch (err) {
    console.error("Fatal:", err)
  }
}

run()
