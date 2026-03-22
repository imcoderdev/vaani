'use client'

import { useVapiCall } from '@/hooks/useVapiCall'
import { Phone, PhoneOff, Mic, Clock, MessageCircle } from 'lucide-react'

interface CallRecord {
  id: string
  created_at: string
  summary: string | null
  sentiment: string | null
  duration_seconds: number | null
}

interface StudentInfo {
  name: string
  class_group: string
  section: string
  risk_level: 'green' | 'yellow' | 'red'
  risk_score: number
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

  const sentimentColors: Record<string, string> = {
    positive: 'text-green-400',
    neutral: 'text-[#888]',
    concerned: 'text-yellow-400',
    distress: 'text-red-400',
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

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6 space-y-8">
      <div>
        <h1 className="font-black text-3xl text-white uppercase tracking-tight">Parent Dashboard</h1>
        <p className="text-[#666] font-mono text-sm mt-1">Welcome, {parentName}</p>
      </div>

      {student ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Student info card */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
            <h2 className="font-bold text-white text-sm uppercase tracking-widest font-mono">Your Child</h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#222] flex items-center justify-center text-2xl font-black text-white">
                {student.name.charAt(0)}
              </div>
              <div>
                <p className="text-white font-bold text-xl">{student.name}</p>
                <p className="text-[#666] text-sm font-mono">{student.class_group} - {student.section}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0A0A0A] rounded-lg p-3 border border-[#222]">
                <p className="text-[10px] uppercase tracking-widest text-[#555] font-mono">Attendance</p>
                <p className={`text-2xl font-black mt-0.5 ${student.risk_score > 60 ? 'text-red-400' : student.risk_score > 30 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {Math.max(0, 100 - student.risk_score)}%
                </p>
              </div>
              <div className="bg-[#0A0A0A] rounded-lg p-3 border border-[#222]">
                <p className="text-[10px] uppercase tracking-widest text-[#555] font-mono">Risk Level</p>
                <p className={`text-lg font-black mt-0.5 capitalize ${student.risk_level === 'red' ? 'text-red-400' : student.risk_level === 'yellow' ? 'text-yellow-400' : 'text-green-400'}`}>
                  {student.risk_level}
                </p>
              </div>
            </div>
          </div>

          {/* Call widget */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6 flex flex-col justify-between gap-4">
            <div>
              <h2 className="font-bold text-white text-sm uppercase tracking-widest font-mono">School AI Hotline</h2>
              <p className="text-[#666] text-sm mt-1">Talk to the AI to get live updates about {student.name}.</p>
            </div>

            {isActive && (
              <div className="bg-[#0A0A0A] rounded-lg border border-[#222] p-3 max-h-40 overflow-y-auto space-y-2">
                {transcript.length === 0 && (
                  <p className="text-[#555] text-xs font-mono text-center py-4">Connecting...</p>
                )}
                {transcript.map((line, i) => (
                  <div key={i} className={`flex gap-2 text-xs ${line.role === 'assistant' ? 'text-[#00E5CC]' : 'text-white'}`}>
                    <span className="shrink-0 font-mono">{line.role === 'assistant' ? 'AI:' : 'You:'}</span>
                    <span>{line.text}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={isActive ? endCall : handleStartCall}
              className={`w-full py-4 rounded-xl font-mono font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all
                ${isActive
                  ? 'bg-red-900/30 border border-red-500/40 text-red-400 hover:bg-red-900/50'
                  : 'bg-[#00E5CC] text-black hover:bg-[#00ccb4]'
                }`}
            >
              {isActive ? <><PhoneOff size={18} /> End Call {isSpeaking && '🎙️'}</> : <><Phone size={18} /> Speak to School AI</>}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">👨‍👩‍👧</p>
          <h3 className="text-white font-bold">No Student Linked</h3>
          <p className="text-[#666] text-sm mt-2 font-mono">Contact your school administrator to link your child.</p>
        </div>
      )}

      {/* Recent calls */}
      {recentCalls.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-[#444] font-mono text-xs uppercase tracking-widest">Recent AI Calls</h2>
          {recentCalls.map((call) => (
            <div key={call.id} className="bg-[#111] border border-[#222] rounded-xl p-4 flex items-start gap-4">
              <MessageCircle className="w-5 h-5 text-[#444] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm">{call.summary ?? 'No summary available.'}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className={`text-xs font-mono ${sentimentColors[call.sentiment ?? 'neutral']}`}>{call.sentiment ?? 'neutral'}</span>
                  {call.duration_seconds && (
                    <span className="text-[#555] text-xs font-mono flex items-center gap-1"><Clock size={10}/>{Math.round(call.duration_seconds / 60)}m</span>
                  )}
                  <span className="text-[#555] text-xs font-mono">{new Date(call.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
