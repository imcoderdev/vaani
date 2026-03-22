'use client'

import { createClient } from '@/lib/supabase/client'

const roles = [
  { 
    role: 'teacher', 
    label: 'Login as Teacher', 
    icon: '🎓',
    description: 'Access student risk board & call dashboard',
    primary: true 
  },
  { 
    role: 'student', 
    label: 'Login as Student', 
    icon: '📚',
    description: 'View your attendance & call history',
    primary: false 
  },
  { 
    role: 'parent', 
    label: 'Login as Parent', 
    icon: '👨‍👩‍👧',
    description: 'Check your child\'s progress & speak to AI',
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
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="flex items-center gap-2 justify-center mb-2">
          <div className="w-3 h-3 bg-[#00E5CC]"/>
          <span className="text-white font-bold text-xl tracking-widest uppercase">
            BridgeAI
          </span>
        </div>
        <p className="text-[#666] text-sm font-mono">
          K.K. Wagh Institute of Engineering
        </p>
      </div>

      {/* Headline */}
      <h1 className="text-white text-3xl font-black uppercase tracking-tight mb-2 text-center">
        No Student Should Be
      </h1>
      <h1 className="text-[#00E5CC] text-3xl font-black uppercase tracking-tight mb-10 text-center">
        Invisible.
      </h1>

      {/* Role Buttons */}
      <div className="w-full max-w-sm space-y-3">
        {roles.map(({ role, label, icon, description, primary }) => (
          <button
            key={role}
            onClick={() => handleLogin(role)}
            className={`w-full p-4 rounded-xl border text-left transition-all
              ${primary
                ? 'bg-[#00E5CC] border-[#00E5CC] text-black hover:bg-[#00ccb4]'
                : 'bg-transparent border-[#333] text-white hover:border-[#00E5CC] hover:bg-[#0f1f1e]'
              }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{icon}</span>
              <div>
                <div className={`font-bold text-sm uppercase tracking-wide
                  ${primary ? 'text-black' : 'text-white'}`}>
                  {label}
                </div>
                <div className={`text-xs mt-0.5
                  ${primary ? 'text-black/70' : 'text-[#666]'}`}>
                  {description}
                </div>
              </div>
              <span className={`ml-auto text-lg
                ${primary ? 'text-black' : 'text-[#444]'}`}>
                →
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Admin/Counselor Link */}
      <div className="mt-8 text-center">
        <details className="group">
          <summary className="text-[#444] text-xs cursor-pointer 
            hover:text-[#00E5CC] transition-colors list-none">
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

      {/* Status */}
      <div className="mt-12 flex items-center gap-2 justify-center">
        <div className="w-2 h-2 bg-[#00E5CC] rounded-full animate-pulse"/>
        <span className="text-[#444] text-xs font-mono uppercase tracking-wider">
          System Online
        </span>
      </div>
    </div>
  )
}
