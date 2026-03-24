import { createClient } from '@/lib/supabase/server'

export default async function AdminUsers() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('users')
    .select('id, name, email, role, avatar_url, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 space-y-4">
      <div className="text-[#444] text-[10px] uppercase tracking-[1.5px]">
        {users?.length ?? 0} Registered Users
      </div>

      <div className="bg-[#111] border border-[#1a1a1a] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1a1a1a]">
              <th className="text-left text-[#444] text-[9px] uppercase tracking-[1px] px-3 py-2">User</th>
              <th className="text-left text-[#444] text-[9px] uppercase tracking-[1px] px-3 py-2">Email</th>
              <th className="text-left text-[#444] text-[9px] uppercase tracking-[1px] px-3 py-2">Role</th>
              <th className="text-left text-[#444] text-[9px] uppercase tracking-[1px] px-3 py-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u) => {
              const roleColors: Record<string, string> = {
                admin: 'text-[#00E5CC] bg-[rgba(0,229,204,0.1)] border-[rgba(0,229,204,0.3)]',
                teacher: 'text-[#D97706] bg-[rgba(217,119,6,0.1)] border-[rgba(217,119,6,0.3)]',
                counselor: 'text-[#DC2626] bg-[rgba(220,38,38,0.1)] border-[rgba(220,38,38,0.3)]',
                parent: 'text-[#16A34A] bg-[rgba(22,163,74,0.1)] border-[rgba(22,163,74,0.3)]',
                student: 'text-[#888] bg-[rgba(136,136,136,0.1)] border-[rgba(136,136,136,0.3)]',
              }
              return (
                <tr key={u.id} className="border-b border-[#1a1a1a] last:border-0 hover:bg-[#0f0f0f] transition-colors">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} className="w-6 h-6 rounded-full" alt="" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#1a3a38] flex items-center justify-center text-[#00E5CC] text-[9px] font-medium">
                          {u.name?.charAt(0)?.toUpperCase() ?? '?'}
                        </div>
                      )}
                      <span className="text-white text-[11px]">{u.name ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-[#555] text-[11px]">{u.email}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium uppercase tracking-[0.5px] ${roleColors[u.role] ?? roleColors.student}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[#555] text-[10px]">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('en-US') : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {(users ?? []).length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#555] text-xs">No users registered yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
