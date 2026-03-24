'use client'

import { createClient } from '@/lib/supabase/client'

const roles = [
  { 
    role: 'teacher', 
    label: 'Login as Teacher', 
    icon: '🎓',
    description: 'Student risk board & calls',
    primary: true 
  },
  { 
    role: 'student', 
    label: 'Login as Student', 
    icon: '📚',
    description: 'Attendance & call history',
    primary: false 
  },
  { 
    role: 'parent', 
    label: 'Login as Parent', 
    icon: '👨‍👩‍👧',
    description: 'Child progress & AI hotline',
    primary: false 
  },
]

export default function LoginPage() {
  const supabase = createClient()

  const handleLogin = async (role: string) => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
        queryParams: { prompt: 'select_account' }
      }
    })
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-5">
      <div className="w-[280px]">
        {/* Logo */}
        <div className="text-center mb-5">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-2 h-2 bg-[#00E5CC]" />
            <span className="text-white text-[11px] font-medium tracking-[3px] uppercase">BridgeAI</span>
          </div>
          <div className="text-white text-[22px] font-bold uppercase tracking-[-0.5px] leading-tight">
            No Student Should
          </div>
          <div className="text-[#00E5CC] text-[22px] font-bold uppercase tracking-[-0.5px]">
            Be Invisible.
          </div>
          <div className="text-[#333] text-[11px] mt-2">K.K. Wagh Institute</div>
        </div>

        {/* Role buttons */}
        <div className="space-y-2">
          {roles.map(({ role, label, icon, description, primary }) => (
            <button
              key={role}
              onClick={() => handleLogin(role)}
              className={`w-full py-3 px-3.5 rounded-lg cursor-pointer flex items-center gap-2.5 transition-all duration-150
                ${primary
                  ? 'bg-[#00E5CC] border border-[#00E5CC] hover:bg-[#00ccb4]'
                  : 'bg-transparent border border-[#222] hover:border-[#00E5CC] hover:bg-[#0f1f1e]'
                }`}
            >
              <div className={`w-7 h-7 rounded-md flex items-center justify-center text-[13px] shrink-0
                ${primary ? 'bg-[rgba(0,0,0,0.2)]' : 'bg-[#1a1a1a]'}`}>
                {icon}
              </div>
              <div className="text-left flex-1">
                <div className={`text-xs font-medium ${primary ? 'text-black' : 'text-white'}`}>
                  {label}
                </div>
                <div className={`text-[10px] mt-px ${primary ? 'text-black/60' : 'text-[#444]'}`}>
                  {description}
                </div>
              </div>
              <span className={`text-sm ${primary ? 'text-black/50' : 'text-[#333]'}`}>→</span>
            </button>
          ))}
        </div>

        {/* Admin/Counselor Link */}
        <div className="text-center mt-4">
          <details className="group">
            <summary className="text-[#333] text-[11px] cursor-pointer hover:text-[#00E5CC] transition-colors list-none border-b border-[#222] pb-px inline">
              Admin or Counselor? Login here →
            </summary>
            <div className="mt-3 space-y-2">
              {['admin', 'counselor'].map((role) => (
                <button
                  key={role}
                  onClick={() => handleLogin(role)}
                  className="block w-full text-[#666] text-xs py-2 px-4 
                    border border-[#222] rounded-lg hover:border-[#333] 
                    hover:text-white transition-all capitalize"
                >
                  Continue as {role}
                </button>
              ))}
            </div>
          </details>
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-center gap-1.5 mt-5">
          <div className="w-[5px] h-[5px] bg-[#00E5CC] rounded-full animate-pulse" />
          <span className="text-[#333] text-[10px] uppercase tracking-[1px] font-mono">
            Status: Infrastructure Online
          </span>
        </div>
      </div>
    </div>
  )
}
