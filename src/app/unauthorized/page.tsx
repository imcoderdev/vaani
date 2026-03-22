import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-center px-4">
      <ShieldAlert className="w-16 h-16 text-red-500 mb-6" />
      <h1 className="font-black text-4xl text-white uppercase tracking-tight mb-3">Access Denied</h1>
      <p className="text-[#666] font-mono text-sm max-w-sm">
        Your account has not been registered in the BridgeCall AI system.
        Please contact your school administrator.
      </p>
      <Link href="/login" className="mt-8 px-8 py-3 bg-[#00E5CC] text-black font-mono font-bold text-sm uppercase tracking-widest hover:bg-[#00ccb4] transition-colors">
        Back to Login
      </Link>
    </div>
  )
}
