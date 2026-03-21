import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { txApi } from '../../api/user'
import { fmt, txTypeLabel, txTypeIcon, statusColor } from '../../utils'
import { PageLoader, EmptyState, Pagination, Modal, StatusBadge } from '../../components/shared/UI'

const TX_TYPES = ['', 'airtime', 'data', 'electricity', 'cable', 'wallet_topup', 'wallet_withdrawal']

export default function TransactionsPage() {
  const [page, setPage] = useState(1)
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', page, type, status],
    queryFn: () => txApi.getAll({ page, limit: 20, type: type || undefined, status: status || undefined }),
  })

  const { data: stats } = useQuery({
    queryKey: ['tx-stats-30d'],
    queryFn: () => txApi.getStats('30days'),
  })

  if (isLoading && page === 1) return <PageLoader />

  const transactions = data?.transactions || []
  const totalPages = data ? Math.ceil(data.total / 20) : 1

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Transaction History</h1>
        <p className="page-sub">{data?.total || 0} total transactions</p>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total (30d)', value: stats.totalTransactions, icon: '📊' },
            { label: 'Successful', value: stats.successfulTransactions, icon: '✅', green: true },
            { label: 'Spent (30d)', value: fmt.currency(stats.totalSpent), icon: '💸' },
          ].map(s => (
            <div key={s.label} className="glass-card p-4 flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-white/40 text-xs">{s.label}</p>
                <p className={`font-semibold ${s.green ? 'text-accent' : 'text-white'}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <select
          className="input-field w-auto py-2 text-sm"
          style={{ colorScheme: 'dark' }}
          value={type}
          onChange={(e) => { setType(e.target.value); setPage(1) }}
        >
          <option value="">All Types</option>
          {TX_TYPES.filter(Boolean).map(t => (
            <option key={t} value={t}>{txTypeLabel[t] || t}</option>
          ))}
        </select>
        <select
          className="input-field w-auto py-2 text-sm"
          style={{ colorScheme: 'dark' }}
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
        >
          <option value="">All Status</option>
          {['success', 'failed', 'pending', 'processing'].map(s => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="glass-card">
        <div className="p-2">
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-accent/20 border-t-accent rounded-full animate-spin" /></div>
          ) : transactions.length === 0 ? (
            <EmptyState icon="📭" title="No transactions found" message="Try adjusting your filters" />
          ) : (
            <>
              {transactions.map(tx => (
                <div key={tx._id}
                  onClick={() => setSelected(tx)}
                  className="flex items-center justify-between p-4 hover:bg-white/3 rounded-xl cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-navy-700 flex items-center justify-center text-lg">
                      {txTypeIcon[tx.type] || '💳'}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium group-hover:text-accent transition-colors">
                        {txTypeLabel[tx.type] || tx.type}
                      </p>
                      <p className="text-white/40 text-xs">{fmt.datetime(tx.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${tx.type === 'wallet_topup' ? 'text-accent' : 'text-white'}`}>
                      {tx.type === 'wallet_topup' ? '+' : '-'}{fmt.currency(tx.amount)}
                    </p>
                    <StatusBadge status={tx.status} />
                  </div>
                </div>
              ))}
              <Pagination page={page} totalPages={totalPages} onPage={setPage} />
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Transaction Details">
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="flex justify-center py-3">
              <div className="w-16 h-16 rounded-2xl bg-navy-700 flex items-center justify-center text-3xl">
                {txTypeIcon[selected.type] || '💳'}
              </div>
            </div>
            {[
              ['Type', txTypeLabel[selected.type] || selected.type],
              ['Status', <StatusBadge key="s" status={selected.status} />],
              ['Amount', fmt.currency(selected.amount)],
              ['Reference', selected.reference],
              ['Date', fmt.datetime(selected.createdAt)],
              selected.description && ['Description', selected.description],
              selected.errorMessage && ['Error', selected.errorMessage],
            ].filter(Boolean).map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-white/40">{k}</span>
                <span className="text-white font-medium text-right max-w-[200px] break-all">{v}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
