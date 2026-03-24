'use server'

import { createClient } from '@/lib/supabase/server'

export async function saveParentCall({
  studentId,
  transcript,
  parentName,
}: {
  studentId: string
  transcript: string
  parentName: string
}) {
  if (!transcript || transcript.trim().length === 0) {
    return { error: 'No transcript to save' }
  }

  try {
    let summary = 'Parent call — no AI analysis available.'
    let sentiment: 'positive' | 'neutral' | 'concerned' | 'distress' = 'neutral'
    let flag_counselor = false

    // Analyze with Gemini if possible
    if (process.env.GEMINI_API_KEY) {
      const prompt = `Analyze this parent-school AI call transcript.
The parent "${parentName}" called the school AI hotline.
Provide a 1-sentence summary.
Classify emotional sentiment as: 'positive', 'neutral', 'concerned', 'distress'.
Return ONLY valid JSON: {"summary": "...", "sentiment": "..."}

Transcript:
${transcript}`

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      )

      if (res.ok) {
        const data = await res.json()
        try {
          const parsed = JSON.parse(data.candidates[0].content.parts[0].text)
          summary = parsed.summary || summary
          sentiment = parsed.sentiment || sentiment
          flag_counselor = sentiment === 'distress'
        } catch {
          console.error('Failed to parse Gemini response for parent call')
        }
      }
    }

    const supabase = await createClient()

    const { data: logData, error } = await supabase
      .from('call_logs')
      .insert({
        direction: 'inbound',
        student_id: studentId,
        transcript,
        summary,
        sentiment,
        flag_counselor,
        duration_seconds: Math.round(transcript.split('\n').length * 8), // rough estimate
      })
      .select('id')
      .single()

    if (error) {
      console.error('Failed to save parent call:', error)
      return { error: error.message }
    }

    // Trigger counselor alert if distressed
    if (flag_counselor && logData) {
      await supabase.from('counselor_alerts').insert({
        call_log_id: logData.id,
        student_id: studentId,
        status: 'open',
        reason: `Parent call flagged as distress. Summary: ${summary}`,
      })
    }

    return { summary, sentiment, flag_counselor }
  } catch (err: any) {
    console.error('saveParentCall error:', err)
    return { error: err.message }
  }
}
