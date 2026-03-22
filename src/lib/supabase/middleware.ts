import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if needed
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/auth/callback', '/auth/error']
  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  // If user is not logged in and trying to access protected route
  if (!user && !isPublicRoute && request.nextUrl.pathname !== '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in, handle role-based routing
  if (user) {
    if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/') {
      const userRole = request.cookies.get('user_role')?.value as string | undefined
      if (userRole) {
        // Redirect to their specific dashboard based on cookie
        const roleRedirects: Record<string, string> = {
          admin: '/dashboard/admin',
          teacher: '/dashboard',
          counselor: '/dashboard/counselor',
          parent: '/dashboard/parent',
          student: '/dashboard/student',
        }
        const url = request.nextUrl.clone()
        url.pathname = roleRedirects[userRole] || '/dashboard'
        return NextResponse.redirect(url)
      }
    }

    // Protect dashboard sub-routes based on cookie
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      const userRole = request.cookies.get('user_role')?.value
      const path = request.nextUrl.pathname

      if (!userRole) {
        // If missing cookie but logged in, bounce to unauthorized
        const url = request.nextUrl.clone()
        url.pathname = '/unauthorized'
        return NextResponse.redirect(url)
      }

      // Strict route protection
      if (userRole === 'student' && !path.startsWith('/dashboard/student')) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard/student'
        return NextResponse.redirect(url)
      }
      if (userRole === 'parent' && !path.startsWith('/dashboard/parent')) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard/parent'
        return NextResponse.redirect(url)
      }
      if (userRole === 'counselor' && !path.startsWith('/dashboard/counselor')) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard/counselor'
        return NextResponse.redirect(url)
      }
      if (userRole === 'admin' && !path.startsWith('/dashboard/admin')) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard/admin'
        return NextResponse.redirect(url)
      }
      if (userRole === 'teacher' && (
        path.startsWith('/dashboard/admin') || 
        path.startsWith('/dashboard/counselor') || 
        path.startsWith('/dashboard/parent') ||
        path.startsWith('/dashboard/student')
        )) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
