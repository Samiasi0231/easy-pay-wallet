import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'
import { adminDashApi } from '../../api/admin'
import { fmt, txTypeLabel } from '../../utils'
import { PageLoader } from '../../components/shared/UI'

const PERIODS = ['week', 'month', 'year']
const COLORS = ['#00E676', '#0066FF', '#F59E0B', '#A855F7', '#F43F5E', '#06B6D4']

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-3 py-2 text-xs border border-white/10">
      <p className="text-white/50 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {fmt.currency(p.value)}</p>
      ))}
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState('month')

  const { data: volumeData, isLoading: vLoading } = useQuery({
    queryKey: ['vol-chart', period],
    queryFn: () => adminDashApi.getVolumeChart(period),
  })

  const { data: breakdown, isLoading: bLoading } = useQuery({
    queryKey: ['svc-breakdown', period],
    queryFn: () => adminDashApi.getServiceBreakdown(period),
  })

  if (vLoading || bLoading) return <PageLoader />

  // Transform volume data for chart
  const chartData = (volumeData?.chart || []).reduce((acc, item) => {
    const key = item._id?.day
      ? `${item._id.day}/${item._id.month}`
      : `${item._id.month}/${item._id.year?.toString().slice(-2)}`
    const existing = acc.find(a => a.date === key)
    if (existing) {
      existing[txTypeLabel[item._id.type] || item._id.type] = (existing[txTypeLabel[item._id.type] || item._id.type] || 0) + item.volume
      existing._count = (existing._count || 0) + item.count
    } else {
      acc.push({ date: key, [txTypeLabel[item._id.type] || item._id.type]: item.volume, _count: item.count })
    }
    return acc
  }, [])

  const pieData = (breakdown?.breakdown || []).map((s, i) => ({
    name: txTypeLabel[s.service] || s.service,
    value: s.totalVolume,
    color: COLORS[i % COLORS.length],
  }))

  const serviceTypes = [...new Set((volumeData?.chart || []).map(i => txTypeLabel[i._id.type] || i._id.type))]

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-sub">Revenue and transaction insights</p>
        </div>
        <div className="flex gap-1 p-1 glass-card rounded-xl">
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${period === p ? 'bg-amber-400 text-navy-900 font-semibold' : 'text-white/50 hover:text-white'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Volume chart */}
      <div className="glass-card p-6 mb-5">
        <h3 className="font-display font-semibold text-white mb-5">Transaction Volume by Service</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<Tip />} />
              {serviceTypes.map((type, i) => (
                <Bar key={type} dataKey={type} fill={COLORS[i % COLORS.length]} radius={[3,3,0,0]} stackId="a" />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-center text-white/20 py-16">No volume data for this period</p>}
      </div>

      {/* Breakdown row */}
      <div className="grid grid-cols-2 gap-5">
        {/* Pie */}
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-white mb-5">Revenue Share</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={85} innerRadius={50} paddingAngle={3}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt.currency(v)} contentStyle={{ background: '#0F1829', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-white/20 py-16">No data</p>}
        </div>

        {/* Service table */}
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-white mb-5">Service Breakdown</h3>
          <div className="space-y-3">
            {(breakdown?.breakdown || []).map((s, i) => (
              <div key={s.service} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/70">{txTypeLabel[s.service] || s.service}</span>
                    <span className="text-white font-semibold">{fmt.currency(s.totalVolume)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-white/30">
                    <span>{s.count} transactions</span>
                    <span>✅ {s.successful} ❌ {s.failed}</span>
                  </div>
                </div>
              </div>
            ))}
            {!breakdown?.breakdown?.length && <p className="text-white/20 text-center py-8">No breakdown data</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
