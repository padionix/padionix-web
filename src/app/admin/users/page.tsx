import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Ban } from 'lucide-react'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: users } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Manajemen Pengguna</h1>
        <p className="text-muted-foreground mt-1">Kelola semua pengguna platform</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daftar Pengguna ({users?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!users || users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Belum ada pengguna</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 font-medium">Nama</th>
                    <th className="text-left py-2 font-medium">Email</th>
                    <th className="text-left py-2 font-medium">Role</th>
                    <th className="text-left py-2 font-medium">Subscription</th>
                    <th className="text-left py-2 font-medium">Status</th>
                    <th className="text-left py-2 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b last:border-0">
                      <td className="py-2">{u.full_name || '—'}</td>
                      <td className="py-2 text-muted-foreground">{u.email || '—'}</td>
                      <td className="py-2">
                        <Badge variant={u.role === 'admin' ? 'destructive' : u.role === 'dinas' ? 'default' : 'secondary'}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-2">
                        <Badge variant={u.subscription === 'pro' ? 'default' : u.subscription === 'enterprise' ? 'destructive' : 'secondary'}>
                          {u.subscription}
                        </Badge>
                      </td>
                      <td className="py-2">
                        <Badge variant="secondary">Active</Badge>
                      </td>
                      <td className="py-2">
                        <form action={`/api/admin/users/${u.id}/suspend`} method="POST">
                          <button type="submit" className="text-muted-foreground hover:text-danger transition-colors cursor-pointer" title="Toggle suspend">
                            <Ban className="h-4 w-4" />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
