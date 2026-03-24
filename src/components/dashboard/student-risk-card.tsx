'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Loader2, User, Bot, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { triggerStudentCall, pollCallStatus, finalizeCallLog } from '@/app/actions/triggerCall'

export interface TranscriptLine {
  role: 'assistant' | 'user'
  text: string
}

interface ActiveCall {
  vapiCallId: string
  status: string
  transcript: TranscriptLine[]
  studentName: string
  duration: number
  postCallData?: { summary: string, sentiment: string, flag_counselor: boolean }
}

interface StudentCardData {
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

export function StudentRiskCard({ student }: { student: StudentCardData }) {
  const [isCalling, setIsCalling] = useState(false)
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleCallNow = useCallback(async () => {
    setIsCalling(true)
    try {
      const { vapiCallId } = await triggerStudentCall({
        id: student.id,
        name: student.name,
        phone: student.phone,
        attendance_pct: student.attendance_pct,
        class_group: student.class_group,
        section: student.section,
        teacher_profile_id: student.teacher_profile_id,
      })

      setActiveCall({
        vapiCallId,
        status: 'queued',
        transcript: [],
        studentName: student.name,
        duration: 0,
      })

      pollingRef.current = setInterval(async () => {
        const result = await pollCallStatus(vapiCallId)
        if (!result) return

        const rawTranscript = result.transcript ?? ''
        const lines: TranscriptLine[] = rawTranscript
          .split('\n')
          .filter(Boolean)
          .map((line: string) => {
            if (line.startsWith('AI: ')) return { role: 'assistant' as const, text: line.slice(4) }
            if (line.startsWith('User: ')) return { role: 'user' as const, text: line.slice(6) }
            return { role: 'assistant' as const, text: line }
          })

        setActiveCall((prev) => prev ? { ...prev, status: result.status, transcript: lines } : prev)

        if (['ended', 'failed', 'no-answer', 'busy'].includes(result.status)) {
          clearInterval(pollingRef.current!)
          pollingRef.current = null
          setIsCalling(false)
          
          if (result.status === 'ended') {
            setTimeout(async () => {
              const postCall = await finalizeCallLog(vapiCallId, rawTranscript, student.id)
              if (postCall && !postCall.error) {
                setActiveCall(prev => prev ? { ...prev, postCallData: postCall as any } : prev)
              }
            }, 1000)
          }
        }
      }, 2000)
    } catch (err: any) {
      console.error('Call failed:', err)
      alert(`Call failed: ${err.message || 'Unknown error'}`)
      setIsCalling(false)
    }
  }, [student])

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  const riskLabel = { red: 'High Risk', yellow: 'Medium', green: 'Low Risk' }[student.risk_level]

  const riskBadgeClass = {
    red: 'bg-[rgba(220,38,38,0.15)] text-[#DC2626] border-[rgba(220,38,38,0.3)]',
    yellow: 'bg-[rgba(217,119,6,0.15)] text-[#D97706] border-[rgba(217,119,6,0.3)]',
    green: 'bg-[rgba(22,163,74,0.15)] text-[#16A34A] border-[rgba(22,163,74,0.3)]',
  }[student.risk_level]

  const barColor = {
    red: '#DC2626',
    yellow: '#D97706',
    green: '#16A34A',
  }[student.risk_level]

  const borderClass = {
    red: 'border-l-2 border-l-[#DC2626]',
    yellow: 'border-l-2 border-l-[#D97706]',
    green: 'border-l-2 border-l-[#16A34A]',
  }[student.risk_level]

  return (
    <div className={`bg-[#111] border border-[#1a1a1a] ${borderClass} rounded-[10px] p-3.5 cursor-pointer transition-all duration-150 hover:border-[#333] relative overflow-hidden`}>
      {/* Top: Name + Risk Badge */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-white text-xs font-medium">{student.name}</div>
          <div className="text-[#444] text-[10px]">
            {student.class_group}{student.section && `-${student.section}`} · {student.roll_number ? `Roll ${student.roll_number}` : '—'}
          </div>
        </div>
        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium uppercase tracking-[0.5px] ${riskBadgeClass}`}>
          {riskLabel}
        </span>
      </div>

      {/* Attendance Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 bg-[#1a1a1a] rounded-sm overflow-hidden">
          <div
            className="h-full rounded-sm transition-all duration-300"
            style={{ width: `${student.attendance_pct}%`, background: barColor }}
          />
        </div>
        <span className="text-[#888] text-[10px] min-w-[28px] text-right">{student.attendance_pct}%</span>
      </div>

      {/* Live transcript preview */}
      {activeCall && !activeCall.postCallData && activeCall.transcript.length > 0 && (
        <div className="bg-[#0A0A0A] rounded-md p-2.5 border border-[#1a1a1a] max-h-24 overflow-y-auto space-y-1 mt-2.5">
          {activeCall.transcript.slice(-3).map((line, i) => (
            <div key={i} className={`flex gap-1.5 text-[10px] ${line.role === 'assistant' ? 'text-[#00E5CC]' : 'text-white'}`}>
              <span className="shrink-0">{line.role === 'assistant' ? <Bot size={10} className="mt-0.5" /> : <User size={10} className="mt-0.5" />}</span>
              <span>{line.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Post-call Summary */}
      {activeCall?.postCallData && (
        <div className="bg-[#0f1f1e] rounded-md p-2.5 border border-[#00E5CC]/20 mt-2.5">
          <div className="flex items-start justify-between mb-1">
            <p className="text-[9px] uppercase tracking-widest text-[#00E5CC] font-mono">{activeCall.postCallData.sentiment}</p>
            {activeCall.postCallData.flag_counselor ? (
              <span className="flex items-center gap-1 text-[9px] uppercase text-red-500 font-bold tracking-wider"><AlertTriangle size={10} /> Alerted</span>
            ) : (
              <span className="flex items-center gap-1 text-[9px] uppercase text-[#00E5CC] font-bold tracking-wider"><CheckCircle2 size={10} /> Logged</span>
            )}
          </div>
          <p className="text-[10px] text-[#ccc] leading-relaxed">{activeCall.postCallData.summary}</p>
        </div>
      )}

      {/* Call button */}
      <button
        onClick={handleCallNow}
        disabled={isCalling || !!activeCall?.postCallData}
        className={`w-full mt-2.5 text-[10px] py-1.5 px-2.5 rounded-[5px] cursor-pointer transition-all duration-150 border
          ${isCalling
            ? 'bg-[#00E5CC] text-black animate-pulse border-[#00E5CC]'
            : activeCall?.postCallData
              ? 'hidden'
              : 'bg-transparent border-[#00E5CC] text-[#00E5CC] hover:bg-[#00E5CC] hover:text-black'
          }`}
      >
        {isCalling ? (
          <span className="flex items-center justify-center gap-1.5">
            <Loader2 size={10} className="animate-spin" />
            {activeCall?.status === 'in-progress' ? 'Active Call' : 'Connecting...'}
          </span>
        ) : (
          'Call Now →'
        )}
      </button>
    </div>
  )
}
