import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
      <Card className="w-full max-w-md mx-4 bg-[#111] border-[#222]">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-900/30 border border-red-500/30 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-black uppercase tracking-tight text-white">
            Authentication Error
          </CardTitle>
          <CardDescription className="text-[#666] font-mono text-sm">
            We couldn&apos;t sign you in. This could happen if:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="text-sm text-[#888] font-mono space-y-2 list-disc list-inside">
            <li>Your Google account is not registered in the system</li>
            <li>Your account has been deactivated</li>
            <li>There was a temporary authentication error</li>
          </ul>

          <div className="pt-4 space-y-3">
            <Link href="/login" className="block w-full">
              <Button className="w-full bg-[#00E5CC] text-black hover:bg-[#00ccb4] font-bold font-mono uppercase tracking-widest">Try Again</Button>
            </Link>
            <p className="text-center text-xs text-[#555] font-mono">
              Contact your school administrator if the problem persists.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
