export default function AdminSettings() {
  const configs = [
    { label: 'Supabase URL', value: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configured' : '❌ Missing', key: 'NEXT_PUBLIC_SUPABASE_URL' },
    { label: 'Supabase Anon Key', value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing', key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY' },
    { label: 'Service Role Key', value: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configured' : '❌ Missing', key: 'SUPABASE_SERVICE_ROLE_KEY' },
    { label: 'Vapi API Key', value: process.env.VAPI_API_KEY ? '✅ Configured' : '❌ Missing', key: 'VAPI_API_KEY' },
    { label: 'Vapi Public Key', value: process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ? '✅ Configured' : '❌ Missing', key: 'NEXT_PUBLIC_VAPI_PUBLIC_KEY' },
    { label: 'Student Assistant ID', value: process.env.NEXT_PUBLIC_VAPI_STUDENT_ASSISTANT_ID ? '✅ Configured' : '❌ Missing', key: 'NEXT_PUBLIC_VAPI_STUDENT_ASSISTANT_ID' },
    { label: 'Parent Assistant ID', value: process.env.NEXT_PUBLIC_VAPI_PARENT_ASSISTANT_ID ? '✅ Configured' : '❌ Missing', key: 'NEXT_PUBLIC_VAPI_PARENT_ASSISTANT_ID' },
    { label: 'Vapi Phone Number ID', value: process.env.VAPI_PHONE_NUMBER_ID ? '✅ Configured' : '❌ Missing', key: 'VAPI_PHONE_NUMBER_ID' },
    { label: 'Gemini API Key', value: process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing', key: 'GEMINI_API_KEY' },
  ]

  const allConfigured = configs.every((c) => c.value.includes('✅'))

  return (
    <div className="p-4 space-y-4">
      {/* Overall Status */}
      <div className={`rounded-lg px-3.5 py-2.5 flex items-center gap-2 border ${
        allConfigured
          ? 'bg-[rgba(22,163,74,0.08)] border-[rgba(22,163,74,0.2)]'
          : 'bg-[rgba(220,38,38,0.08)] border-[rgba(220,38,38,0.2)]'
      }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${allConfigured ? 'bg-[#16A34A]' : 'bg-[#DC2626] animate-pulse'}`} />
        <span className={`text-[11px] font-medium ${allConfigured ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
          {allConfigured ? 'All API keys configured' : 'Some API keys are missing — check .env.local'}
        </span>
      </div>

      {/* Config table */}
      <div className="bg-[#111] border border-[#1a1a1a] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1a1a1a]">
              <th className="text-left text-[#444] text-[9px] uppercase tracking-[1px] px-3 py-2">Setting</th>
              <th className="text-left text-[#444] text-[9px] uppercase tracking-[1px] px-3 py-2">Env Variable</th>
              <th className="text-left text-[#444] text-[9px] uppercase tracking-[1px] px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {configs.map((c) => (
              <tr key={c.key} className="border-b border-[#1a1a1a] last:border-0">
                <td className="px-3 py-2.5 text-white text-[11px]">{c.label}</td>
                <td className="px-3 py-2.5 text-[#555] text-[10px] font-mono">{c.key}</td>
                <td className="px-3 py-2.5 text-[11px]">{c.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
