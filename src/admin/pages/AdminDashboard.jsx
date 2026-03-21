import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts'
import { adminDashApi } from '../../api/admin'
import { fmt, txTypeLabel, statusColor } from '../../utils'
import { PageLoader, StatCard, StatusBadge } from '../../components/shared/UI'

const PERIODS = ['today', 'week', 'month', 'year']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-3 py-2 text-xs">
      <p className="text-white/50 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {fmt.currency(p.value)}</p>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const [period, setPeriod] = useState('today')

  const { data: dash, isLoading } = useQuery({
    queryKey: ['admin-dashboard', period],
    queryFn: () => adminDashApi.getDashboard({ period }),
  })

  const { data: volumeData } = useQuery({
    queryKey: ['volume-chart', 'month'],
    queryFn: () => adminDashApi.getVolumeChart('month'),
  })

  const { data: breakdown } = useQuery({
    queryKey: ['service-breakdown', period],
    queryFn: () => adminDashApi.getServiceBreakdown(period),
  })

  if (isLoading) return <PageLoader />

  const d = dash || {}
  const chartData = (volumeData?.chart || []).reduce((acc, item) => {
    const key = item._id?.day ? `${item._id.day}/${item._id.month}` : `${item._id.month}/${item._id.year}`
    const existing = acc.find(a => a.date === key)
    if (existing) { existing[item._id.type] = (existing[item._id.type] || 0) + item.volume }
    else acc.push({ date: key, [item._id.type]: item.volume })
    return acc
  }, [])

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Platform overview</p>
        </div>
        <div className="flex gap-1 p-1 glass-card rounded-xl">
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${
                period === p ? 'bg-amber-400 text-navy-900 font-semibold' : 'text-white/50 hover:text-white'
              }`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Users" value={d.users?.total?.toLocaleString() || '0'} sub={`${d.users?.active} active`} icon="👥" />
        <StatCard label="Total Revenue" value={fmt.currency(d.revenue?.total)} icon="💰" accent />
        <StatCard label="Transactions" value={d.transactions?.total?.toLocaleString() || '0'} sub={`Success rate: ${d.transactions?.successRate}`} icon="💱" />
        <StatCard label="Failed Txns" value={d.transactions?.failed || 0} sub={`${d.transactions?.pending} pending`} icon="❌" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        {/* Volume chart */}
        <div className="col-span-2 glass-card p-5">
          <h3 className="font-display font-semibold text-white mb-4">Transaction Volume (30d)</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="airtime" fill="#00E676" radius={[3,3,0,0]} stackId="a" />
                <Bar dataKey="data" fill="#0066FF" radius={[3,3,0,0]} stackId="a" />
                <Bar dataKey="electricity" fill="#F59E0B" radius={[3,3,0,0]} stackId="a" />
                <Bar dataKey="cable" fill="#A855F7" radius={[3,3,0,0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-white/20 text-sm">No chart data for this period</div>}
        </div>

        {/* Service breakdown */}
        <div className="glass-card p-5">
          <h3 className="font-display font-semibold text-white mb-4">By Service</h3>
          <div className="space-y-3">
            {(breakdown?.breakdown || []).slice(0, 5).map(s => (
              <div key={s.service} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60 capitalize">{txTypeLabel[s.service] || s.service}</span>
                    <span className="text-white/40">{s.count}</span>
                  </div>
                  <div className="h-1.5 bg-navy-700 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, (s.count / Math.max(...(breakdown?.breakdown || []).map(b => b.count), 1)) * 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
            {!breakdown?.breakdown?.length && <p className="text-white/20 text-sm text-center py-4">No data</p>}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="glass-card p-5">
        <h3 className="font-display font-semibold text-white mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/30 text-xs uppercase tracking-widest">
                {['Reference', 'Type', 'Amount', 'Status', 'User', 'Date'].map(h => (
                  <th key={h} className="text-left pb-3 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {(d.recentTransactions || []).map(tx => (
                <tr key={tx._id} className="hover:bg-white/2 transition-colors">
                  <td className="py-3 font-mono text-xs text-white/50">{tx.reference?.slice(0, 20)}…</td>
                  <td className="py-3 capitalize text-white/70">{txTypeLabel[tx.type] || tx.type}</td>
                  <td className="py-3 font-semibold text-accent">{fmt.currency(tx.amount)}</td>
                  <td className="py-3"><StatusBadge status={tx.status} /></td>
                  <td className="py-3 text-white/50">{tx.user?.email || '—'}</td>
                  <td className="py-3 text-white/40">{fmt.date(tx.createdAt)}</td>
                </tr>
              ))}
              {!d.recentTransactions?.length && (
                <tr><td colSpan={6} className="py-8 text-center text-white/20">No transactions in this period</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top users */}
      {d.topUsers?.length > 0 && (
        <div className="glass-card p-5 mt-5">
          <h3 className="font-display font-semibold text-white mb-4">Top Users by Volume</h3>
          <div className="space-y-3">
            {d.topUsers.map((u, i) => (
              <div key={u.userId} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/3">
                <span className="text-2xl font-display font-black text-white/20">#{i + 1}</span>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{u.user?.firstName} {u.user?.lastName}</p>
                  <p className="text-white/40 text-xs">{u.user?.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-accent font-semibold">{fmt.currency(u.totalVolume)}</p>
                  <p className="text-white/40 text-xs">{u.transactionCount} transactions</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
