'use client'

import { StudentRiskCard } from '@/components/dashboard/student-risk-card'
import { Phone, AlertTriangle, Users, Activity } from 'lucide-react'

interface Student {
  id: string
  name: string
  phone: string
  class_group: string
  section: string
  attendance_pct: number
  risk_level: 'green' | 'yellow' | 'red'
  risk_score: number
  roll_number: string | null
  teacher_profile_id?: string
}

export function TeacherDashboardClient({
  students,
  totalStudents,
  callsToday,
  atRisk,
  openAlerts,
}: {
  students: Student[]
  totalStudents: number
  callsToday: number
  atRisk: number
  openAlerts: number
}) {
  const stats = [
    { label: 'Students', value: totalStudents, icon: Users, color: 'text-[#00E5CC]' },
    { label: 'Calls Today', value: callsToday, icon: Phone, color: 'text-green-400' },
    { label: 'At Risk', value: atRisk, icon: Activity, color: 'text-yellow-400' },
    { label: 'Open Alerts', value: openAlerts, icon: AlertTriangle, color: 'text-red-400' },
  ]
  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-black text-3xl text-white uppercase tracking-tight">Student Risk Board</h1>
        <p className="text-[#666] font-mono text-sm mt-1">Monitor student welfare · Trigger AI check-in calls</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#111] border border-[#222] rounded-xl p-4 flex items-center gap-4">
            <stat.icon className={`w-8 h-8 ${stat.color} shrink-0`} />
            <div>
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="text-[10px] uppercase tracking-widest text-[#555] font-mono">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Student cards */}
      {students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-4xl mb-4">📋</p>
          <h3 className="text-white font-bold text-lg">No Students Yet</h3>
          <p className="text-[#666] text-sm mt-2 font-mono">Students will appear here once added to the system.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => (
            <StudentRiskCard key={student.id} student={student} />
          ))}
        </div>
      )}
    </div>
  )
}
