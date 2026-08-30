import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  getEarnings,
  getFuelLogs,
  getPlatforms,
  getWeeklyAnalytics,
  getMonthlyAnalytics,
} from '@/services/api'
import PageTransition from '@/components/shared/PageTransition'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Sparkles,
  TrendingUp,
  Wallet,
  Car,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  Clock,
  Fuel,
  Zap,
  Calendar,
  ShieldCheck,
  Percent,
} from 'lucide-react'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Custom Glassmorphic Tooltip for Area / Bar Charts
const GlassTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-3.5 shadow-xl text-xs space-y-1">
      <p className="font-semibold text-zinc-500 dark:text-zinc-400">{label}</p>
      {payload.map((p, idx) => (
        <p key={idx} className="font-bold text-zinc-900 dark:text-white" style={{ color: p.color || p.fill }}>
          {p.name}: {typeof p.value === 'number' ? (p.name.includes('PKR') || p.name.includes('Revenue') ? `PKR ${p.value.toLocaleString()}` : p.value.toLocaleString()) : p.value}
        </p>
      ))}
    </div>
  )
}

// Donut Chart Custom Tooltip
const DonutTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const data = payload[0]
  return (
    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-3.5 shadow-xl text-xs space-y-1">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.color }} />
        <p className="font-bold text-zinc-900 dark:text-white">{data.name}</p>
      </div>
      <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
        PKR {Number(data.value).toLocaleString()} ({data.payload.percentage}%)
      </p>
    </div>
  )
}

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState('30days') // 30days, 90days, all

  // Fetch data queries
  const { data: earnings = [], isLoading: earningsLoading } = useQuery({
    queryKey: ['earnings'],
    queryFn: () => getEarnings(),
  })

  const { data: fuelLogs = [], isLoading: fuelLoading } = useQuery({
    queryKey: ['fuel-logs'],
    queryFn: () => getFuelLogs(),
  })

  const { data: platforms = [] } = useQuery({
    queryKey: ['platforms'],
    queryFn: getPlatforms,
  })

  const { data: weeklyData = [] } = useQuery({
    queryKey: ['analytics-weekly'],
    queryFn: getWeeklyAnalytics,
  })

  const { data: monthlyData = [] } = useQuery({
    queryKey: ['analytics-monthly'],
    queryFn: getMonthlyAnalytics,
  })

  const isLoading = earningsLoading || fuelLoading

  // Filter earnings & fuel logs by timeframe
  const filteredEarnings = useMemo(() => {
    if (timeframe === 'all') return earnings
    const now = new Date()
    const cutoff = new Date()
    if (timeframe === '30days') cutoff.setDate(now.getDate() - 30)
    if (timeframe === '90days') cutoff.setDate(now.getDate() - 90)
    cutoff.setHours(0, 0, 0, 0)
    return earnings.filter((e) => new Date(e.date) >= cutoff)
  }, [earnings, timeframe])

  const filteredFuelLogs = useMemo(() => {
    if (timeframe === 'all') return fuelLogs
    const now = new Date()
    const cutoff = new Date()
    if (timeframe === '30days') cutoff.setDate(now.getDate() - 30)
    if (timeframe === '90days') cutoff.setDate(now.getDate() - 90)
    cutoff.setHours(0, 0, 0, 0)
    return fuelLogs.filter((f) => new Date(f.date) >= cutoff)
  }, [fuelLogs, timeframe])

  // Aggregate Key Statistics
  const analyticsSummary = useMemo(() => {
    const grossIncome = filteredEarnings.reduce((acc, e) => acc + Number(e.gross_amount || 0), 0)
    const fuelExpense = filteredFuelLogs.reduce((acc, f) => acc + Number(f.amount || 0), 0)
    const netProfit = grossIncome - fuelExpense
    const fuelRatio = grossIncome > 0 ? (fuelExpense / grossIncome) * 100 : 0

    const totalRides = filteredEarnings.reduce((acc, e) => acc + Number(e.ride_count || 0), 0)
    const totalHours = filteredEarnings.reduce((acc, e) => acc + Number(e.hours_worked || 0), 0)

    const avgPerTrip = totalRides > 0 ? grossIncome / totalRides : 0
    const tripsPerHour = totalHours > 0 ? totalRides / totalHours : 0
    const netPerHour = totalHours > 0 ? netProfit / totalHours : 0

    return {
      grossIncome,
      fuelExpense,
      netProfit,
      fuelRatio,
      totalRides,
      totalHours,
      avgPerTrip,
      tripsPerHour,
      netPerHour,
    }
  }, [filteredEarnings, filteredFuelLogs])

  // Revenue Share by Platform (Donut Chart)
  const platformShareData = useMemo(() => {
    const map = {}
    filteredEarnings.forEach((e) => {
      const name = e.platform_name || 'Other'
      const color = e.platform_color || '#6366f1'
      if (!map[name]) {
        map[name] = { name, value: 0, color }
      }
      map[name].value += Number(e.gross_amount || 0)
    })

    const list = Object.values(map)
    const total = list.reduce((acc, item) => acc + item.value, 0)

    return list
      .map((item) => ({
        ...item,
        percentage: total > 0 ? Math.round((item.value / total) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value)
  }, [filteredEarnings])

  // Day-of-Week Revenue Distribution
  const dayOfWeekData = useMemo(() => {
    const days = [
      { day: 'Mon', total: 0, rides: 0 },
      { day: 'Tue', total: 0, rides: 0 },
      { day: 'Wed', total: 0, rides: 0 },
      { day: 'Thu', total: 0, rides: 0 },
      { day: 'Fri', total: 0, rides: 0 },
      { day: 'Sat', total: 0, rides: 0 },
      { day: 'Sun', total: 0, rides: 0 },
    ]

    filteredEarnings.forEach((e) => {
      if (!e.date) return
      const d = new Date(e.date)
      let dayIdx = d.getDay() - 1 // Mon = 0, Sun = 6
      if (dayIdx < 0) dayIdx = 6 // Sunday
      if (days[dayIdx]) {
        days[dayIdx].total += Number(e.gross_amount || 0)
        days[dayIdx].rides += Number(e.ride_count || 0)
      }
    })

    return days
  }, [filteredEarnings])

  // Best Day of Week
  const bestDay = useMemo(() => {
    let top = { day: 'N/A', total: 0 }
    dayOfWeekData.forEach((d) => {
      if (d.total > top.total) top = d
    })
    return top
  }, [dayOfWeekData])

  // Trip Volume vs Hours Worked by Platform
  const volumeVsHoursData = useMemo(() => {
    const map = {}
    filteredEarnings.forEach((e) => {
      const name = e.platform_name || 'Other'
      if (!map[name]) {
        map[name] = { platform: name, rides: 0, hours: 0, color: e.platform_color || '#6366f1' }
      }
      map[name].rides += Number(e.ride_count || 0)
      map[name].hours += Number(e.hours_worked || 0)
    })
    return Object.values(map)
  }, [filteredEarnings])

  // Daily Trend Area Chart Data
  const dailyTrendData = useMemo(() => {
    return weeklyData.map((d) => ({
      ...d,
      formattedDay: new Date(d.day).toLocaleDateString('en-PK', {
        month: 'short',
        day: 'numeric',
      }),
    }))
  }, [weeklyData])

  const statsList = [
    {
      title: 'Gross Revenue',
      value: `PKR ${analyticsSummary.grossIncome.toLocaleString()}`,
      sub: `${analyticsSummary.totalRides} trips logged`,
      icon: Wallet,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      title: 'Net Profit',
      value: `PKR ${analyticsSummary.netProfit.toLocaleString()}`,
      sub: 'After fuel costs',
      icon: ShieldCheck,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40',
    },
    {
      title: 'Avg Income / Trip',
      value: `PKR ${Math.round(analyticsSummary.avgPerTrip).toLocaleString()}`,
      sub: 'Per ride efficiency',
      icon: Car,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40',
    },
    {
      title: 'Fuel Expense Ratio',
      value: `${analyticsSummary.fuelRatio.toFixed(1)}%`,
      sub: `PKR ${analyticsSummary.fuelExpense.toLocaleString()} fuel`,
      icon: Fuel,
      color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40',
    },
    {
      title: 'Best Day to Drive',
      value: bestDay.day,
      sub: bestDay.total > 0 ? `PKR ${bestDay.total.toLocaleString()} peak` : 'No data',
      icon: Calendar,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
    },
    {
      title: 'Trips Per Hour',
      value: analyticsSummary.tripsPerHour > 0 ? `${analyticsSummary.tripsPerHour.toFixed(1)} rides/h` : '—',
      sub: `${analyticsSummary.totalHours} hrs worked`,
      icon: Zap,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40',
    },
  ]

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Hero Section Banner Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 sm:p-8 shadow-2xl shadow-indigo-950/20">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-1/3 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-indigo-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Multi-Angle Financial Suite</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Performance & Analytics
              </h1>
              <p className="text-sm text-indigo-100/80 leading-relaxed">
                Comprehensive breakdown of revenue, platform shares, net profitability after fuel, and day-of-week trends.
              </p>
            </div>

            {/* Time Horizon Filter Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shrink-0">
              {[
                { id: '30days', label: '30 Days' },
                { id: '90days', label: '90 Days' },
                { id: 'all', label: 'All Time' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTimeframe(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    timeframe === item.id
                      ? 'bg-white text-indigo-950 shadow-md'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Expanded 6-Card KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statsList.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {item.title}
                  </span>
                  <div className={`p-1.5 rounded-lg ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight truncate">
                  {isLoading ? '...' : item.value}
                </div>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">
                  {item.sub}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Charts Row 1: Daily Revenue Trend + Platform Share Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Revenue Area Chart (2 Cols) */}
          <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  Daily Revenue Timeline
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Daily earnings trajectory over the selected timeframe
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="h-60 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
            ) : dailyTrendData.length === 0 ? (
              <div className="h-60 flex items-center justify-center text-zinc-400 text-xs">
                No revenue logs recorded for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="multiColorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" strokeOpacity={0.4} />
                  <XAxis
                    dataKey="formattedDay"
                    tick={{ fontSize: 11, fill: '#a1a1aa' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#a1a1aa' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<GlassTooltip />} />
                  <Area
                    type="monotone"
                    name="Gross Revenue"
                    dataKey="total"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#multiColorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Revenue Share Donut Chart (1 Col) */}
          <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-1">
                <PieChartIcon className="w-4 h-4 text-purple-500" />
                Platform Share
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Percentage split by app revenue
              </p>

              {platformShareData.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-zinc-400 text-xs">
                  No platform data
                </div>
              ) : (
                <div className="h-48 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={platformShareData}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={76}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {platformShareData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<DonutTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Custom Legend Chips */}
            <div className="space-y-1.5 border-t border-zinc-100 dark:border-zinc-800/80 pt-3 mt-2">
              {platformShareData.slice(0, 4).map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">{item.name}</span>
                  </div>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    {item.percentage}% ({Math.round(item.value / 1000)}k)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2: Day of Week Breakdown + Trip Volume vs Hours */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Day of Week Revenue Bar Chart */}
          <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  Day of Week Earnings
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Aggregate revenue generated by day of week
                </p>
              </div>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-500/20">
                Peak: {bestDay.day}
              </span>
            </div>

            {isLoading ? (
              <div className="h-56 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={dayOfWeekData} barSize={32} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" strokeOpacity={0.4} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: '#a1a1aa' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#a1a1aa' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<GlassTooltip />} />
                  <Bar dataKey="total" name="Revenue" radius={[8, 8, 0, 0]}>
                    {dayOfWeekData.map((entry) => (
                      <Cell
                        key={entry.day}
                        fill={entry.day === bestDay.day ? '#f59e0b' : '#6366f1'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Trips vs Hours Comparison Bar Chart */}
          <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  Trips vs Hours by App
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Comparison of completed rides against drive hours
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="h-56 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
            ) : volumeVsHoursData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-zinc-400 text-xs">
                No platform comparison data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={volumeVsHoursData} barSize={24} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" strokeOpacity={0.4} />
                  <XAxis
                    dataKey="platform"
                    tick={{ fontSize: 11, fill: '#a1a1aa' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#a1a1aa' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<GlassTooltip />} />
                  <Bar dataKey="rides" name="Completed Trips" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="hours" name="Drive Hours" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Platform Hourly Leaderboard Table */}
        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-500" />
                Platform Hourly Efficiency Leaderboard
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Comparison of earnings per hour across your registered platforms
              </p>
            </div>
          </div>

          {monthlyData.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              No platform earnings logged for this period
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-100 dark:border-zinc-800">
                    <th className="pb-3 pl-2">Rank</th>
                    <th className="pb-3">Platform</th>
                    <th className="pb-3">Gross Revenue</th>
                    <th className="pb-3">Trips</th>
                    <th className="pb-3">Hours Logged</th>
                    <th className="pb-3 text-right pr-2">Hourly Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {monthlyData.map((p, idx) => {
                    const color = p.color || '#6366f1'
                    return (
                      <tr key={p.platform} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3.5 pl-2 font-bold">
                          <span
                            className={`w-6 h-6 rounded-lg inline-flex items-center justify-center text-xs ${
                              idx === 0
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold'
                                : idx === 1
                                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                                : 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500'
                            }`}
                          >
                            #{idx + 1}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-2xs shrink-0"
                              style={{ backgroundColor: color }}
                            >
                              {p.platform.charAt(0).toUpperCase()}
                            </span>
                            <span className="font-semibold text-zinc-900 dark:text-white">
                              {p.platform}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 font-medium text-zinc-800 dark:text-zinc-200">
                          PKR {Number(p.total || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 text-zinc-600 dark:text-zinc-400">
                          {p.rides || 0} trips
                        </td>
                        <td className="py-3.5 text-zinc-600 dark:text-zinc-400">
                          {p.hours || 0} hrs
                        </td>
                        <td className="py-3.5 text-right pr-2 font-bold text-emerald-600 dark:text-emerald-400">
                          PKR {Number(p.per_hour || 0).toLocaleString()}/h
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
