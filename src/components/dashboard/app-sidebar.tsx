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
  Play,
  Mail,
} from 'lucide-react'

interface AppSidebarProps {
  user: User
}

const teacherMenuItems = [
  { title: 'Risk Board', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Students', url: '/dashboard/students', icon: Users },
  { title: 'Call Logs', url: '/dashboard/calls', icon: Mail },
  { title: 'Alerts', url: '/dashboard/alerts', icon: AlertTriangle, badge: 2 },
]

const counselorMenuItems = [
  { title: 'Dashboard', url: '/dashboard/counselor', icon: LayoutDashboard },
  { title: 'Alerts', url: '/dashboard/alerts', icon: AlertTriangle, badge: 2 },
  { title: 'All Calls', url: '/dashboard/calls', icon: Mail },
]

const adminMenuItems = [
  { title: 'Overview', url: '/dashboard/admin', icon: LayoutDashboard },
  { title: 'Users', url: '/dashboard/admin/users', icon: Users },
  { title: 'Settings', url: '/dashboard/admin/settings', icon: Settings },
]

const parentMenuItems = [
  { title: 'My Child', url: '/dashboard/parent', icon: LayoutDashboard },
  { title: 'Call History', url: '/dashboard/parent/calls', icon: Mail },
  { title: 'Speak to AI', url: '/dashboard/parent', icon: Play },
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
    <Sidebar className="!w-[200px] !min-w-[200px]">
      <SidebarHeader className="border-b border-[#1a1a1a] px-4 py-4 bg-[#0A0A0A]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00E5CC]" />
          <span className="text-white text-xs font-medium tracking-[2px] uppercase">BridgeAI</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#0A0A0A] px-0">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#333] text-[9px] uppercase tracking-[1.5px] px-4 pt-3 pb-1">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      render={<a href={item.url} />}
                      className={`rounded-none px-4 py-2 text-xs flex items-center gap-2.5 relative transition-all duration-150
                        ${isActive
                          ? 'text-[#00E5CC] bg-[#0f1f1e]'
                          : 'text-[#555] hover:text-[#999] hover:bg-[#111]'
                        }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#00E5CC]" />
                      )}
                      <item.icon className="w-3.5 h-3.5 shrink-0 opacity-70" />
                      <span>{item.title}</span>
                      {'badge' in item && item.badge && (
                        <span className="ml-auto bg-[#DC2626] text-white text-[9px] px-1.5 py-0 rounded-full font-medium">
                          {item.badge}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-[#1a1a1a] bg-[#0A0A0A] p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#555] hover:text-[#999] hover:bg-[#111] transition-colors text-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
