'use client'

import { useVapiCall } from '@/hooks/useVapiCall'
import { saveParentCall } from '@/app/actions/saveParentCall'
import { Phone, PhoneOff, Clock, MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useCallback, useRef, useEffect } from 'react'

interface CallRecord {
  id: string
  created_at: string
  summary: string | null
  sentiment: string | null
  duration_seconds: number | null
}

interface AttendanceDay {
  date: string      // e.g. "Mar 1"
  dayOfWeek: string // e.g. "Mon"
  present: boolean
  dayNum: number
}

interface StudentInfo {
  id: string
  name: string
  class_group: string
  section: string
  risk_level: 'green' | 'yellow' | 'red'
  risk_score: number
  attendance_data?: AttendanceDay[]
}

// Generate realistic 30-day attendance data for demo deterministically
function generate30DayAttendance(attendancePct: number): AttendanceDay[] {
  const days: AttendanceDay[] = []
  const absentCount = Math.round(30 * (1 - attendancePct / 100))
  const absentDays = new Set<number>()

  // Deterministic distribution to avoid hydration errors
  if (absentCount > 0) {
    const step = Math.max(1, Math.floor(30 / absentCount))
    for (let i = 0; i < absentCount; i++) {
      let day = (i * step + 5) % 30
      absentDays.add(day)
      // pseudo-randomly cluster some absences
      if (i % 3 === 0 && day + 1 < 30) absentDays.add(day + 1)
    }
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  // Use fixed date bounds to prevent midnight boundary hydration errors
  const now = new Date()

  for (let i = 0; i < 30; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - (29 - i))
    const isWeekend = d.getDay() === 0 || d.getDay() === 6
    days.push({
      date: `${monthNames[d.getMonth()]} ${d.getDate()}`,
      dayOfWeek: dayNames[d.getDay()],
      present: isWeekend ? true : !absentDays.has(i), // weekends always "present" (no school)
      dayNum: d.getDate(),
    })
  }
  return days
}

