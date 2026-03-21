import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { vtuApi, walletApi } from '../../api/user'
import { fmt, cableProviders } from '../../utils'
import { Input, Spinner, StatCard, Alert } from '../../components/shared/UI'
import { getErrorMessage } from '../../api/client'

export default function CablePage() {
  const [step, setStep] = useState(1)
  const [provider, setProvider] = useState('dstv')
  const [form, setForm] = useState({ smartCardNumber: '', packageId: '', amount: '', phone: '' })
  const [customer, setCustomer] = useState(null)
  const [success, setSuccess] = useState(null)

  const { data: balance } = useQuery({ queryKey: ['wallet-balance'], queryFn: walletApi.getBalance })

  const { data: packages, isLoading: pkgLoading } = useQuery({
    queryKey: ['cable-packages', provider],
    queryFn: () => vtuApi.getCablePackages(provider),
  })

  const { mutate: verify, isPending: verifying } = useMutation({
    mutationFn: () => vtuApi.verifySmartCard({ provider, smartCardNumber: form.smartCardNumber }),
    onSuccess: (data) => {
      setCustomer(data)
      setStep(2)
      toast.success('Smart card verified!')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const { mutate: buy, isPending } = useMutation({
    mutationFn: () => vtuApi.buyCable({ provider, ...form, amount: Number(form.amount) }),
    onSuccess: (data) => {
      toast.success('Cable subscription successful!')
      setSuccess(data)
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || getErrorMessage(err)
      toast.error(msg + (err?.response?.data?.refunded ? ' (Wallet refunded)' : ''))
    },
  })

  if (success) {
    return (
      <div className="animate-fade-in max-w-md mx-auto text-center py-16">
        <div className="w-20 h-20 rounded-full bg-purple-500/15 flex items-center justify-center mx-auto mb-5 text-4xl">📺</div>
        <h2 className="font-display font-bold text-2xl text-white mb-2">Subscription Successful!</h2>
        <p className="text-white/50 mb-6">Your subscription has been activated</p>
        <div className="glass-card p-4 text-left space-y-3 mb-6 text-sm">
          {[
            ['Provider', provider.toUpperCase()],
            ['Smart Card', form.smartCardNumber],
            ['Amount', fmt.currency(success.transaction?.amount)],
            ['Reference', success.transaction?.reference],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-white/40">{k}</span>
              <span className="text-white font-medium">{v}</span>
            </div>
          ))}
        </div>
        <button onClick={() => { setSuccess(null); setStep(1); setCustomer(null); setForm({ smartCardNumber: '', packageId: '', amount: '', phone: '' }) }} className="btn-primary">Subscribe Again</button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-lg">
      <div className="page-header">
        <h1 className="page-title">📺 Cable TV</h1>
        <p className="page-sub">Renew DStv, GOtv & StarTimes subscriptions</p>
      </div>

      <div className="mb-6">
        <StatCard label="Wallet Balance" value={fmt.currency(balance?.balance)} icon="💳" accent />
      </div>

      {/* Provider selector */}
      <div className="flex gap-3 mb-6">
        {cableProviders.map(p => (
          <button key={p.id} onClick={() => { setProvider(p.id); setForm(f => ({ ...f, packageId: '', amount: '' })) }}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm border transition-all ${
              provider === p.id ? 'border-accent/60 bg-accent/10 text-accent' : 'border-white/8 text-white/50 hover:border-white/20'
            }`}>
            {p.label}
          </button>
        ))}
      </div>

      {step === 1 && (
        <div className="glass-card p-6 space-y-5">
          <Input
            label="Smart Card / IUC Number"
            placeholder="Enter your card number"
            value={form.smartCardNumber}
            onChange={(e) => setForm(p => ({ ...p, smartCardNumber: e.target.value }))}
          />
          <button onClick={() => verify()} disabled={verifying || !form.smartCardNumber} className="btn-primary w-full flex items-center justify-center gap-2">
            {verifying ? <><Spinner size="sm" /> Verifying…</> : 'Verify Smart Card →'}
          </button>
        </div>
      )}

      {step === 2 && customer && (
        <div className="space-y-4">
          <Alert type="success">
            <strong>{customer.customerName}</strong> — Current: {customer.currentPackage}
          </Alert>
          <div className="glass-card p-6 space-y-5">
            <div>
              <label className="text-white/60 text-sm font-medium mb-3 block">Select Package</label>
              {pkgLoading ? <div className="flex justify-center py-4"><Spinner /></div> : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {(packages || []).map(pkg => (
                    <button key={pkg.id} onClick={() => setForm(p => ({ ...p, packageId: pkg.id, amount: String(pkg.price) }))}
                      className={`w-full p-3 rounded-xl text-left border transition-all flex items-center justify-between ${
                        form.packageId === pkg.id ? 'border-accent/60 bg-accent/10' : 'border-white/8 hover:border-white/20'
                      }`}>
                      <div>
                        <p className="text-white text-sm font-semibold">{pkg.name}</p>
                        <p className="text-white/30 text-xs">{pkg.duration}</p>
                      </div>
                      <p className="text-accent font-bold">{fmt.currency(pkg.price)}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Input label="Phone Number (for receipt)" placeholder="08012345678" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} />
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-ghost flex-1">← Back</button>
              <button onClick={() => buy()} disabled={isPending || !form.packageId || !form.phone} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {isPending ? <><Spinner size="sm" /> Processing…</> : `Pay ${form.amount ? fmt.currency(Number(form.amount)) : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
