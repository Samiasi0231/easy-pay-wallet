import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { adminUsersApi, adminWalletApi } from '../../api/admin'
import { fmt } from '../../utils'
import { PageLoader, StatusBadge, Pagination, EmptyState, Modal, Input, Spinner } from '../../components/shared/UI'
import { getErrorMessage } from '../../api/client'
import { useAdminStore } from '../../store/auth'

export default function AdminUsersPage() {
  const qc = useQueryClient()
  const { isSuperAdmin } = useAdminStore()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isActive, setIsActive] = useState('')
  const [selected, setSelected] = useState(null)
  const [fundOpen, setFundOpen] = useState(null)
  const [fundForm, setFundForm] = useState({ amount: '', reason: '' })
  const [fundType, setFundType] = useState('fund')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, isActive],
    queryFn: () => adminUsersApi.getAll({
      page, limit: 20,
      search: search || undefined,
      isActive: isActive === '' ? undefined : isActive === 'true',
    }),
  })

  const { data: userDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['admin-user-detail', selected],
    queryFn: () => adminUsersApi.getById(selected),
    enabled: !!selected,
  })

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, isActive, reason }) => adminUsersApi.updateStatus(id, { isActive, reason }),
    onSuccess: () => {
      toast.success('User status updated')
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const { mutate: fundWallet, isPending: funding } = useMutation({
    mutationFn: (data) => fundType === 'fund' ? adminWalletApi.fund(data) : adminWalletApi.debit(data),
    onSuccess: () => {
      toast.success(`Wallet ${fundType === 'fund' ? 'credited' : 'debited'} successfully`)
      setFundOpen(null)
      setFundForm({ amount: '', reason: '' })
      qc.invalidateQueries({ queryKey: ['admin-user-detail'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const users = data?.data || []
  const totalPages = data ? Math.ceil(data.meta?.total / 20) : 1

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Users</h1>
        <p className="page-sub">{data?.meta?.total || 0} registered users</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 relative">
          <input
            className="input-field pl-10"
            placeholder="Search by name, email, phone…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">🔍</span>
        </div>
        <select className="input-field w-40" style={{ colorScheme: 'dark' }} value={isActive} onChange={(e) => { setIsActive(e.target.value); setPage(1) }}>
          <option value="">All Users</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {isLoading ? <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" /></div> : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['User', 'Phone', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-white/30 text-xs uppercase tracking-widest font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {users.length === 0 ? (
                  <tr><td colSpan={5}><EmptyState icon="👥" title="No users found" /></td></tr>
                ) : users.map(u => (
                  <tr key={u._id} className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-white font-medium">{u.fullName}</p>
                        <p className="text-white/40 text-xs">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white/60">{u.phone}</td>
                    <td className="px-5 py-4">
                      <span className={u.isActive ? 'badge-success' : 'badge badge-failed'}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-white/40">{fmt.date(u.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => setSelected(u._id)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-colors">
                          View
                        </button>
                        {isSuperAdmin() && (
                          <>
                            <button onClick={() => updateStatus({ id: u._id, isActive: !u.isActive, reason: 'Admin action' })}
                              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${u.isActive ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25' : 'bg-green-500/15 text-green-400 hover:bg-green-500/25'}`}>
                              {u.isActive ? 'Disable' : 'Enable'}
                            </button>
                            <button onClick={() => { setFundOpen(u._id); setFundType('fund') }}
                              className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-colors">
                              💰 Fund
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 pb-5"><Pagination page={page} totalPages={totalPages} onPage={setPage} /></div>
          </>
        )}
      </div>

      {/* User Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="User Details">
        {detailLoading ? <div className="flex justify-center py-8"><Spinner /></div> : userDetail && (
          <div className="space-y-3 text-sm">
            <div className="flex justify-center py-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent-dim flex items-center justify-center">
                <span className="text-navy-900 font-bold text-xl">{userDetail.fullName?.[0]}</span>
              </div>
            </div>
            {[
              ['Name', userDetail.fullName],
              ['Email', userDetail.email],
              ['Phone', userDetail.phone],
              ['Status', userDetail.isActive ? '✅ Active' : '❌ Inactive'],
              ['Email Verified', userDetail.isEmailVerified ? 'Yes' : 'No'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-white/5">
                <span className="text-white/40">{k}</span>
                <span className="text-white">{v}</span>
              </div>
            ))}
            {/* Stats */}
            {userDetail.stats?.length > 0 && (
              <div className="mt-3">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Transaction Stats</p>
                <div className="grid grid-cols-2 gap-2">
                  {userDetail.stats.map(s => (
                    <div key={s.status} className="glass-card p-2.5 text-center rounded-xl">
                      <p className="text-white/40 text-xs">{s.status}</p>
                      <p className="text-white font-semibold">{s.count}</p>
                      <p className="text-accent text-xs">{fmt.currency(s.total)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {isSuperAdmin() && (
              <button onClick={() => { setFundOpen(selected); setFundType('fund'); setSelected(null) }}
                className="btn-primary w-full mt-2">
                💰 Manage Wallet
              </button>
            )}
          </div>
        )}
      </Modal>

      {/* Fund/Debit Modal */}
      <Modal open={!!fundOpen} onClose={() => setFundOpen(null)} title="Manage Wallet">
        <div className="flex gap-2 mb-5">
          {['fund', 'debit'].map(t => (
            <button key={t} onClick={() => setFundType(t)}
              className={`flex-1 py-2 rounded-xl text-sm capitalize font-medium border transition-all ${fundType === t ? 'border-amber-400/60 bg-amber-400/10 text-amber-400' : 'border-white/8 text-white/50'}`}>
              {t === 'fund' ? '↑ Credit' : '↓ Debit'}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          <Input label="Amount (₦)" type="number" min="1" placeholder="Enter amount" value={fundForm.amount} onChange={(e) => setFundForm(p => ({ ...p, amount: e.target.value }))} />
          <Input label="Reason" placeholder="e.g. Refund, Promotion…" value={fundForm.reason} onChange={(e) => setFundForm(p => ({ ...p, reason: e.target.value }))} />
          <div className="flex gap-3">
            <button onClick={() => setFundOpen(null)} className="btn-ghost flex-1">Cancel</button>
            <button
              disabled={funding || !fundForm.amount || !fundForm.reason}
              onClick={() => fundWallet({ userId: fundOpen, amount: Number(fundForm.amount), reason: fundForm.reason })}
              className="flex-1 py-3 px-6 rounded-xl font-semibold text-navy-900 flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
              {funding ? <><Spinner size="sm" /> Processing…</> : `${fundType === 'fund' ? 'Credit' : 'Debit'} Wallet`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
