import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'

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
        <main className="flex-1 min-h-screen bg-[#0A0A0A]">
          <header className="sticky top-0 z-10 bg-[#0A0A0A] border-b border-[#222] px-4 py-3 flex items-center gap-4">
            <SidebarTrigger className="text-[#666] hover:text-white" />
            <span className="font-mono text-xs text-[#555] uppercase tracking-widest">BridgeCall AI</span>
          </header>
          <div className="p-0">
            {children}
          </div>
        </main>
        <Toaster />
      </SidebarProvider>
    </div>
  )
}

