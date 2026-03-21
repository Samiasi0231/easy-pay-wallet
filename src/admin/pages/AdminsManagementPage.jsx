import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { adminAuthApi } from '../../api/admin'
import { fmt } from '../../utils'
import { PageLoader, Modal, Input, Select, Spinner, EmptyState } from '../../components/shared/UI'
import { getErrorMessage } from '../../api/client'
import { useAdminStore } from '../../store/auth'
import { Navigate } from 'react-router-dom'

const ROLES = ['super_admin', 'admin', 'support']
const STATUSES = ['active', 'inactive', 'suspended']

const roleColors = { super_admin: 'text-amber-400 bg-amber-400/10', admin: 'text-blue-400 bg-blue-400/10', support: 'text-purple-400 bg-purple-400/10' }
const statusColors = { active: 'badge-success', inactive: 'badge badge-pending', suspended: 'badge-failed' }

export default function AdminsManagementPage() {
  const { isSuperAdmin, admin: currentAdmin } = useAdminStore()
  const qc = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'admin' })

  if (!isSuperAdmin()) return <Navigate to="/admin/dashboard" replace />

  const { data, isLoading } = useQuery({
    queryKey: ['all-admins'],
    queryFn: adminAuthApi.getAllAdmins,
  })

  const { mutate: createAdmin, isPending: creating } = useMutation({
    mutationFn: () => adminAuthApi.createAdmin(form),
    onSuccess: () => {
      toast.success('Admin account created!')
      setCreateOpen(false)
      setForm({ firstName: '', lastName: '', email: '', password: '', role: 'admin' })
      qc.invalidateQueries({ queryKey: ['all-admins'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }) => adminAuthApi.updateAdminStatus(id, status),
    onSuccess: () => {
      toast.success('Admin status updated')
      qc.invalidateQueries({ queryKey: ['all-admins'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const admins = data?.data || []
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Admin Accounts</h1>
          <p className="page-sub">{admins.length} admins registered</p>
        </div>
        <button onClick={() => setCreateOpen(true)}
          className="py-3 px-5 rounded-xl font-display font-semibold text-navy-900 text-sm"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
          + Create Admin
        </button>
      </div>

      {isLoading ? <PageLoader /> : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Admin', 'Role', 'Status', 'Last Login', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-white/30 text-xs uppercase tracking-widest font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {admins.length === 0 ? (
                <tr><td colSpan={5}><EmptyState icon="🛡️" title="No admins found" /></td></tr>
              ) : admins.map(a => (
                <tr key={a._id} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                        <span className="text-navy-900 font-bold text-xs">{a.firstName?.[0]}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{a.firstName} {a.lastName}</p>
                        <p className="text-white/40 text-xs">{a.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${roleColors[a.role]}`}>
                      {a.role?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={statusColors[a.status] || 'badge'}>{a.status}</span>
                  </td>
                  <td className="px-5 py-4 text-white/40 text-xs">
                    {a.lastLoginAt ? fmt.relative(a.lastLoginAt) : 'Never'}
                    {a.lastLoginIp && <p className="text-white/20">{a.lastLoginIp}</p>}
                  </td>
                  <td className="px-5 py-4">
                    {a._id !== currentAdmin?._id ? (
                      <select
                        className="input-field text-xs py-1.5 w-32"
                        style={{ colorScheme: 'dark' }}
                        value={a.status}
                        onChange={(e) => updateStatus({ id: a._id, status: e.target.value })}
                      >
                        {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                      </select>
                    ) : (
                      <span className="text-white/20 text-xs">You</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Admin Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Admin Account">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" placeholder="John" value={form.firstName} onChange={set('firstName')} />
            <Input label="Last Name" placeholder="Doe" value={form.lastName} onChange={set('lastName')} />
          </div>
          <Input label="Email" type="email" placeholder="admin@payeasy.com" value={form.email} onChange={set('email')} />
          <Input label="Password" type="password" placeholder="Min. 8 chars + uppercase + special" value={form.password} onChange={set('password')} />
          <Select label="Role" value={form.role} onChange={set('role')}>
            {ROLES.map(r => <option key={r} value={r} className="capitalize">{r.replace('_', ' ')}</option>)}
          </Select>
          <div className="flex gap-3 mt-2">
            <button onClick={() => setCreateOpen(false)} className="btn-ghost flex-1">Cancel</button>
            <button
              disabled={creating || !form.email || !form.password || !form.firstName}
              onClick={() => createAdmin()}
              className="flex-1 py-3 px-5 rounded-xl font-semibold text-navy-900 flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
              {creating ? <><Spinner size="sm" /> Creating…</> : 'Create Admin'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
