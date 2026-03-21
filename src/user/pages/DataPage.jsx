import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { vtuApi, walletApi } from '../../api/user'
import { fmt, networks } from '../../utils'
import { Input, Spinner, StatCard, PageLoader } from '../../components/shared/UI'
import { getErrorMessage } from '../../api/client'

export default function DataPage() {
  const [network, setNetwork] = useState('mtn')
  const [form, setForm] = useState({ phone: '', planId: '', amount: '' })
  const [success, setSuccess] = useState(null)

  const { data: balance } = useQuery({ queryKey: ['wallet-balance'], queryFn: walletApi.getBalance })

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['data-plans', network],
    queryFn: () => vtuApi.getDataPlans(network),
  })

  const { mutate: buy, isPending } = useMutation({
    mutationFn: () => vtuApi.buyData({ network, phone: form.phone, planId: form.planId, amount: Number(form.amount) }),
    onSuccess: (data) => {
      toast.success('Data bundle purchased successfully!')
      setSuccess(data)
      setForm({ phone: '', planId: '', amount: '' })
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || getErrorMessage(err)
      const refunded = err?.response?.data?.refunded
      toast.error(msg + (refunded ? ' (Wallet refunded)' : ''))
    },
  })

  if (success) {
    return (
      <div className="animate-fade-in max-w-md mx-auto text-center py-16">
        <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-5 text-4xl">✅</div>
        <h2 className="font-display font-bold text-2xl text-white mb-2">Data Purchased!</h2>
        <p className="text-white/50 mb-6">Bundle sent to {success.transaction?.phone}</p>
        <div className="glass-card p-4 text-left space-y-3 mb-6 text-sm">
          {[
            ['Reference', success.transaction?.reference],
            ['Network', network.toUpperCase()],
            ['Plan', form.planId],
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
        <h1 className="page-title">🌐 Buy Data</h1>
        <p className="page-sub">Get data bundles at great rates</p>
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
              <button key={n.id} onClick={() => { setNetwork(n.id); setForm(p => ({ ...p, planId: '', amount: '' })) }}
                className={`py-3 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                  network === n.id ? 'border-accent/60 bg-accent/10 text-accent' : 'border-white/8 text-white/50 hover:border-white/20'
                }`}
              >{n.label}</button>
            ))}
          </div>
        </div>

        <Input
          label="Phone Number"
          placeholder="08012345678"
          value={form.phone}
          onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
          maxLength={11}
        />

        {/* Plan selector */}
        <div>
          <label className="text-white/60 text-sm font-medium mb-3 block">Select Data Plan</label>
          {plansLoading ? (
            <div className="flex justify-center py-4"><Spinner /></div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {(plans || []).map(plan => (
                <button
                  key={plan.id}
                  onClick={() => setForm(p => ({ ...p, planId: plan.id, amount: String(plan.price) }))}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    form.planId === plan.id
                      ? 'border-accent/60 bg-accent/10'
                      : 'border-white/8 hover:border-white/20'
                  }`}
                >
                  <p className="text-white text-sm font-semibold">{plan.name}</p>
                  <p className="text-accent text-sm font-bold mt-0.5">{fmt.currency(plan.price)}</p>
                  {plan.validity && <p className="text-white/30 text-xs mt-0.5">{plan.validity}</p>}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => buy()}
          disabled={isPending || !form.phone || !form.planId}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isPending ? <><Spinner size="sm" /> Processing…</> : `Buy Data${form.amount ? ` — ${fmt.currency(Number(form.amount))}` : ''}`}
        </button>
      </div>
    </div>
  )
}
