'use server'

import { createClient } from '@/lib/supabase/server'

export async function triggerStudentCall(student: {
  id: string
  name: string
  phone: string
  attendance_pct: number
  class_group: string
  section: string
  teacher_profile_id?: string
}) {
  if (!process.env.VAPI_API_KEY) {
    throw new Error('VAPI_API_KEY is missing in .env.local')
  }
  
  if (!process.env.NEXT_PUBLIC_VAPI_STUDENT_ASSISTANT_ID || process.env.NEXT_PUBLIC_VAPI_STUDENT_ASSISTANT_ID.length < 36) {
    throw new Error('NEXT_PUBLIC_VAPI_STUDENT_ASSISTANT_ID is missing or incomplete in .env.local')
  }

  if (!process.env.VAPI_PHONE_NUMBER_ID) {
    throw new Error('VAPI_PHONE_NUMBER_ID is missing in .env.local')
  }

  if (!student.phone || student.phone.length < 5) {
    throw new Error(`Student ${student.name} does not have a valid phone number.`)
  }

  const response = await fetch('https://api.vapi.ai/call', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      assistantId: process.env.NEXT_PUBLIC_VAPI_STUDENT_ASSISTANT_ID,
      assistantOverrides: {
        variableValues: {
          school_name: 'K.K. Wagh Institute',
          student_name: student.name,
          attendance_pct: student.attendance_pct.toString(),
          class_group: student.class_group,
          section: student.section,
        },
      },
      customer: {
        number: student.phone,
        name: student.name,
      },
      phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Vapi call failed: ${response.statusText} — ${errorText}`)
  }

  const call = await response.json()

  // Record in call_logs immediately
  const supabase = await createClient()
  await supabase.from('call_logs').insert({
    direction: 'outbound',
    student_id: student.id,
    triggered_by_id: student.teacher_profile_id ?? null,
    vapi_call_id: call.id,
  })

  return { vapiCallId: call.id as string, status: call.status as string }
}

export async function pollCallStatus(vapiCallId: string) {
  const response = await fetch(`https://api.vapi.ai/call/${vapiCallId}`, {
    headers: {
      'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
    },
  })
  if (!response.ok) return null
  const call = await response.json()
  return {
    transcript: call.transcript as string | null,
    status: call.status as string,
    endedReason: call.endedReason as string | null,
  }
}

export async function finalizeCallLog(vapiCallId: string, transcript: string, studentId: string) {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is missing')
    return { error: 'Gemini API key missing' }
  }

  try {
    const prompt = `Analyze this call transcript between an AI and a student.
Provide a 1-sentence summary of the student's situation.
Classify the student's emotional sentiment strictly as one of: 'positive', 'neutral', 'concerned', 'distress'.
Return ONLY valid JSON in this exact format: {"summary": "...", "sentiment": "..."}

Transcript:
${transcript}`

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    })

    let summary = 'Call ended without clear conclusion.'
    let sentiment: 'positive' | 'neutral' | 'concerned' | 'distress' = 'neutral'
    let flag_counselor = false

    if (geminiRes.ok) {
      const gData = await geminiRes.json()
      try {
        const text = gData.candidates[0].content.parts[0].text
        const parsed = JSON.parse(text)
        summary = parsed.summary || summary
        sentiment = (parsed.sentiment as 'positive' | 'neutral' | 'concerned' | 'distress') || sentiment
        flag_counselor = sentiment === 'distress'
      } catch (e) {
        console.error('Failed to parse Gemini response', e)
      }
    }

    const supabase = await createClient()
    
    // Update Call Log
    const { data: logData } = await supabase
      .from('call_logs')
      .update({
        transcript,
        summary,
        sentiment,
        flag_counselor,
        duration_seconds: 60, // approximate, as Vapi doesn't always expose duration gracefully in early polling
      })
      .eq('vapi_call_id', vapiCallId)
      .select('id')
      .single()

    // Trigger Counselor Alert if distressed
    if (flag_counselor && logData) {
      await supabase.from('counselor_alerts').insert({
        call_log_id: logData.id,
        student_id: studentId,
        status: 'open',
        reason: `Automated sentiment analysis marked call as "distress". Summary: ${summary}`
      })
    }

    return { summary, sentiment, flag_counselor }
  } catch (err: any) {
    console.error('Finalize call failed:', err)
    return { error: err.message }
  }
}
