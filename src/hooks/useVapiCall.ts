'use client'

import { useState, useEffect } from 'react'
import Vapi from '@vapi-ai/web'

export interface TranscriptLine {
  role: 'assistant' | 'user'
  text: string
  timestamp: Date
}

let vapiInstance: Vapi | null = null

function getVapi() {
  if (!vapiInstance) {
    vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!)
  }
  return vapiInstance
}

export function useVapiCall() {
  const [isActive, setIsActive] = useState(false)
  const [transcript, setTranscript] = useState<TranscriptLine[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [callId, setCallId] = useState<string | null>(null)

  const startParentCall = async (variables: {
    school_name: string
    parent_name: string
    student_name: string
    attendance_pct: string
    last_call_summary: string
  }) => {
    const vapi = getVapi()
    setTranscript([])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const call = await (vapi as any).start(process.env.NEXT_PUBLIC_VAPI_PARENT_ASSISTANT_ID!, {
      variableValues: variables,
    })
    setIsActive(true)
    setCallId(call?.id ?? null)
  }

  const endCall = () => {
    const vapi = getVapi()
    vapi.stop()
    setIsActive(false)
    setIsSpeaking(false)
  }

  useEffect(() => {
    const vapi = getVapi()

    const onSpeechStart = () => setIsSpeaking(true)
    const onSpeechEnd = () => setIsSpeaking(false)
    const onMessage = (msg: { type: string; transcriptType?: string; role?: string; transcript?: string }) => {
      if (msg.type === 'transcript' && msg.transcriptType === 'final' && msg.transcript) {
        setTranscript((prev) => [
          ...prev,
          {
            role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
            text: msg.transcript!,
            timestamp: new Date(),
          },
        ])
      }
    }
    const onCallEnd = () => {
      setIsActive(false)
      setIsSpeaking(false)
    }

    vapi.on('speech-start', onSpeechStart)
    vapi.on('speech-end', onSpeechEnd)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vapi.on('message', onMessage as any)
    vapi.on('call-end', onCallEnd)

    return () => {
      vapi.off('speech-start', onSpeechStart)
      vapi.off('speech-end', onSpeechEnd)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vapi.off('message', onMessage as any)
      vapi.off('call-end', onCallEnd)
    }
  }, [])

  return { startParentCall, endCall, isActive, transcript, isSpeaking, callId }
}
