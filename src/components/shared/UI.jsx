import { statusColor, txTypeIcon, txTypeLabel, fmt } from '../../utils'

// ── Loading ─────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }) {
  const s = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-10 h-10' : 'w-6 h-6'
  return (
    <div className={`${s} border-2 border-accent/20 border-t-accent rounded-full animate-spin`} />
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-white/40 text-sm">Loading…</p>
      </div>
    </div>
  )
}

// ── Empty state ──────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <span className="text-4xl">{icon}</span>
      <p className="text-white font-semibold">{title}</p>
      {message && <p className="text-white/40 text-sm text-center max-w-xs">{message}</p>}
    </div>
  )
}

// ── Status badge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  return <span className={statusColor[status?.toLowerCase()] || 'badge'}>{status}</span>
}

// ── Transaction row ──────────────────────────────────────────────────────────
export function TxRow({ tx, onClick }) {
  return (
    <div
      onClick={onClick}
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
          <p className="text-white/40 text-xs mt-0.5">{fmt.relative(tx.createdAt)}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-semibold ${tx.type === 'wallet_topup' ? 'text-accent' : 'text-white'}`}>
          {tx.type === 'wallet_topup' ? '+' : '-'}{fmt.currency(tx.amount)}
        </p>
        <StatusBadge status={tx.status} />
      </div>
    </div>
  )
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', onClick }) {
  return (
    <div
      className={`glass-card p-5 ${onClick ? 'cursor-pointer glass-card-hover' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// ── Stat card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon, accent }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest">{label}</p>
          <p className={`text-2xl font-bold font-display mt-1 ${accent ? 'text-accent' : 'text-white'}`}>{value}</p>
          {sub && <p className="text-white/40 text-xs mt-1">{sub}</p>}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-navy-700 flex items-center justify-center text-xl">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, error, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-white/60 text-sm font-medium">{label}</label>}
      <input className="input-field" {...props} />
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-white/60 text-sm font-medium">{label}</label>}
      <select className="input-field" style={{ colorScheme: 'dark' }} {...props}>
        {children}
      </select>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}

// ── Alert ────────────────────────────────────────────────────────────────────
export function Alert({ type = 'info', children }) {
  const styles = {
    info:    'bg-blue-500/10 border-blue-500/20 text-blue-300',
    success: 'bg-green-500/10 border-green-500/20 text-green-300',
    error:   'bg-red-500/10 border-red-500/20 text-red-300',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300',
  }
  return (
    <div className={`border rounded-xl px-4 py-3 text-sm ${styles[type]}`}>
      {children}
    </div>
  )
}

// ── Modal overlay ─────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative glass-card w-full max-w-md p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-lg text-white">{title}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────
export function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        className="btn-ghost px-3 py-2 text-sm disabled:opacity-30"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >← Prev</button>
      <span className="text-white/40 text-sm">Page {page} of {totalPages}</span>
      <button
        className="btn-ghost px-3 py-2 text-sm disabled:opacity-30"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
      >Next →</button>
    </div>
  )
}
