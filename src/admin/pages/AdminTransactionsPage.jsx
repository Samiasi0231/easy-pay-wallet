import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { adminTxApi } from '../../api/admin'
import { fmt, txTypeLabel, txTypeIcon, statusColor } from '../../utils'
import { PageLoader, StatusBadge, Pagination, EmptyState, Modal, Input, Spinner } from '../../components/shared/UI'
import { getErrorMessage } from '../../api/client'
import { useAdminStore } from '../../store/auth'

const STATUS_TRANSITIONS = {
  pending: ['processing', 'failed'],
  processing: ['success', 'failed'],
  success: [],
  failed: ['pending'],
}

export default function AdminTransactionsPage() {
  const qc = useQueryClient()
  const { isSuperAdmin } = useAdminStore()
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ status: '', type: '', search: '' })
  const [selected, setSelected] = useState(null)
  const [statusModal, setStatusModal] = useState(null)
  const [statusForm, setStatusForm] = useState({ status: '', note: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-transactions', page, filters],
    queryFn: () => adminTxApi.getAll({
      page, limit: 20,
      status: filters.status || undefined,
      type: filters.type || undefined,
      search: filters.search || undefined,
    }),
  })

  const { data: detail } = useQuery({
    queryKey: ['admin-tx-detail', selected],
    queryFn: () => adminTxApi.getById(selected),
    enabled: !!selected,
  })

  const { mutate: updateStatus, isPending: updating } = useMutation({
    mutationFn: ({ id, ...d }) => adminTxApi.updateStatus(id, d),
    onSuccess: () => {
      toast.success('Transaction status updated')
      setStatusModal(null)
      qc.invalidateQueries({ queryKey: ['admin-transactions'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const transactions = data?.data || []
  const totalPages = data ? Math.ceil(data.meta?.total / 20) : 1

  const setFilter = (k) => (e) => { setFilters(p => ({ ...p, [k]: e.target.value })); setPage(1) }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Transactions</h1>
        <p className="page-sub">{data?.meta?.total || 0} total transactions</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="flex-1 relative min-w-48">
          <input className="input-field pl-10 text-sm" placeholder="Search reference or description…" value={filters.search} onChange={setFilter('search')} />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">🔍</span>
        </div>
        <select className="input-field w-36 text-sm" style={{ colorScheme: 'dark' }} value={filters.status} onChange={setFilter('status')}>
          <option value="">All Status</option>
          {['success','failed','pending','processing'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
        <select className="input-field w-36 text-sm" style={{ colorScheme: 'dark' }} value={filters.type} onChange={setFilter('type')}>
          <option value="">All Types</option>
          {Object.entries(txTypeLabel).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {isLoading ? <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" /></div> : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Reference', 'Type', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-white/30 text-xs uppercase tracking-widest font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {transactions.length === 0 ? (
                  <tr><td colSpan={6}><EmptyState icon="💱" title="No transactions found" /></td></tr>
                ) : transactions.map(tx => (
                  <tr key={tx._id} className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-white/50">{tx.reference?.slice(0, 22)}…</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5">
                        <span>{txTypeIcon[tx.type]}</span>
                        <span className="text-white/70 capitalize">{txTypeLabel[tx.type] || tx.type}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-accent">{fmt.currency(tx.amount)}</td>
                    <td className="px-5 py-3"><StatusBadge status={tx.status} /></td>
                    <td className="px-5 py-3 text-white/40">{fmt.date(tx.createdAt)}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setSelected(tx._id)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-colors">
                          Details
                        </button>
                        {isSuperAdmin() && STATUS_TRANSITIONS[tx.status]?.length > 0 && (
                          <button onClick={() => { setStatusModal(tx); setStatusForm({ status: STATUS_TRANSITIONS[tx.status][0], note: '' }) }}
                            className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-colors">
                            Update
                          </button>
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

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Transaction Details">
        {detail && (
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-center py-2">
              <div className="w-14 h-14 rounded-2xl bg-navy-700 flex items-center justify-center text-2xl">
                {txTypeIcon[detail.type] || '💳'}
              </div>
            </div>
            {[
              ['Reference', detail.reference],
              ['Type', txTypeLabel[detail.type] || detail.type],
              ['Status', <StatusBadge key="s" status={detail.status} />],
              ['Amount', fmt.currency(detail.amount)],
              ['Fee', fmt.currency(detail.fee || 0)],
              ['Description', detail.description],
              ['Date', fmt.datetime(detail.createdAt)],
              detail.errorMessage && ['Error', detail.errorMessage],
            ].filter(Boolean).map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-white/40">{k}</span>
                <span className="text-white text-right max-w-[240px] break-all">{v}</span>
              </div>
            ))}
            {detail.metadata && (
              <details className="mt-2">
                <summary className="text-white/30 text-xs cursor-pointer hover:text-white/50">Show metadata</summary>
                <pre className="text-xs text-white/30 mt-2 overflow-auto">{JSON.stringify(detail.metadata, null, 2)}</pre>
              </details>
            )}
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal open={!!statusModal} onClose={() => setStatusModal(null)} title="Update Transaction Status">
        {statusModal && (
          <div className="space-y-4">
            <div className="text-sm text-white/50">
              Current: <StatusBadge status={statusModal.status} />
            </div>
            <div>
              <label className="text-white/60 text-sm mb-1.5 block">New Status</label>
              <div className="flex gap-2 flex-wrap">
                {STATUS_TRANSITIONS[statusModal.status]?.map(s => (
                  <button key={s} onClick={() => setStatusForm(p => ({ ...p, status: s }))}
                    className={`px-4 py-2 rounded-xl text-sm capitalize border transition-all ${statusForm.status === s ? 'border-amber-400/60 bg-amber-400/10 text-amber-400' : 'border-white/8 text-white/50 hover:border-white/20'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <Input label="Note (optional)" placeholder="Reason for status change…" value={statusForm.note} onChange={(e) => setStatusForm(p => ({ ...p, note: e.target.value }))} />
            <div className="flex gap-3">
              <button onClick={() => setStatusModal(null)} className="btn-ghost flex-1">Cancel</button>
              <button
                disabled={updating || !statusForm.status}
                onClick={() => updateStatus({ id: statusModal._id, status: statusForm.status, note: statusForm.note })}
                className="flex-1 py-3 px-6 rounded-xl font-semibold text-navy-900 flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                {updating ? <><Spinner size="sm" /> Updating…</> : 'Update Status'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
