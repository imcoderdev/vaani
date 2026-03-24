import { createClient } from '@/lib/supabase/server'

export default async function StudentsPage() {
  const supabase = await createClient()

  const { data: students } = await supabase
    .from('student_profiles')
    .select('id, class_group, section, roll_number, risk_level, risk_score, user:users(name, email, phone)')
    .order('risk_score', { ascending: false })

  return (
    <div className="p-4 space-y-4">
      <div className="text-[#444] text-[10px] uppercase tracking-[1.5px]">
        {students?.length ?? 0} Students Enrolled
      </div>

      <div className="bg-[#111] border border-[#1a1a1a] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1a1a1a]">
              <th className="text-left text-[#444] text-[9px] uppercase tracking-[1px] px-3 py-2">Student</th>
              <th className="text-left text-[#444] text-[9px] uppercase tracking-[1px] px-3 py-2">Class</th>
              <th className="text-left text-[#444] text-[9px] uppercase tracking-[1px] px-3 py-2">Roll No</th>
              <th className="text-left text-[#444] text-[9px] uppercase tracking-[1px] px-3 py-2">Risk</th>
              <th className="text-left text-[#444] text-[9px] uppercase tracking-[1px] px-3 py-2">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {(students ?? []).map((s: any) => {
              const user = Array.isArray(s.user) ? s.user[0] : s.user
              const attendancePct = Math.max(0, 100 - (s.risk_score ?? 0))
              const riskColors: Record<string, string> = {
                red: 'text-[#DC2626] bg-[rgba(220,38,38,0.15)] border-[rgba(220,38,38,0.3)]',
                yellow: 'text-[#D97706] bg-[rgba(217,119,6,0.15)] border-[rgba(217,119,6,0.3)]',
                green: 'text-[#16A34A] bg-[rgba(22,163,74,0.15)] border-[rgba(22,163,74,0.3)]',
              }
              const barColor = s.risk_level === 'red' ? '#DC2626' : s.risk_level === 'yellow' ? '#D97706' : '#16A34A'

              return (
                <tr key={s.id} className="border-b border-[#1a1a1a] last:border-0 hover:bg-[#0f0f0f] transition-colors">
                  <td className="px-3 py-2.5">
                    <div className="text-white text-[11px] font-medium">{user?.name ?? '—'}</div>
                    <div className="text-[#444] text-[10px]">{user?.email ?? ''}</div>
                  </td>
                  <td className="px-3 py-2.5 text-[#888] text-[11px]">{s.class_group}-{s.section}</td>
                  <td className="px-3 py-2.5 text-[#888] text-[11px] font-mono">{s.roll_number ?? '—'}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium uppercase tracking-[0.5px] ${riskColors[s.risk_level] ?? riskColors.green}`}>
                      {s.risk_level === 'red' ? 'High' : s.risk_level === 'yellow' ? 'Medium' : 'Low'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-[#1a1a1a] rounded-sm overflow-hidden">
                        <div className="h-full rounded-sm" style={{ width: `${attendancePct}%`, background: barColor }} />
                      </div>
                      <span className="text-[#888] text-[10px]">{attendancePct}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {(students ?? []).length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-white text-sm font-medium">No Students Yet</p>
            <p className="text-[#555] text-[11px] mt-1">Students appear here when they sign up.</p>
          </div>
        )}
      </div>
    </div>
  )
}
