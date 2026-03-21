import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { vtuApi, walletApi } from '../../api/user'
import { fmt, discos } from '../../utils'
import { Input, Select, Spinner, StatCard, Alert } from '../../components/shared/UI'
import { getErrorMessage } from '../../api/client'

const QUICK_AMOUNTS = [1000, 2000, 3000, 5000, 10000, 20000]

export default function ElectricityPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ disco: 'ikedc', meterNumber: '', meterType: 'prepaid', amount: '', phone: '' })
  const [customer, setCustomer] = useState(null)
  const [success, setSuccess] = useState(null)

  const { data: balance } = useQuery({ queryKey: ['wallet-balance'], queryFn: walletApi.getBalance })
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const { mutate: verify, isPending: verifying } = useMutation({
    mutationFn: () => vtuApi.verifyMeter({ disco: form.disco, meterNumber: form.meterNumber, meterType: form.meterType }),
    onSuccess: (data) => {
      setCustomer(data)
      setStep(2)
      toast.success('Meter verified successfully!')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const { mutate: buy, isPending } = useMutation({
    mutationFn: () => vtuApi.buyElectricity({ ...form, amount: Number(form.amount) }),
    onSuccess: (data) => {
      toast.success('Electricity purchased!')
      setSuccess(data)
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
        <div className="w-20 h-20 rounded-full bg-yellow-500/15 flex items-center justify-center mx-auto mb-5 text-4xl">⚡</div>
        <h2 className="font-display font-bold text-2xl text-white mb-2">Payment Successful!</h2>
        <p className="text-white/50 mb-2">Your token has been generated</p>
        {success.token && (
          <div className="glass-card p-4 mb-6">
            <p className="text-white/40 text-xs mb-1">Token</p>
            <p className="text-accent font-mono font-bold text-xl tracking-widest">{success.token}</p>
          </div>
        )}
        <div className="glass-card p-4 text-left space-y-3 mb-6 text-sm">
          {[
            ['Meter', form.meterNumber],
            ['DISCO', discos.find(d => d.id === form.disco)?.label],
            ['Amount', fmt.currency(success.transaction?.amount)],
            ['Reference', success.transaction?.reference],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-white/40">{k}</span>
              <span className="text-white font-medium">{v}</span>
            </div>
          ))}
        </div>
        <button onClick={() => { setSuccess(null); setStep(1); setCustomer(null); setForm(p => ({ ...p, meterNumber: '', amount: '', phone: '' })) }} className="btn-primary">Buy Again</button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-lg">
      <div className="page-header">
        <h1 className="page-title">⚡ Electricity</h1>
        <p className="page-sub">Pay electricity bills easily</p>
      </div>

      <div className="mb-6">
        <StatCard label="Wallet Balance" value={fmt.currency(balance?.balance)} icon="💳" accent />
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {['Verify Meter', 'Pay'].map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step > i ? 'bg-accent text-navy-900' : step === i + 1 ? 'bg-accent/20 text-accent border border-accent/40' : 'bg-navy-700 text-white/30'}`}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className={`text-sm ${step === i + 1 ? 'text-white' : 'text-white/40'}`}>{label}</span>
            {i === 0 && <div className="w-8 h-px bg-white/10" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="glass-card p-6 space-y-5">
          <Select label="DISCO (Electricity Provider)" value={form.disco} onChange={set('disco')}>
            {discos.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
          </Select>
          <Input label="Meter Number" placeholder="Enter meter number" value={form.meterNumber} onChange={set('meterNumber')} />
          <Select label="Meter Type" value={form.meterType} onChange={set('meterType')}>
            <option value="prepaid">Prepaid</option>
            <option value="postpaid">Postpaid</option>
          </Select>
          <button onClick={() => verify()} disabled={verifying || !form.meterNumber} className="btn-primary w-full flex items-center justify-center gap-2">
            {verifying ? <><Spinner size="sm" /> Verifying…</> : 'Verify Meter →'}
          </button>
        </div>
      )}

      {step === 2 && customer && (
        <div className="space-y-4">
          <Alert type="success">
            <strong>{customer.customerName}</strong> — {customer.address}
          </Alert>
          <div className="glass-card p-6 space-y-5">
            <Input label="Phone Number (for receipt)" placeholder="08012345678" value={form.phone} onChange={set('phone')} />
            <div>
              <label className="text-white/60 text-sm font-medium mb-3 block">Amount (₦ — min ₦500)</label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {QUICK_AMOUNTS.map(a => (
                  <button key={a} onClick={() => setForm(p => ({ ...p, amount: String(a) }))}
                    className={`py-2.5 rounded-xl text-sm border transition-all ${form.amount === String(a) ? 'border-accent/60 bg-accent/10 text-accent' : 'border-white/8 text-white/50 hover:border-white/20'}`}>
                    {fmt.currency(a)}
                  </button>
                ))}
              </div>
              <Input placeholder="Or enter custom amount" type="number" min="500" value={form.amount} onChange={set('amount')} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-ghost flex-1">← Back</button>
              <button onClick={() => buy()} disabled={isPending || !form.amount || !form.phone} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {isPending ? <><Spinner size="sm" /> Processing…</> : `Pay ${form.amount ? fmt.currency(Number(form.amount)) : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
