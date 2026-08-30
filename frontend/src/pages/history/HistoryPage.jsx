import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEarnings, getPlatforms, deleteEarning } from '@/services/api'
import PageTransition from '@/components/shared/PageTransition'
import { exportToPDF, exportToCSV } from '@/utils/exportUtils'
import AddEarningModal from '@/components/earnings/AddEarningModal'
import DeleteEarningModal from '@/components/history/DeleteEarningModal'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table'
import {
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  FileText,
  FileSpreadsheet,
  Plus,
  Search,
  Wallet,
  Car,
  Clock,
  TrendingUp,
  FilterX,
  Sparkles,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function HistoryPage() {
  const [sorting, setSorting] = useState([{ id: 'date', desc: true }])
  const [platformFilter, setPlatformFilter] = useState('')
  const [dateRange, setDateRange] = useState('all') // all, week, month, 30days
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [deletingEarning, setDeletingEarning] = useState(null)

  const queryClient = useQueryClient()

  // Fetch earnings log
  const { data: earnings = [], isLoading } = useQuery({
    queryKey: ['earnings'],
    queryFn: () => getEarnings(),
  })

  // Fetch platforms list
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
      toast.error(err.response?.data?.message || 'Failed to delete record')
    },
  })

  // Date Range Filtering Logic
  const filteredEarnings = useMemo(() => {
    return earnings.filter((item) => {
      // Platform check
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

  // Summary KPIs Calculation
  const stats = useMemo(() => {
    const totalAmount = filteredEarnings.reduce((acc, curr) => acc + Number(curr.gross_amount || 0), 0)
    const totalRides = filteredEarnings.reduce((acc, curr) => acc + Number(curr.ride_count || 0), 0)
    const totalHours = filteredEarnings.reduce((acc, curr) => acc + Number(curr.hours_worked || 0), 0)
    const avgHourly = totalHours > 0 ? totalAmount / totalHours : 0
    return { totalAmount, totalRides, totalHours, avgHourly }
  }, [filteredEarnings])

  // Table Columns Definition
  const columns = useMemo(
    () => [
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ getValue }) => {
          const val = getValue()
          if (!val) return '—'
          const date = new Date(val)
          return (
            <div className="font-medium text-zinc-900 dark:text-white whitespace-nowrap">
              {date.toLocaleDateString('en-PK', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </div>
          )
        },
      },
      {
        accessorKey: 'platform_name',
        header: 'Platform',
        cell: ({ row }) => {
          const name = row.original.platform_name || 'Platform'
          const color = row.original.platform_color || '#6366f1'
          return (
            <div className="flex items-center gap-2">
              <span
                className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-2xs shrink-0"
                style={{ backgroundColor: color }}
              >
                {name.charAt(0).toUpperCase()}
              </span>
              <span className="font-semibold text-zinc-900 dark:text-white">
                {name}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: 'gross_amount',
        header: 'Amount',
        cell: ({ getValue }) => (
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            PKR {Number(getValue() || 0).toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: 'ride_count',
        header: 'Rides',
        cell: ({ getValue }) => {
          const val = getValue()
          return val ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {val} trips
            </span>
          ) : (
            <span className="text-zinc-400">—</span>
          )
        },
      },
      {
        accessorKey: 'hours_worked',
        header: 'Hours',
        cell: ({ getValue }) => {
          const val = getValue()
          return val ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
              {val} hrs
            </span>
          ) : (
            <span className="text-zinc-400">—</span>
          )
        },
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        cell: ({ getValue }) => {
          const val = getValue()
          return val ? (
            <span className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs truncate block" title={val}>
              {val}
            </span>
          ) : (
            <span className="text-zinc-400">—</span>
          )
        },
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => setDeletingEarning(row.original)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"
            title="Delete log entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: filteredEarnings,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  const hasActiveFilters = Boolean(platformFilter || searchQuery || dateRange !== 'all')

  const resetFilters = () => {
    setPlatformFilter('')
    setSearchQuery('')
    setDateRange('all')
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Hero Banner Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 sm:p-8 shadow-2xl shadow-indigo-950/20">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-1/3 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-indigo-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Financial Ledger</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Earnings History
              </h1>
              <p className="text-sm text-indigo-100/80 leading-relaxed">
                Complete timeline of your ride-hailing and delivery payouts. Filter, analyze, and export your income reports.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Button
                onClick={() => setShowAddModal(true)}
                className="rounded-2xl bg-white hover:bg-indigo-50 text-indigo-950 font-bold px-5 py-5 shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Log Earning</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => exportToPDF(filteredEarnings)}
                className="rounded-2xl bg-white/10 hover:bg-white/20 border-white/20 text-white font-medium px-4 py-5 text-xs backdrop-blur-md flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-red-400" />
                PDF
              </Button>

              <Button
                variant="outline"
                onClick={() => exportToCSV(filteredEarnings)}
                className="rounded-2xl bg-white/10 hover:bg-white/20 border-white/20 text-white font-medium px-4 py-5 text-xs backdrop-blur-md flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Total Earnings',
              value: `PKR ${stats.totalAmount.toLocaleString()}`,
              sub: `${filteredEarnings.length} log entries`,
              icon: Wallet,
              color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
            },
            {
              title: 'Total Rides',
              value: stats.totalRides.toLocaleString(),
              sub: 'Trips completed',
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
              title: 'Avg Hourly Rate',
              value: `PKR ${Math.round(stats.avgHourly).toLocaleString()}`,
              sub: 'Per hour average',
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

        {/* Filter & Search Bar */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Date Range Quick Filters */}
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
              {/* Platform Selector */}
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
                  placeholder="Search logs..."
                  className="pl-8 h-9 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:ring-1 focus:ring-zinc-400"
                />
              </div>
            </div>
          </div>

          {/* Reset Filters Tag */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 pt-1 text-xs">
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
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 animate-pulse border border-zinc-200/50 dark:border-zinc-800"
              />
            ))}
          </div>
        )}

        {/* Data Table */}
        {!isLoading && (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                {/* Table Header */}
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          onClick={header.column.getToggleSortingHandler()}
                          className={`px-4 py-3.5 select-none ${
                            header.column.getCanSort() ? 'cursor-pointer hover:text-zinc-900 dark:hover:text-white' : ''
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && (
                              header.column.getIsSorted() === 'asc' ? (
                                <ChevronUp className="w-3.5 h-3.5 text-indigo-500" />
                              ) : header.column.getIsSorted() === 'desc' ? (
                                <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
                              ) : (
                                <ChevronsUpDown className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600" />
                              )
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="px-4 py-16 text-center text-zinc-400">
                        <div className="max-w-xs mx-auto space-y-2">
                          <Calendar className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto" />
                          <p className="font-semibold text-zinc-700 dark:text-zinc-300">No earnings found</p>
                          <p className="text-xs text-zinc-400">
                            {hasActiveFilters
                              ? 'Try adjusting your search query or reset active filters.'
                              : 'Start logging your daily ride earnings.'}
                          </p>
                          {!hasActiveFilters && (
                            <Button
                              onClick={() => setShowAddModal(true)}
                              className="mt-2 rounded-xl bg-indigo-600 text-white font-medium text-xs px-4 py-2"
                            >
                              <Plus className="w-3.5 h-3.5 mr-1" />
                              Log Earning
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-4 py-3.5">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {table.getRowModel().rows.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-3">
                  <span>
                    Page <strong className="text-zinc-900 dark:text-white">{table.getState().pagination.pageIndex + 1}</strong> of{' '}
                    <strong className="text-zinc-900 dark:text-white">{table.getPageCount()}</strong> · {filteredEarnings.length} total entries
                  </span>

                  {/* Rows per page */}
                  <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                    className="h-7 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-2 text-xs text-zinc-700 dark:text-zinc-300"
                  >
                    {[10, 25, 50].map((pageSize) => (
                      <option key={pageSize} value={pageSize}>
                        Show {pageSize}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="h-8 rounded-lg text-xs border-zinc-200 dark:border-zinc-800"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="h-8 rounded-lg text-xs border-zinc-200 dark:border-zinc-800"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <AddEarningModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
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
