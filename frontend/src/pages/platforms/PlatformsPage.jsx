import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPlatforms, deletePlatform, updatePlatform } from '@/services/api'
import PlatformCard from '@/components/platforms/PlatformCard'
import AddEditPlatformModal from '@/components/platforms/AddEditPlatformModal'
import DeletePlatformModal from '@/components/platforms/DeletePlatformModal'
import PageTransition from '@/components/shared/PageTransition'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Search,
  Layers,
  Car,
  Bike,
  Activity,
  Sparkles,
  Zap,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const POPULAR_SUGGESTIONS = [
  { name: 'InDrive', type: 'both', color: '#22c55e' },
  { name: 'Careem', type: 'both', color: '#10b981' },
  { name: 'Bykea', type: 'both', color: '#eab308' },
  { name: 'Yango', type: 'ride', color: '#f97316' },
  { name: 'Foodpanda', type: 'delivery', color: '#ec4899' },
  { name: 'Uber', type: 'ride', color: '#3b82f6' },
]

export default function PlatformsPage() {
  const [showModal, setShowModal] = useState(false)
  const [editingPlatform, setEditingPlatform] = useState(null)
  const [deletingPlatform, setDeletingPlatform] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  const queryClient = useQueryClient()

  // Fetch platforms
  const { data: platforms = [], isLoading } = useQuery({
    queryKey: ['platforms'],
    queryFn: getPlatforms,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deletePlatform,
    onSuccess: () => {
      queryClient.invalidateQueries(['platforms'])
      toast.success('Platform removed successfully')
      setDeletingPlatform(null)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete platform')
    },
  })

  // Toggle active mutation
  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => updatePlatform(id, { is_active }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['platforms'])
      toast.success(variables.is_active ? 'Platform activated' : 'Platform paused')
    },
    onError: () => {
      toast.error('Failed to update platform status')
    },
  })

  // Calculate overview metrics
  const stats = useMemo(() => {
    const total = platforms.length
    const active = platforms.filter((p) => p.is_active).length
    const rides = platforms.filter((p) => p.type === 'ride' || p.type === 'both').length
    const delivery = platforms.filter((p) => p.type === 'delivery' || p.type === 'both').length
    return { total, active, rides, delivery }
  }, [platforms])

  // Filter & Search platforms
  const filteredPlatforms = useMemo(() => {
    return platforms.filter((platform) => {
      const matchesSearch = platform.name.toLowerCase().includes(searchQuery.toLowerCase())
      if (!matchesSearch) return false
      if (activeFilter === 'active') return platform.is_active
      if (activeFilter === 'inactive') return !platform.is_active
      if (activeFilter === 'ride') return platform.type === 'ride' || platform.type === 'both'
      if (activeFilter === 'delivery') return platform.type === 'delivery' || platform.type === 'both'
      return true
    })
  }, [platforms, searchQuery, activeFilter])

  const openAddModal = (preset = null) => {
    if (preset) {
      setEditingPlatform({ ...preset, id: undefined })
    } else {
      setEditingPlatform(null)
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingPlatform(null)
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Hero Section Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 sm:p-8 shadow-2xl shadow-indigo-950/20">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-1/3 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-indigo-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Multi-App Management</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Work Platforms
              </h1>
              <p className="text-sm text-indigo-100/80 leading-relaxed">
                Connect and organize the ride-hailing and delivery services you work on. Enable or disable apps to streamline earnings tracking.
              </p>
            </div>

            <Button
              onClick={() => openAddModal()}
              className="rounded-2xl bg-white hover:bg-indigo-50 text-indigo-950 font-bold px-6 py-5 shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center gap-2 group shrink-0"
            >
              <Plus className="w-5 h-5 text-indigo-600 transition-transform duration-200 group-hover:rotate-90" />
              <span>Add Platform</span>
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Total Platforms',
              value: stats.total,
              sub: 'Registered services',
              icon: Layers,
              color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40',
            },
            {
              title: 'Active Platforms',
              value: stats.active,
              sub: 'Currently enabled',
              icon: Activity,
              color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
            },
            {
              title: 'Ride Hailing',
              value: stats.rides,
              sub: 'Passenger services',
              icon: Car,
              color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40',
            },
            {
              title: 'Delivery',
              value: stats.delivery,
              sub: 'Package & food',
              icon: Bike,
              color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
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
                <div className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                  {isLoading ? '...' : item.value}
                </div>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                  {item.sub}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Quick Add Suggestions (if less than 6 platforms) */}
        {!isLoading && platforms.length < 6 && (
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-medium text-zinc-700 dark:text-zinc-300">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Quick Add Popular Services:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {POPULAR_SUGGESTIONS.filter(
                (p) => !platforms.some((existing) => existing.name.toLowerCase() === p.name.toLowerCase())
              ).map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => openAddModal(preset)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-medium text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500 transition-all text-xs"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.color }} />
                  + {preset.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Platforms' },
              { id: 'active', label: 'Active' },
              { id: 'inactive', label: 'Paused' },
              { id: 'ride', label: 'Ride Hailing' },
              { id: 'delivery', label: 'Delivery' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeFilter === tab.id
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-60 shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search platforms..."
              className="pl-8 h-9 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:ring-1 focus:ring-zinc-400"
            />
          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 animate-pulse border border-zinc-200/60 dark:border-zinc-800"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredPlatforms.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-14 px-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 max-w-sm mx-auto shadow-xs"
          >
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                {searchQuery || activeFilter !== 'all'
                  ? 'No matching platforms'
                  : 'No platforms added yet'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {searchQuery || activeFilter !== 'all'
                  ? 'Try adjusting your search or category filter.'
                  : 'Add platforms like InDrive, Careem, or Bykea to get started.'}
              </p>
            </div>

            {!(searchQuery || activeFilter !== 'all') && (
              <div className="pt-1">
                <Button
                  onClick={() => openAddModal()}
                  className="rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium text-xs px-4 py-2"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add First Platform
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Platforms Grid */}
        {!isLoading && filteredPlatforms.length > 0 && (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlatforms.map((platform) => (
                <PlatformCard
                  key={platform.id}
                  platform={platform}
                  onEdit={() => {
                    setEditingPlatform(platform)
                    setShowModal(true)
                  }}
                  onDelete={() => setDeletingPlatform(platform)}
                  onToggle={() =>
                    toggleMutation.mutate({
                      id: platform.id,
                      is_active: !platform.is_active,
                    })
                  }
                />
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Modals */}
        <AddEditPlatformModal
          open={showModal}
          onClose={handleCloseModal}
          platform={editingPlatform}
        />

        <DeletePlatformModal
          open={Boolean(deletingPlatform)}
          onClose={() => setDeletingPlatform(null)}
          onConfirm={() => deletingPlatform && deleteMutation.mutate(deletingPlatform.id)}
          platform={deletingPlatform}
          isDeleting={deleteMutation.isPending}
        />
      </div>
    </PageTransition>
  )
}