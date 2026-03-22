'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import type { User } from '@/types/database'
import {
  LayoutDashboard,
  Users,
  Phone,
  AlertTriangle,
  Settings,
  LogOut,
  GraduationCap,
} from 'lucide-react'

interface AppSidebarProps {
  user: User
}

const teacherMenuItems = [
  { title: 'Risk Board', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Call History', url: '/dashboard/calls', icon: Phone },
  { title: 'Alerts', url: '/dashboard/alerts', icon: AlertTriangle },
]

const counselorMenuItems = [
  { title: 'Alert Feed', url: '/dashboard/counselor', icon: AlertTriangle },
  { title: 'Students', url: '/dashboard/students', icon: GraduationCap },
  { title: 'Call History', url: '/dashboard/calls', icon: Phone },
]

const adminMenuItems = [
  { title: 'Overview', url: '/dashboard/admin', icon: LayoutDashboard },
  { title: 'Users', url: '/dashboard/admin/users', icon: Users },
  { title: 'Settings', url: '/dashboard/admin/settings', icon: Settings },
]

const parentMenuItems = [
  { title: 'Dashboard', url: '/dashboard/parent', icon: LayoutDashboard },
  { title: 'Call History', url: '/dashboard/parent/calls', icon: Phone },
]

const studentMenuItems = [
  { title: 'Dashboard', url: '/dashboard/student', icon: LayoutDashboard },
  { title: 'My Calls', url: '/dashboard/student/calls', icon: Phone },
]

export function AppSidebar({ user }: AppSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getMenuItems = () => {
    switch (user.role) {
      case 'admin': return adminMenuItems
      case 'teacher': return teacherMenuItems
      case 'counselor': return counselorMenuItems
      case 'parent': return parentMenuItems
      case 'student': return studentMenuItems
      default: return teacherMenuItems
    }
  }

  const menuItems = getMenuItems()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-[#222] p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#00E5CC] rounded-lg flex items-center justify-center">
            <Phone className="w-4 h-4 text-black" />
          </div>
          <div>
            <h2 className="font-black text-white text-sm tracking-tight">BridgeCall AI</h2>
            <p className="text-[10px] text-[#555] font-mono uppercase tracking-widest">
              {user.role}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#0A0A0A]">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#444] font-mono text-[10px] uppercase tracking-widest">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname === item.url}
                    render={<a href={item.url} />}
                    className={`${pathname === item.url ? 'text-[#00E5CC] bg-[#00E5CC]/10' : 'text-[#888] hover:text-white'}`}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="font-mono text-xs">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-[#222] bg-[#0A0A0A] p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center text-xs font-bold text-white shrink-0">
            {user.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-semibold truncate">{user.name}</p>
            <p className="text-[#555] text-[10px] font-mono truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#666] hover:text-white hover:bg-[#1a1a1a] transition-colors text-xs font-mono"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
