import { motion } from 'framer-motion'
import { Trash2, Edit3, Car, Bike, Layers } from 'lucide-react'

const TYPE_CONFIG = {
  ride: { label: 'Ride Hailing', icon: Car },
  delivery: { label: 'Delivery', icon: Bike },
  both: { label: 'Ride & Delivery', icon: Layers },
}

export default function PlatformCard({ platform, onDelete, onToggle, onEdit }) {
  const typeConfig = TYPE_CONFIG[platform.type] || TYPE_CONFIG.both
  const TypeIcon = typeConfig.icon
  const brandColor = platform.color || '#6366f1'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`relative rounded-2xl border p-5 transition-all duration-200 ${
        platform.is_active
          ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700'
          : 'bg-zinc-50/80 dark:bg-zinc-900/40 border-zinc-200/70 dark:border-zinc-800/60 opacity-75 hover:opacity-100'
      }`}
    >
      {/* Top Header: Brand Icon + Title + Active Toggle Switch */}
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-3">
          {/* Brand Initial Badge */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-xs shrink-0"
            style={{ backgroundColor: brandColor }}
          >
            {platform.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white text-base tracking-tight leading-tight">
              {platform.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              <TypeIcon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              <span>{typeConfig.label}</span>
            </div>
          </div>
        </div>

        {/* Minimal Toggle Switch */}
        <button
          type="button"
          onClick={onToggle}
          title={platform.is_active ? 'Click to pause platform' : 'Click to enable platform'}
          className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
            platform.is_active
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              platform.is_active ? 'bg-emerald-500' : 'bg-zinc-400'
            }`}
          />
          <span>{platform.is_active ? 'Active' : 'Paused'}</span>
        </button>
      </div>

      {/* Footer / Actions Bar */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-end gap-1.5">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
        >
          <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
          <span>Edit</span>
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </motion.div>
  )
}