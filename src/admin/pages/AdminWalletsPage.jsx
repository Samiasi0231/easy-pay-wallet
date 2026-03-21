import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { adminUsersApi, adminWalletApi } from '../../api/admin'
import { fmt } from '../../utils'
import { Input, Spinner, Modal, Pagination, EmptyState } from '../../components/shared/UI'
import { getErrorMessage } from '../../api/client'
import { useAdminStore } from '../../store/auth'

export default function AdminWalletsPage() {
  const qc = useQueryClient()
  const { isSuperAdmin } = useAdminStore()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [walletModal, setWalletModal] = useState(null) // { userId, action: 'fund'|'debit' }
  const [form, setForm] = useState({ amount: '', reason: '' })
  const [walletData, setWalletData] = useState({})

  const { data, isLoading } = useQuery({
    queryKey: ['wallet-users', page, search],
    queryFn: () => adminUsersApi.getAll({ page, limit: 20, search: search || undefined }),
  })

  const fetchWallet = async (userId) => {
    if (walletData[userId]) return
    try {
      const w = await adminUsersApi.getWallet(userId)
      setWalletData(p => ({ ...p, [userId]: w }))
    } catch {}
  }

  const { mutate: execute, isPending } = useMutation({
    mutationFn: ({ userId, amount, reason, action }) =>
      action === 'fund'
        ? adminWalletApi.fund({ userId, amount, reason })
        : adminWalletApi.debit({ userId, amount, reason }),
    onSuccess: () => {
      toast.success('Wallet operation successful!')
      setWalletModal(null)
      setForm({ amount: '', reason: '' })
      setWalletData({})
      qc.invalidateQueries({ queryKey: ['wallet-users'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const users = data?.data || []
  const totalPages = data ? Math.ceil(data.meta?.total / 20) : 1

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Wallet Management</h1>
        <p className="page-sub">Fund or debit user wallets</p>
      </div>

      {!isSuperAdmin() && (
        <div className="glass-card p-4 mb-5 border border-yellow-500/20 bg-yellow-500/5">
          <p className="text-yellow-400 text-sm">⚠️ Only Super Admins can fund or debit wallets. You have read-only access.</p>
        </div>
      )}

      <div className="relative mb-5">
        <input className="input-field pl-10" placeholder="Search users…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">🔍</span>
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" /></div> : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['User', 'Email', 'Balance', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-white/30 text-xs uppercase tracking-widest font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {users.length === 0 ? (
                  <tr><td colSpan={4}><EmptyState icon="💳" title="No users found" /></td></tr>
                ) : users.map(u => {
                  const wData = walletData[u._id]
                  return (
                    <tr key={u._id}
                      className="hover:bg-white/2 transition-colors"
                      onMouseEnter={() => fetchWallet(u._id)}>
                      <td className="px-5 py-4 text-white font-medium">{u.fullName}</td>
                      <td className="px-5 py-4 text-white/50">{u.email}</td>
                      <td className="px-5 py-4">
                        {wData
                          ? <span className="text-accent font-semibold">{fmt.currency(wData.balance)}</span>
                          : <span className="text-white/20 text-xs">Hover to load</span>}
                      </td>
                      <td className="px-5 py-4">
                        {isSuperAdmin() && (
                          <div className="flex gap-2">
                            <button onClick={() => setWalletModal({ userId: u._id, name: u.fullName, action: 'fund' })}
                              className="text-xs px-3 py-1.5 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-colors">
                              ↑ Fund
                            </button>
                            <button onClick={() => setWalletModal({ userId: u._id, name: u.fullName, action: 'debit' })}
                              className="text-xs px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors">
                              ↓ Debit
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="px-5 pb-5"><Pagination page={page} totalPages={totalPages} onPage={setPage} /></div>
          </>
        )}
      </div>

      <Modal open={!!walletModal} onClose={() => setWalletModal(null)} title={`${walletModal?.action === 'fund' ? 'Credit' : 'Debit'} Wallet`}>
        {walletModal && (
          <div className="space-y-4">
            <p className="text-white/50 text-sm">
              {walletModal.action === 'fund' ? '↑ Crediting' : '↓ Debiting'} wallet for <strong className="text-white">{walletModal.name}</strong>
            </p>
            <Input label="Amount (₦)" type="number" min="1" placeholder="Enter amount" value={form.amount} onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))} />
            <Input label="Reason" placeholder="e.g. Refund, Bonus, Correction…" value={form.reason} onChange={(e) => setForm(p => ({ ...p, reason: e.target.value }))} />
            <div className="flex gap-3">
              <button onClick={() => setWalletModal(null)} className="btn-ghost flex-1">Cancel</button>
              <button
                disabled={isPending || !form.amount || !form.reason}
                onClick={() => execute({ userId: walletModal.userId, amount: Number(form.amount), reason: form.reason, action: walletModal.action })}
                className="flex-1 py-3 px-5 rounded-xl font-semibold text-navy-900 flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: walletModal.action === 'fund' ? 'linear-gradient(135deg, #00E676, #00C853)' : 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                {isPending ? <><Spinner size="sm" /> Processing…</> : `${walletModal.action === 'fund' ? 'Credit' : 'Debit'} ₦${form.amount || '0'}`}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
