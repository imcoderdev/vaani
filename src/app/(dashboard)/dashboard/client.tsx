'use client'

import { StudentRiskCard } from '@/components/dashboard/student-risk-card'

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
  const coverage = totalStudents > 0 ? Math.round((callsToday / totalStudents) * 100) : 0

  return (
    <div className="p-4 space-y-4">
      {/* Stats bar — 4 compact cards */}
      <div className="grid grid-cols-4 gap-2.5">
        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-3">
          <div className="text-[#444] text-[10px] uppercase tracking-[1px] mb-1">Students</div>
          <div className="text-white text-xl font-medium">{totalStudents}</div>
        </div>
        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-3">
          <div className="text-[#444] text-[10px] uppercase tracking-[1px] mb-1">Flagged</div>
          <div className="text-[#DC2626] text-xl font-medium">{atRisk}</div>
        </div>
        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-3">
          <div className="text-[#444] text-[10px] uppercase tracking-[1px] mb-1">Called Today</div>
          <div className="text-[#00E5CC] text-xl font-medium">{callsToday}</div>
        </div>
        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-3">
          <div className="text-[#444] text-[10px] uppercase tracking-[1px] mb-1">Coverage</div>
          <div className="text-[#D97706] text-xl font-medium">{coverage}%</div>
        </div>
      </div>

      {/* Section label */}
      <div className="text-[#666] text-[10px] uppercase tracking-[1.5px]">
        Student Risk Board — SE-A
      </div>

      {/* Student cards — 2-column grid */}
      {students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-4xl mb-4">📋</p>
          <h3 className="text-white font-medium text-sm">No Students Yet</h3>
          <p className="text-[#666] text-[11px] mt-2">Students will appear here once added to the system.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {students.map((student) => (
            <StudentRiskCard key={student.id} student={student} />
          ))}
        </div>
      )}
    </div>
  )
}
