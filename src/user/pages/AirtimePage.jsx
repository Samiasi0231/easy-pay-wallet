import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { vtuApi, walletApi } from '../../api/user'
import { useUserStore } from '../../store/auth'
import { fmt, networks } from '../../utils'
import { Input, Spinner, StatCard } from '../../components/shared/UI'
import { getErrorMessage } from '../../api/client'

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000]

export default function AirtimePage() {
  const { user } = useUserStore()
  const [form, setForm] = useState({ network: 'mtn', phone: '', amount: '' })
  const [success, setSuccess] = useState(null)

  const { data: balance } = useQuery({ queryKey: ['wallet-balance'], queryFn: walletApi.getBalance })

  const { mutate: buy, isPending } = useMutation({
    mutationFn: () => vtuApi.buyAirtime({ ...form, amount: Number(form.amount) }),
    onSuccess: (data) => {
      toast.success('Airtime purchased successfully!')
      setSuccess(data)
      setForm(p => ({ ...p, phone: '', amount: '' }))
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || getErrorMessage(err)
      const refunded = err?.response?.data?.refunded
      toast.error(msg + (refunded ? ' (Wallet refunded)' : ''))
    },
  })

  const set = (k) => (v) => setForm(p => ({ ...p, [k]: typeof v === 'string' ? v : v.target.value }))

  if (success) {
    return (
      <div className="animate-fade-in max-w-md mx-auto text-center py-16">
        <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-5 text-4xl">✅</div>
        <h2 className="font-display font-bold text-2xl text-white mb-2">Purchase Successful!</h2>
        <p className="text-white/50 mb-6">₦{form.amount} airtime sent to {success.transaction?.phone}</p>
        <div className="glass-card p-4 text-left space-y-3 mb-6 text-sm">
          {[
            ['Reference', success.transaction?.reference],
            ['Network', form.network.toUpperCase()],
            ['Amount', fmt.currency(success.transaction?.amount)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-white/40">{k}</span>
              <span className="text-white font-medium">{v}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setSuccess(null)} className="btn-primary">Buy Again</button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-lg">
      <div className="page-header">
        <h1 className="page-title">📱 Buy Airtime</h1>
        <p className="page-sub">Top up any Nigerian number instantly</p>
      </div>

      <div className="mb-6">
        <StatCard label="Wallet Balance" value={fmt.currency(balance?.balance)} icon="💳" accent />
      </div>

      <div className="glass-card p-6 space-y-5">
        {/* Network selector */}
        <div>
          <label className="text-white/60 text-sm font-medium mb-3 block">Select Network</label>
          <div className="grid grid-cols-4 gap-2">
            {networks.map(n => (
              <button
                key={n.id}
                onClick={() => set('network')(n.id)}
                className={`py-3 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                  form.network === n.id
                    ? 'border-accent/60 bg-accent/10 text-accent'
                    : 'border-white/8 text-white/50 hover:border-white/20'
                }`}
              >
                {n.label}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Phone Number"
          placeholder="08012345678"
          value={form.phone}
          onChange={set('phone')}
          maxLength={11}
        />

        {/* Quick amounts */}
        <div>
          <label className="text-white/60 text-sm font-medium mb-3 block">Amount (₦)</label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {QUICK_AMOUNTS.map(a => (
              <button
                key={a}
                onClick={() => set('amount')(String(a))}
                className={`py-2.5 rounded-xl text-sm border transition-all ${
                  form.amount === String(a)
                    ? 'border-accent/60 bg-accent/10 text-accent'
                    : 'border-white/8 text-white/50 hover:border-white/20'
                }`}
              >
                {fmt.currency(a)}
              </button>
            ))}
          </div>
          <Input
            placeholder="Or enter custom amount"
            type="number"
            min="50"
            value={form.amount}
            onChange={set('amount')}
          />
        </div>

        <button
          onClick={() => buy()}
          disabled={isPending || !form.phone || !form.amount}
          className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
        >
          {isPending ? <><Spinner size="sm" /> Processing…</> : `Buy Airtime — ${form.amount ? fmt.currency(Number(form.amount)) : '₦0'}`}
        </button>
      </div>
    </div>
  )
}
