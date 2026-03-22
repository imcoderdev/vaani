import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/landing/Header'
import { HeroSection } from '@/components/landing/HeroSection'
import { ValueProps } from '@/components/landing/ValueProps'
import { CTABlock } from '@/components/landing/CTABlock'
import { Footer } from '@/components/landing/Footer'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Get user role and redirect appropriately
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = userData?.role || 'student'

    switch (role) {
      case 'admin':
        redirect('/admin')
      case 'teacher':
      case 'counselor':
        redirect('/dashboard')
      case 'parent':
        redirect('/parent')
      case 'student':
        redirect('/student')
      default:
        redirect('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-brutal-bg text-brutal-fg selection:bg-brutal-accent selection:text-brutal-bg font-sans">
      <Header />
      <main className="flex-1 flex flex-col w-full">
        <HeroSection />
        <ValueProps />
        <CTABlock />
      </main>
      <Footer />
    </div>
  )
}
