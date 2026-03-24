'use client'

import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Risk Board',
  '/dashboard/students': 'Students',
  '/dashboard/calls': 'Call Logs',
  '/dashboard/alerts': 'Alerts',
  '/dashboard/counselor': 'Counselor Alerts',
  '/dashboard/parent': 'Parent Portal',
  '/dashboard/parent/calls': 'Call History',
  '/dashboard/student': 'Student Dashboard',
  '/dashboard/student/calls': 'My Calls',
  '/dashboard/admin': 'Admin Overview',
}

export function DashboardHeader({ userName }: { userName: string }) {
  const pathname = usePathname()
  const title = pageTitles[pathname] ?? 'Dashboard'
  const initials = userName
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="flex items-center justify-between px-5 py-3.5 border-b border-[#1a1a1a] bg-[#0A0A0A]">
      <span className="text-white text-[13px] font-medium uppercase tracking-[1px]">
        {title}
      </span>
      <div className="flex items-center gap-3">
        <div className="relative cursor-pointer text-[#555] hover:text-[#888] transition-colors">
          <Bell className="w-4 h-4" />
          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#DC2626] rounded-full" />
        </div>
        <div className="w-7 h-7 rounded-full bg-[#1a3a38] flex items-center justify-center text-[#00E5CC] text-[11px] font-medium">
          {initials}
        </div>
        <span className="text-[#666] text-[11px]">{userName}</span>
      </div>
    </header>
  )
}
