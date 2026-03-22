'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Phone, PhoneOff, Loader2, User, Bot, AlertTriangle, CheckCircle2 } from 'lucide-react'
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

  const riskBorderClass = {
    red: 'border-red-500/60 shadow-red-900/20',
    yellow: 'border-yellow-500/40',
    green: 'border-green-500/30',
  }[student.risk_level]

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

      // Start polling
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
            // Wait a sec for final transcript processing in Vapi, then finalize
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

  const riskLabel = { red: 'High Risk', yellow: 'Medium Risk', green: 'Low Risk' }[student.risk_level]
  const riskDot = {
    red: 'bg-red-500 animate-pulse',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
  }[student.risk_level]

  return (
    <div className={`bg-[#111111] border ${riskBorderClass} rounded-xl p-5 flex flex-col gap-4 transition-all duration-300 hover:border-opacity-80`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center text-sm font-bold text-white">
            {student.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{student.name}</p>
            <p className="text-xs text-[#666] font-mono">{student.class_group}{student.section && `-${student.section}`} · {student.roll_number ?? '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1a1a1a] border border-[#333]">
          <span className={`w-2 h-2 rounded-full ${riskDot}`} />
          <span className="text-xs font-mono text-[#aaa]">{riskLabel}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0A0A0A] rounded-lg p-3 border border-[#222]">
          <p className="text-[10px] uppercase tracking-widest text-[#555] font-mono">Attendance</p>
          <p className={`text-xl font-black mt-0.5 ${student.attendance_pct < 60 ? 'text-red-400' : student.attendance_pct < 75 ? 'text-yellow-400' : 'text-green-400'}`}>
            {student.attendance_pct}%
          </p>
        </div>
        <div className="bg-[#0A0A0A] rounded-lg p-3 border border-[#222]">
          <p className="text-[10px] uppercase tracking-widest text-[#555] font-mono">Risk Score</p>
          <p className="text-xl font-black text-white mt-0.5">{student.risk_score}</p>
        </div>
      </div>

      {/* Live transcript preview */}
      {activeCall && !activeCall.postCallData && activeCall.transcript.length > 0 && (
        <div className="bg-[#0A0A0A] rounded-lg p-3 border border-[#222] max-h-32 overflow-y-auto space-y-1.5">
          {activeCall.transcript.slice(-4).map((line, i) => (
            <div key={i} className={`flex gap-2 text-xs ${line.role === 'assistant' ? 'text-[#00E5CC]' : 'text-white'}`}>
              <span className="shrink-0">{line.role === 'assistant' ? <Bot size={12} className="mt-0.5" /> : <User size={12} className="mt-0.5" />}</span>
              <span>{line.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Post-call Summary */}
      {activeCall?.postCallData && (
        <div className="bg-[#0f1f1e] rounded-lg p-3 border border-[#00E5CC]/20">
          <div className="flex items-start justify-between mb-2">
            <p className="text-[10px] uppercase tracking-widest text-[#00E5CC] font-mono">{activeCall.postCallData.sentiment}</p>
            {activeCall.postCallData.flag_counselor ? (
              <span className="flex items-center gap-1 text-[10px] uppercase text-red-500 font-bold tracking-wider"><AlertTriangle size={12} /> Counselor Alerted</span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] uppercase text-[#00E5CC] font-bold tracking-wider"><CheckCircle2 size={12} /> Logged</span>
            )}
          </div>
          <p className="text-xs text-[#ccc] leading-relaxed">{activeCall.postCallData.summary}</p>
        </div>
      )}

      {/* Call button */}
      <button
        onClick={handleCallNow}
        disabled={isCalling || !!activeCall?.postCallData}
        className={`w-full py-3 rounded-lg font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200
          ${isCalling
            ? 'bg-[#1a1a1a] text-[#00E5CC] border border-[#00E5CC]/30 cursor-not-allowed'
            : activeCall?.postCallData
              ? 'bg-[#111] text-[#444] border border-[#222] cursor-not-allowed hidden'
              : 'bg-[#00E5CC] text-black hover:bg-[#00ccb4] active:scale-95'
          }`}
      >
        {isCalling ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            {activeCall?.status === 'in-progress' ? 'Active Call' : 'Connecting...'}
          </>
        ) : (
          <>
            <Phone size={14} />
            Call Now
          </>
        )}
      </button>
    </div>
  )
}
