import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEarnings, deleteEarning, getPlatforms } from '@/services/api'
import EarningCard from '@/components/earnings/EarningCard'
import AddEarningModal from '@/components/earnings/AddEarningModal'
import DeleteEarningModal from '@/components/history/DeleteEarningModal'
import PageTransition from '@/components/shared/PageTransition'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Wallet,
  Car,
  Clock,
  TrendingUp,
  Search,
  FilterX,
  Sparkles,
  Receipt,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function EarningsPage() {
  const [showModal, setShowModal] = useState(false)
  const [deletingEarning, setDeletingEarning] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [platformFilter, setPlatformFilter] = useState('')
  const [dateRange, setDateRange] = useState('all') // all, week, month, 30days

  const queryClient = useQueryClient()

  // Fetch earnings
  const { data: earnings = [], isLoading } = useQuery({
    queryKey: ['earnings'],
    queryFn: () => getEarnings(),
  })

  // Fetch platforms
  const { data: platforms = [] } = useQuery({
    queryKey: ['platforms'],
    queryFn: getPlatforms,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteEarning,
    onSuccess: () => {
      queryClient.invalidateQueries(['earnings'])
      queryClient.invalidateQueries(['dashboard-summary'])
      toast.success('Earning log removed successfully')
      setDeletingEarning(null)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete earning log')
    },
  })

  // Filter earnings
  const filteredEarnings = useMemo(() => {
    return earnings.filter((item) => {
      // Platform filter
      if (platformFilter && String(item.platform_id) !== platformFilter) {
        return false
      }

      // Search query check
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchPlatform = item.platform_name?.toLowerCase().includes(q)
        const matchNotes = item.notes?.toLowerCase().includes(q)
        const matchDate = item.date?.includes(q)
        const matchAmount = String(item.gross_amount).includes(q)
        if (!matchPlatform && !matchNotes && !matchDate && !matchAmount) {
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
  }, [earnings, platformFilter, searchQuery, dateRange])

  // Overview Statistics
  const stats = useMemo(() => {
    const totalAmount = filteredEarnings.reduce((acc, curr) => acc + Number(curr.gross_amount || 0), 0)
    const totalRides = filteredEarnings.reduce((acc, curr) => acc + Number(curr.ride_count || 0), 0)
    const totalHours = filteredEarnings.reduce((acc, curr) => acc + Number(curr.hours_worked || 0), 0)
    const avgPerRide = totalRides > 0 ? totalAmount / totalRides : 0
    return { totalAmount, totalRides, totalHours, avgPerRide }
  }, [filteredEarnings])

  const hasActiveFilters = Boolean(platformFilter || searchQuery || dateRange !== 'all')

  const resetFilters = () => {
    setPlatformFilter('')
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
                <span>Daily Revenue Tracker</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Earnings
              </h1>
              <p className="text-sm text-indigo-100/80 leading-relaxed">
                Log and track your daily payouts, trips, and work hours across all ride-hailing and delivery services.
              </p>
            </div>

            <Button
              onClick={() => setShowModal(true)}
              className="rounded-2xl bg-white hover:bg-indigo-50 text-indigo-950 font-bold px-6 py-5 shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center gap-2 group shrink-0"
            >
              <Plus className="w-5 h-5 text-indigo-600 transition-transform duration-200 group-hover:rotate-90" />
              <span>Add Earning</span>
            </Button>
          </div>
        </div>

        {/* Overview Stats Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Total Revenue',
              value: `PKR ${stats.totalAmount.toLocaleString()}`,
              sub: `${filteredEarnings.length} entries`,
              icon: Wallet,
              color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
            },
            {
              title: 'Total Rides',
              value: stats.totalRides.toLocaleString(),
              sub: 'Completed trips',
              icon: Car,
              color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40',
            },
            {
              title: 'Hours Worked',
              value: `${stats.totalHours.toLocaleString()} hrs`,
              sub: 'Total drive time',
              icon: Clock,
              color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
            },
            {
              title: 'Avg per Ride',
              value: `PKR ${Math.round(stats.avgPerRide).toLocaleString()}`,
              sub: 'Per trip average',
              icon: TrendingUp,
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

        {/* Filter & Search Controls Bar */}
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

            {/* Platform & Search Controls */}
            <div className="flex items-center gap-2">
              {/* Platform Filter */}
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 shrink-0"
              >
                <option value="">All Platforms</option>
                {platforms.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name}
                  </option>
                ))}
              </select>

              {/* Search Box */}
              <div className="relative w-full md:w-56 shrink-0">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search earnings..."
                  className="pl-8 h-9 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:ring-1 focus:ring-zinc-400"
                />
              </div>
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
        {!isLoading && filteredEarnings.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-14 px-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 max-w-sm mx-auto shadow-xs"
          >
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
              <Receipt className="w-6 h-6 text-zinc-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                {hasActiveFilters ? 'No matching earnings found' : 'No earnings logged yet'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {hasActiveFilters
                  ? 'Try adjusting your search query or reset active filters.'
                  : 'Start tracking your daily income by logging your first trip payout.'}
              </p>
            </div>

            {!hasActiveFilters && (
              <div className="pt-1">
                <Button
                  onClick={() => setShowModal(true)}
                  className="rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium text-xs px-4 py-2"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add First Earning
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Earnings Card List */}
        {!isLoading && filteredEarnings.length > 0 && (
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {filteredEarnings.map((earning) => (
                <EarningCard
                  key={earning.id}
                  earning={earning}
                  onDelete={() => setDeletingEarning(earning)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Modals */}
        <AddEarningModal
          open={showModal}
          onClose={() => setShowModal(false)}
          platforms={platforms}
        />

        <DeleteEarningModal
          open={Boolean(deletingEarning)}
          onClose={() => setDeletingEarning(null)}
          onConfirm={() => deletingEarning && deleteMutation.mutate(deletingEarning.id)}
          earning={deletingEarning}
          isDeleting={deleteMutation.isPending}
        />
      </div>
    </PageTransition>
  )
}
