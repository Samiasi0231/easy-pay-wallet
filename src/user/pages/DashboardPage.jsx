import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useUserStore } from '../../store/auth'
import { walletApi, txApi } from '../../api/user'
import { fmt, txTypeLabel, txTypeIcon, statusColor } from '../../utils'
import { StatCard, PageLoader, TxRow, EmptyState } from '../../components/shared/UI'

const QuickAction = ({ to, icon, label, color }) => (
  <Link to={to} className="glass-card-hover p-4 flex flex-col items-center gap-2 text-center">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
      {icon}
    </div>
    <span className="text-white/70 text-xs font-medium">{label}</span>
  </Link>
)

export default function DashboardPage() {
  const { user } = useUserStore()

  const { data: balance, isLoading: balLoading } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: walletApi.getBalance,
  })

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => walletApi.getTransactions({ page: 1, limit: 5 }),
  })

  const { data: stats } = useQuery({
    queryKey: ['tx-stats'],
    queryFn: () => txApi.getStats('30days'),
  })

  if (balLoading) return <PageLoader />

  const recentTxs = txData?.transactions || []

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Good {greeting()}, {user?.fullName?.split(' ')[0]} 👋</h1>
        <p className="page-sub">Here's what's happening with your account</p>
      </div>

      {/* Wallet Balance */}
      <div className="relative overflow-hidden rounded-2xl mb-8 p-7"
        style={{ background: 'linear-gradient(135deg, #0F3D24 0%, #0A2A1A 50%, #051510 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #00E676 0%, transparent 60%)' }} />
        <div className="relative">
          <p className="text-white/50 text-sm mb-2">Available Balance</p>
          <p className="font-display font-black text-5xl text-white tracking-tight">
            {fmt.currency(balance?.balance || 0)}
          </p>
          <div className="flex gap-6 mt-4 text-sm">
            <div>
              <p className="text-white/40">Total Deposited</p>
              <p className="text-white font-semibold">{fmt.currency(balance?.totalDeposits)}</p>
            </div>
            <div>
              <p className="text-white/40">Total Spent</p>
              <p className="text-white font-semibold">{fmt.currency(balance?.totalSpent)}</p>
            </div>
          </div>
          <Link to="/wallet" className="inline-flex items-center gap-2 mt-5 btn-primary py-2.5 px-5 text-sm">
            + Add Money
          </Link>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="30-Day Transactions" value={stats.totalTransactions} icon="📊" />
          <StatCard label="Successful" value={stats.successfulTransactions} icon="✅" accent />
          <StatCard label="Total Spent (30d)" value={fmt.currency(stats.totalSpent)} icon="💸" />
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="font-display font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-3">
          <QuickAction to="/airtime"     icon="📱" label="Airtime"     color="bg-blue-500/10" />
          <QuickAction to="/data"        icon="🌐" label="Data"        color="bg-green-500/10" />
          <QuickAction to="/electricity" icon="⚡" label="Electricity" color="bg-yellow-500/10" />
          <QuickAction to="/cable"       icon="📺" label="Cable TV"    color="bg-purple-500/10" />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card">
        <div className="flex items-center justify-between p-5 pb-0">
          <h2 className="font-display font-semibold text-white">Recent Transactions</h2>
          <Link to="/transactions" className="text-accent text-sm hover:text-accent-dim transition-colors">
            View all →
          </Link>
        </div>
        <div className="p-2 mt-2">
          {txLoading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-accent/20 border-t-accent rounded-full animate-spin" /></div>
          ) : recentTxs.length === 0 ? (
            <EmptyState icon="📭" title="No transactions yet" message="Your recent transactions will appear here" />
          ) : (
            recentTxs.map(tx => <TxRow key={tx._id} tx={tx} />)
          )}
        </div>
      </div>
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
