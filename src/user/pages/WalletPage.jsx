import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { walletApi } from '../../api/user'
import { useUserStore } from '../../store/auth'
import { fmt, statusColor, txTypeIcon, txTypeLabel } from '../../utils'
import { PageLoader, TxRow, Modal, Input, Select, Spinner, EmptyState, Pagination } from '../../components/shared/UI'
import { getErrorMessage } from '../../api/client'

export default function WalletPage() {
  const { user } = useUserStore()
  const [topupOpen, setTopupOpen] = useState(false)
  const [topupForm, setTopupForm] = useState({ amount: '', paymentMethod: 'paystack' })
  const [page, setPage] = useState(1)
  const [verifyRef, setVerifyRef] = useState('')
  const [verifyOpen, setVerifyOpen] = useState(false)

  const { data: balance, refetch: refetchBal } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: walletApi.getBalance,
  })

  const { data: txData, isLoading: txLoading, refetch: refetchTx } = useQuery({
    queryKey: ['wallet-transactions', page],
    queryFn: () => walletApi.getTransactions({ page, limit: 15 }),
  })

  const { mutate: topup, isPending: topupPending } = useMutation({
    mutationFn: () => walletApi.topup({ amount: Number(topupForm.amount), paymentMethod: topupForm.paymentMethod }),
    onSuccess: (data) => {
      setTopupOpen(false)
      if (data.authorizationUrl) {
        window.open(data.authorizationUrl, '_blank')
        toast.success('Payment page opened. After payment, click Verify Payment.')
      }
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const { mutate: verify, isPending: verifyPending } = useMutation({
    mutationFn: () => walletApi.verifyPayment({ reference: verifyRef }),
    onSuccess: () => {
      toast.success('Payment verified and wallet credited!')
      setVerifyOpen(false)
      setVerifyRef('')
      refetchBal()
      refetchTx()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  if (!balance) return <PageLoader />

  const transactions = txData?.transactions || []
  const totalPages = txData ? Math.ceil(txData.total / 15) : 1

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Wallet</h1>
        <p className="page-sub">Manage your balance and transactions</p>
      </div>

      {/* Balance card */}
      <div className="relative overflow-hidden rounded-2xl mb-8 p-8"
        style={{ background: 'linear-gradient(135deg, #061F12 0%, #0A2A1A 60%, #0F3D24 100%)' }}>
        <div className="absolute top-0 right-0 w-72 h-72 opacity-10"
          style={{ background: 'radial-gradient(circle, #00E676 0%, transparent 70%)' }} />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-white/50 text-sm">Total Balance</p>
            <p className="font-display font-black text-5xl text-white mt-1 tracking-tight">
              {fmt.currency(balance.balance)}
            </p>
            <div className="flex gap-8 mt-5">
              {[
                { label: 'Total In', value: balance.totalDeposits, icon: '↑', color: 'text-accent' },
                { label: 'Total Out', value: balance.totalSpent, icon: '↓', color: 'text-red-400' },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-white/40 text-xs">{s.label}</p>
                  <p className={`font-semibold ${s.color}`}>{s.icon} {fmt.currency(s.value)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => setTopupOpen(true)} className="btn-primary text-sm">
              + Fund Wallet
            </button>
            <button onClick={() => setVerifyOpen(true)} className="btn-ghost text-sm">
              Verify Payment
            </button>
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div className="glass-card">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="font-display font-semibold text-white">Transaction History</h2>
        </div>
        <div className="p-2">
          {txLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : transactions.length === 0 ? (
            <EmptyState icon="📭" title="No transactions yet" />
          ) : (
            <>
              {transactions.map(tx => <TxRow key={tx._id} tx={tx} />)}
              <Pagination page={page} totalPages={totalPages} onPage={setPage} />
            </>
          )}
        </div>
      </div>

      {/* Topup Modal */}
      <Modal open={topupOpen} onClose={() => setTopupOpen(false)} title="Fund Wallet">
        <div className="space-y-4">
          <Input
            label="Amount (₦)"
            type="number"
            placeholder="1000"
            min="100"
            value={topupForm.amount}
            onChange={(e) => setTopupForm(p => ({ ...p, amount: e.target.value }))}
          />
          <Select
            label="Payment Method"
            value={topupForm.paymentMethod}
            onChange={(e) => setTopupForm(p => ({ ...p, paymentMethod: e.target.value }))}
          >
            <option value="paystack">Paystack (Card / Bank)</option>
            <option value="flutterwave">Flutterwave</option>
          </Select>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setTopupOpen(false)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={() => topup()} disabled={topupPending || !topupForm.amount} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {topupPending ? <><Spinner size="sm" /> Processing…</> : 'Continue to Payment'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Verify Modal */}
      <Modal open={verifyOpen} onClose={() => setVerifyOpen(false)} title="Verify Payment">
        <div className="space-y-4">
          <p className="text-white/50 text-sm">Enter your payment reference to verify and credit your wallet.</p>
          <Input
            label="Payment Reference"
            placeholder="e.g. TXN-16789..."
            value={verifyRef}
            onChange={(e) => setVerifyRef(e.target.value)}
          />
          <div className="flex gap-3 mt-4">
            <button onClick={() => setVerifyOpen(false)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={() => verify()} disabled={verifyPending || !verifyRef} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {verifyPending ? <><Spinner size="sm" /> Verifying…</> : 'Verify'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
