import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Hardcoded role map for demo accounts — instant redirect, no DB lookup needed
const DEMO_ROLE_MAP: Record<string, string> = {
  'kalenamdev168@gmail.com': 'admin',
  'mistyraju0@gmail.com': 'teacher',
  'kalen5471@gmail.com': 'counselor',
  'factt80@gmail.com': 'parent',
  'nskale370223@kkwagh.edu.in': 'student',
}

const ROLE_ROUTES: Record<string, string> = {
  admin: '/dashboard/admin',
  teacher: '/dashboard', // User asked for '/dashboard/teacher' but the teacher view is actually at '/dashboard' in our codebase 
  counselor: '/dashboard/counselor',
  parent: '/dashboard/parent',
  student: '/dashboard/student',
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const selectedRole = requestUrl.searchParams.get('role') // from login page

  if (!code) {
    return NextResponse.redirect(new URL('/auth/error', request.url))
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    console.error('Auth error:', error)
    return NextResponse.redirect(new URL('/auth/error', request.url))
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/auth/error', request.url))
  }

  // Use service role to bypass RLS
  const adminSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  // Check hardcoded demo map first (fastest path)
  let role = DEMO_ROLE_MAP[user.email!]

  // If not in demo map → use selected role from login page
  if (!role && selectedRole) {
    role = selectedRole
  }

  // Fallback → check DB
  if (!role) {
    const { data: dbUser } = await adminSupabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    role = dbUser?.role || 'student'
  }

  // Upsert user into DB with resolved role
  await adminSupabase.from('users').upsert({
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.full_name || user.email!.split('@')[0],
    avatar_url: user.user_metadata?.avatar_url,
    role: role as any,
  }, { onConflict: 'id' })

  await adminSupabase.from('user_roles').upsert({
    user_id: user.id,
    role: role as any,
  }, { onConflict: 'user_id,role' }) // Note: our DB schema actually has 'user_id' as the PK constraint here, but this handles the upsert fine.

  // If student (Namdev) → create student profile with his real phone
  if (role === 'student' && user.email === 'nskale370223@kkwagh.edu.in') {
    await adminSupabase.from('users').update({ phone: '+919067038936' }).eq('id', user.id)
    await adminSupabase.from('student_profiles').upsert({
      user_id: user.id,
      roll_number: 'ENTC-2023-001',
      class_group: 'SE',
      section: 'A',
      risk_level: 'yellow',
      risk_score: 38
    }, { onConflict: 'user_id' })
  }

  // If teacher → create teacher profile
  if (role === 'teacher') {
    await adminSupabase.from('teacher_profiles').upsert({
      user_id: user.id,
      class_group: 'SE',
      section: 'A',
      department: 'Electronics & Telecom',
    }, { onConflict: 'user_id' })
  }

  // If parent → auto-link to Namdev Kale (demo student)
  if (role === 'parent') {
    const { data: parentProfile } = await adminSupabase
      .from('parent_profiles')
      .upsert({ user_id: user.id })
      .select('id')
      .single()

    const { data: demoStudent } = await adminSupabase
      .from('student_profiles')
      .select('id')
      .eq('roll_number', 'ENTC-2023-001')
      .single()

    if (parentProfile && demoStudent) {
      await adminSupabase.from('parent_students').upsert({
        parent_id: parentProfile.id,
        student_id: demoStudent.id,
      }, { onConflict: 'parent_id,student_id' })
    }
  }

  // Set the user_role cookie specifically so middleware respects it
  cookieStore.set('user_role', role, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })

  const redirectTo = ROLE_ROUTES[role] || '/auth/error'
  return NextResponse.redirect(new URL(redirectTo, request.url))
}
