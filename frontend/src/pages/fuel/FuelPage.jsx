import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFuelLogs, deleteFuelLog } from '@/services/api'
import FuelCard from '@/components/fuel/FuelCard'
import AddFuelModal from '@/components/fuel/AddFuelModal'
import DeleteFuelModal from '@/components/fuel/DeleteFuelModal'
import PageTransition from '@/components/shared/PageTransition'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Fuel,
  Receipt,
  Gauge,
  Search,
  FilterX,
  Sparkles,
  Droplets,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function FuelPage() {
  const [showModal, setShowModal] = useState(false)
  const [deletingLog, setDeletingLog] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState('all') // all, week, month, 30days

  const queryClient = useQueryClient()

  // Fetch fuel logs
  const { data: fuelLogs = [], isLoading } = useQuery({
    queryKey: ['fuel-logs'],
    queryFn: () => getFuelLogs(),
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteFuelLog,
    onSuccess: () => {
      queryClient.invalidateQueries(['fuel-logs'])
      queryClient.invalidateQueries(['dashboard-summary'])
      toast.success('Fuel log removed successfully')
      setDeletingLog(null)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete fuel log')
    },
  })

  // Filter fuel logs by date range & search query
  const filteredFuelLogs = useMemo(() => {
    return fuelLogs.filter((item) => {
      // Search query check
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchNotes = item.notes?.toLowerCase().includes(q)
        const matchDate = item.date?.includes(q)
        const matchAmount = String(item.amount).includes(q)
        const matchLiters = String(item.liters).includes(q)
        if (!matchNotes && !matchDate && !matchAmount && !matchLiters) {
          return false
        }
      }

      // Date Range Check
      if (dateRange !== 'all') {
        const itemDate = new Date(item.date)
        const now = new Date()

        if (dateRange === 'week') {
          const startOfWeek = new Date(now)
          const day = startOfWeek.getDay()
          const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
          startOfWeek.setDate(diff)
          startOfWeek.setHours(0, 0, 0, 0)
          if (itemDate < startOfWeek) return false
        } else if (dateRange === 'month') {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          if (itemDate < startOfMonth) return false
        } else if (dateRange === '30days') {
          const thirtyDaysAgo = new Date(now)
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          thirtyDaysAgo.setHours(0, 0, 0, 0)
          if (itemDate < thirtyDaysAgo) return false
        }
      }

      return true
    })
  }, [fuelLogs, searchQuery, dateRange])

  // Overview Statistics
  const stats = useMemo(() => {
    const totalSpent = filteredFuelLogs.reduce((sum, l) => sum + Number(l.amount || 0), 0)
    const count = filteredFuelLogs.length

    const logsWithLiters = filteredFuelLogs.filter((l) => l.liters && Number(l.liters) > 0)
    const totalLiters = logsWithLiters.reduce((sum, l) => sum + Number(l.liters || 0), 0)
    const totalSpentOnLiters = logsWithLiters.reduce((sum, l) => sum + Number(l.amount || 0), 0)
    const avgPricePerLiter = totalLiters > 0 ? totalSpentOnLiters / totalLiters : 0

    return { totalSpent, count, totalLiters, avgPricePerLiter }
  }, [filteredFuelLogs])

  const hasActiveFilters = Boolean(searchQuery || dateRange !== 'all')

  const resetFilters = () => {
    setSearchQuery('')
    setDateRange('all')
  }

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
                <span>Expense & Fuel Ledger</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Fuel Logs
              </h1>
              <p className="text-sm text-indigo-100/80 leading-relaxed">
                Log your fuel receipts and liters to accurately calculate your net earnings and fuel efficiency.
              </p>
            </div>

            <Button
              onClick={() => setShowModal(true)}
              className="rounded-2xl bg-white hover:bg-indigo-50 text-indigo-950 font-bold px-6 py-5 shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center gap-2 group shrink-0"
            >
              <Plus className="w-5 h-5 text-indigo-600 transition-transform duration-200 group-hover:rotate-90" />
              <span>Add Fuel Log</span>
            </Button>
          </div>
        </div>

        {/* Overview Stats Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Total Fuel Spent',
              value: `PKR ${stats.totalSpent.toLocaleString()}`,
              sub: `${stats.count} refuels recorded`,
              icon: Fuel,
              color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40',
            },
            {
              title: 'Total Liters Filled',
              value: stats.totalLiters > 0 ? `${stats.totalLiters.toFixed(1)} L` : '—',
              sub: 'Cumulative volume',
              icon: Droplets,
              color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
            },
            {
              title: 'Avg Price / Liter',
              value: stats.avgPricePerLiter > 0 ? `PKR ${Math.round(stats.avgPricePerLiter)}/L` : '—',
              sub: 'Average fuel rate',
              icon: Gauge,
              color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
            },
            {
              title: 'Total Refuels',
              value: stats.count,
              sub: 'Recorded receipts',
              icon: Receipt,
              color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40',
            },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
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
                <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                  {isLoading ? '...' : item.value}
                </div>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                  {item.sub}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Filter & Search Bar */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Date Range Selector Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {[
                { id: 'all', label: 'All Time' },
                { id: 'week', label: 'This Week' },
                { id: 'month', label: 'This Month' },
                { id: '30days', label: 'Last 30 Days' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDateRange(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    dateRange === tab.id
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold'
                      : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-60 shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fuel logs..."
                className="pl-8 h-9 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:ring-1 focus:ring-zinc-400"
              />
            </div>
          </div>

          {/* Reset Filters Tag */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-400">Filters active:</span>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
              >
                <FilterX className="w-3 h-3 text-red-500" />
                <span>Reset Filters</span>
              </button>
            </div>
          )}
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 animate-pulse border border-zinc-200/50 dark:border-zinc-800"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredFuelLogs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-14 px-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 max-w-sm mx-auto shadow-xs"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Fuel className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                {hasActiveFilters ? 'No matching fuel logs found' : 'No fuel logs recorded yet'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {hasActiveFilters
                  ? 'Try adjusting your search query or reset active filters.'
                  : 'Start tracking fuel expenses to calculate accurate net earnings.'}
              </p>
            </div>

            {!hasActiveFilters && (
              <div className="pt-1">
                <Button
                  onClick={() => setShowModal(true)}
                  className="rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium text-xs px-4 py-2"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add First Fuel Log
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Fuel Card List */}
        {!isLoading && filteredFuelLogs.length > 0 && (
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {filteredFuelLogs.map((log) => (
                <FuelCard
                  key={log.id}
                  log={log}
                  onDelete={() => setDeletingLog(log)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Modals */}
        <AddFuelModal open={showModal} onClose={() => setShowModal(false)} />

        <DeleteFuelModal
          open={Boolean(deletingLog)}
          onClose={() => setDeletingLog(null)}
          onConfirm={() => deletingLog && deleteMutation.mutate(deletingLog.id)}
          log={deletingLog}
          isDeleting={deleteMutation.isPending}
        />
      </div>
    </PageTransition>
  )
}