export function ParentDashboardClient({
  parentName,
  student,
  recentCalls,
}: {
  parentName: string
  student: StudentInfo | null
  recentCalls: CallRecord[]
}) {
  const { startParentCall, endCall, isActive, transcript, isSpeaking } = useVapiCall()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const hasTriggeredSaveRef = useRef(false)
  const [hoveredDay, setHoveredDay] = useState<AttendanceDay | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)

  const handleEndCall = useCallback(async () => {
    endCall()
    if (student?.id && transcript.length > 0 && !hasTriggeredSaveRef.current) {
      hasTriggeredSaveRef.current = true
      setIsSaving(true)
      const fullTranscript = transcript.map(l => `${l.role === 'assistant' ? 'AI' : 'User'}: ${l.text}`).join('\n')
      await saveParentCall({ studentId: student.id, transcript: fullTranscript, parentName })
      setIsSaving(false)
      hasTriggeredSaveRef.current = false
      router.refresh()
    }
  }, [endCall, student, transcript, parentName, router])

  const sentimentColors: Record<string, string> = {
    positive: 'text-green-400',
    neutral: 'text-[#888]',
    concerned: 'text-yellow-400',
    distress: 'text-red-400',
  }

  const riskBadgeClass = {
    red: 'bg-[rgba(220,38,38,0.15)] text-[#DC2626] border-[rgba(220,38,38,0.3)]',
    yellow: 'bg-[rgba(217,119,6,0.15)] text-[#D97706] border-[rgba(217,119,6,0.3)]',
    green: 'bg-[rgba(22,163,74,0.15)] text-[#16A34A] border-[rgba(22,163,74,0.3)]',
  }

  const handleStartCall = async () => {
    await startParentCall({
      school_name: 'K.K. Wagh Institute',
      parent_name: parentName,
      student_name: student?.name ?? 'your child',
      attendance_pct: student ? String(Math.max(0, 100 - student.risk_score)) : '80',
      last_call_summary: recentCalls[0]?.summary ?? 'No recent calls.',
    })
  }

  const attendancePct = student ? Math.max(0, 100 - student.risk_score) : 0
  const initials = student?.name
    ?.split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? '?'

  // Interactive 30-day attendance data
  const [isMounted, setIsMounted] = useState(false)
  const [attendanceData, setAttendanceData] = useState<AttendanceDay[]>([])
  
  useEffect(() => {
    setAttendanceData(generate30DayAttendance(attendancePct))
    setIsMounted(true)
  }, [attendancePct])

  const presentCount = attendanceData.filter(d => d.present).length
  const absentCount = attendanceData.filter(d => !d.present).length
  // Find longest absent streak
  let maxStreak = 0, currentStreak = 0
  attendanceData.forEach(d => {
    if (!d.present) { currentStreak++; maxStreak = Math.max(maxStreak, currentStreak) }
    else { currentStreak = 0 }
  })

  const handleBarHover = (day: AttendanceDay, e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const parent = (e.target as HTMLElement).closest('.attendance-container')?.getBoundingClientRect()
    if (parent) {
      setTooltipPos({ x: rect.left - parent.left + rect.width / 2, y: -8 })
    }
    setHoveredDay(day)
  }

  return (
    <div className="p-4 space-y-4">
      {student ? (
        <>
          {/* Child info card */}
          <div className="bg-[#111] border border-[#1a1a1a] rounded-[10px] p-4">
            {/* Child header */}
            <div className="flex items-center gap-3 mb-3.5">
              <div className="w-10 h-10 rounded-full bg-[#1a3a38] flex items-center justify-center text-[#00E5CC] text-sm font-medium">
                {initials}
              </div>
              <div className="flex-1">
                <div className="text-white text-sm font-medium">{student.name}</div>
                <div className="text-[#555] text-[11px] mt-0.5">
                  {student.class_group}-{student.section} · ENTC-2023-001 · K.K. Wagh Institute
                </div>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium uppercase tracking-[0.5px] ${riskBadgeClass[student.risk_level]}`}>
                {student.risk_level === 'red' ? 'Red' : student.risk_level === 'yellow' ? 'Yellow' : 'Green'}
              </span>
            </div>

            {/* 3-column stats */}
            <div className="grid grid-cols-3 gap-2 mb-3.5">
              <div className="bg-[#1a1a1a] rounded-md p-2 text-center">
                <div className="text-[#D97706] text-lg font-medium">{attendancePct}%</div>
                <div className="text-[#444] text-[9px] uppercase mt-0.5">Attendance</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-md p-2 text-center">
                <div className="text-white text-lg font-medium">{recentCalls.length}</div>
                <div className="text-[#444] text-[9px] uppercase mt-0.5">AI Calls</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-md p-2 text-center">
                <div className="text-[#16A34A] text-lg font-medium">0</div>
                <div className="text-[#444] text-[9px] uppercase mt-0.5">Alerts</div>
              </div>
            </div>

            {/* Interactive 30-day attendance chart */}
            <div className="mb-1">
              {isMounted ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                <div className="text-[#444] text-[10px] uppercase tracking-[1px]">30-day attendance</div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-sm bg-[#1a3a38]" />
                    <span className="text-[#555] text-[9px]">Present ({presentCount})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-sm bg-[rgba(220,38,38,0.4)]" />
                    <span className="text-[#555] text-[9px]">Absent ({absentCount})</span>
                  </div>
                </div>
              </div>

              <div className="attendance-container relative">
                {/* Tooltip */}
                {hoveredDay && tooltipPos && (
                  <div
                    className="absolute z-10 bg-[#222] border border-[#333] rounded-lg px-2.5 py-1.5 pointer-events-none transition-all duration-100 -translate-x-1/2"
                    style={{ left: tooltipPos.x, top: tooltipPos.y, transform: `translate(-50%, -100%)` }}
                  >
                    <div className="text-white text-[10px] font-medium">{hoveredDay.date} ({hoveredDay.dayOfWeek})</div>
                    <div className={`text-[9px] font-medium ${hoveredDay.present ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                      {hoveredDay.present ? '✓ Present' : '✗ Absent'}
                    </div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-[#333]" />
                  </div>
                )}

                <div className="flex items-end gap-[3px] h-[55px]">
                  {attendanceData.map((day, i) => (
                    <div
                      key={i}
                      onMouseEnter={(e) => handleBarHover(day, e)}
                      onMouseLeave={() => { setHoveredDay(null); setTooltipPos(null) }}
                      className={`flex-1 rounded-t-sm cursor-pointer transition-all duration-200 relative group
                        ${day.present
                          ? 'bg-[#1a3a38] hover:bg-[#245a56]'
                          : 'bg-[rgba(220,38,38,0.3)] hover:bg-[rgba(220,38,38,0.5)]'
                        }
                        ${hoveredDay === day ? 'ring-1 ring-white/20 scale-105' : ''}
                      `}
                      style={{
                        height: day.present ? '45px' : '12px',
                      }}
                    />
                  ))}
                </div>

                {/* Date labels (every 5th day) */}
                <div className="flex mt-1">
                  {attendanceData.map((day, i) => (
                    <div key={i} className="flex-1 text-center">
                      {i % 5 === 0 && (
                        <span className="text-[#333] text-[8px]">{day.dayNum}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Streak info */}
              {maxStreak > 1 && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-[#DC2626] rounded-full" />
                  <span className="text-[#DC2626] text-[9px]">
                    Longest absent streak: {maxStreak} days
                  </span>
                </div>
              )}
              </>
              ) : (
                <div className="h-[90px] w-full flex items-center justify-center">
                  <span className="text-[#555] text-xs">Loading attendance...</span>
                </div>
              )}
            </div>
          </div>

          {/* Last AI Check-in Summary */}
          {recentCalls.length > 0 && (
            <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-3">
              <div className="text-[#444] text-[10px] uppercase tracking-[1px] mb-2">Last AI Check-in Summary</div>
              <div className="text-[#888] text-[11px] leading-relaxed mb-2">
                {recentCalls[0].summary ?? 'No summary available.'}
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium uppercase tracking-[0.5px] ${
                  riskBadgeClass[recentCalls[0].sentiment === 'distress' ? 'red' : recentCalls[0].sentiment === 'concerned' ? 'yellow' : 'green']
                }`}>
                  {recentCalls[0].sentiment ?? 'neutral'}
                </span>
                <span className="text-[#444] text-[10px]">
                  {new Date(recentCalls[0].created_at).toLocaleDateString('en-US')} · {recentCalls[0].duration_seconds ? `${Math.round(recentCalls[0].duration_seconds / 60)}m ${recentCalls[0].duration_seconds % 60}s` : '—'}
                </span>
              </div>
            </div>
          )}

          {/* Live transcript (when call is active) */}
          {isActive && (
            <div className="bg-[#0A0A0A] rounded-lg border border-[#1a1a1a] p-3 max-h-40 overflow-y-auto space-y-2">
              {transcript.length === 0 && (
                <p className="text-[#555] text-xs text-center py-4">Connecting...</p>
              )}
              {transcript.map((line, i) => (
                <div key={i} className={`flex gap-2 text-xs ${line.role === 'assistant' ? 'text-[#00E5CC]' : 'text-white'}`}>
                  <span className="shrink-0">{line.role === 'assistant' ? 'AI:' : 'You:'}</span>
                  <span>{line.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Speak to School AI button */}
          <button
            onClick={isActive ? handleEndCall : handleStartCall}
            className={`w-full py-3 rounded-lg text-xs font-medium uppercase tracking-[1px] flex items-center justify-center gap-2 transition-all
              ${isActive
                ? 'bg-red-900/30 border border-red-500/40 text-red-400 hover:bg-red-900/50'
                : 'bg-[#00E5CC] text-black hover:bg-[#00ccb4]'
              }`}
          >
            {isSaving ? (
              <span className="text-[#00E5CC]">Saving call...</span>
            ) : isActive ? (
              <><PhoneOff size={14} /> End Call {isSpeaking && '🎙️'}</>
            ) : (
              <><Phone size={14} /> 📞 Speak to School AI</>
            )}
          </button>
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">👨‍👩‍👧</p>
          <h3 className="text-white font-medium text-sm">No Student Linked</h3>
          <p className="text-[#666] text-[11px] mt-2">Contact your school administrator to link your child.</p>
        </div>
      )}

      {/* Recent calls (if more than one) */}
      {recentCalls.length > 1 && (
        <div className="space-y-2.5">
          <h2 className="text-[#444] text-[10px] uppercase tracking-[1.5px]">Previous AI Calls</h2>
          {recentCalls.slice(1).map((call) => (
            <div key={call.id} className="bg-[#111] border border-[#1a1a1a] rounded-lg p-3 flex items-start gap-3">
              <MessageCircle className="w-4 h-4 text-[#444] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-[11px]">{call.summary ?? 'No summary available.'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] ${sentimentColors[call.sentiment ?? 'neutral']}`}>{call.sentiment ?? 'neutral'}</span>
                  {call.duration_seconds && (
                    <span className="text-[#555] text-[10px] flex items-center gap-1"><Clock size={10}/>{Math.round(call.duration_seconds / 60)}m</span>
                  )}
                  <span className="text-[#555] text-[10px]">{new Date(call.created_at).toLocaleDateString('en-US')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
