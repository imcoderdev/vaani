import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!userData) {
    redirect('/unauthorized')
  }

  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <SidebarProvider>
        <AppSidebar user={userData} />
        <main className="flex-1 min-h-screen bg-[#0d0d0d] flex flex-col">
          <DashboardHeader userName={userData.name ?? 'User'} />
          <div className="flex-1">
            {children}
          </div>
        </main>
        <Toaster />
      </SidebarProvider>
    </div>
  )
}
