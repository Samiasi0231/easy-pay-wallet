export const fmt = {
  currency: (n) => `₦${Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  date: (d) => new Date(d).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }),
  datetime: (d) => new Date(d).toLocaleString('en-NG', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
  relative: (d) => {
    const diff = Date.now() - new Date(d).getTime()
    if (diff < 60_000) return 'Just now'
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
    return fmt.date(d)
  },
}

export const txTypeLabel = {
  wallet_topup: 'Wallet Topup',
  wallet_withdrawal: 'Withdrawal',
  airtime: 'Airtime',
  data: 'Data',
  electricity: 'Electricity',
  cable: 'Cable TV',
}

export const txTypeIcon = {
  wallet_topup: '💰',
  wallet_withdrawal: '💸',
  airtime: '📱',
  data: '🌐',
  electricity: '⚡',
  cable: '📺',
}

export const statusColor = {
  success: 'badge-success',
  failed: 'badge-failed',
  pending: 'badge-pending',
  processing: 'badge-processing',
}

export const networks = [
  { id: 'mtn', label: 'MTN', color: '#FFCC00', bg: '#1a1500' },
  { id: 'airtel', label: 'Airtel', color: '#FF0000', bg: '#1a0000' },
  { id: 'glo', label: 'Glo', color: '#00A651', bg: '#001a0d' },
  { id: '9mobile', label: '9Mobile', color: '#00A651', bg: '#001a0d' },
]

export const discos = [
  { id: 'ikedc', label: 'Ikeja Electric (IKEDC)' },
  { id: 'ekedc', label: 'Eko Electric (EKEDC)' },
  { id: 'eedc',  label: 'Enugu Electric (EEDC)' },
  { id: 'phed',  label: 'Port Harcourt (PHED)' },
  { id: 'kedco', label: 'Kano Electric (KEDCO)' },
  { id: 'bedc',  label: 'Benin Electric (BEDC)' },
  { id: 'jed',   label: 'Jos Electric (JED)' },
  { id: 'ume',   label: 'Ughelli Power (UME)' },
]

export const cableProviders = [
  { id: 'dstv',      label: 'DStv',      color: '#0066CC' },
  { id: 'gotv',      label: 'GOtv',      color: '#FF6600' },
  { id: 'startimes', label: 'StarTimes', color: '#FF0000' },
]
