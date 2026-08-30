import { useRef, useEffect } from 'react'
import { Trash2, Droplets, Gauge, FileText } from 'lucide-react'
import { motion, animate } from 'framer-motion'

// Animated count-up for amount
function CountUp({ value }) {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const controls = animate(0, value, {
      duration: 0.4,
      ease: 'easeOut',
      onUpdate(latest) {
        node.textContent = `PKR ${Math.round(latest).toLocaleString()}`
      },
    })
    return () => controls.stop()
  }, [value])

  return <span ref={ref}>PKR 0</span>
}

export default function FuelCard({ log, onDelete }) {
  const formattedDate = log.date
    ? new Date(log.date).toLocaleDateString('en-PK', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : ''

  const pricePerLiter =
    log.liters && log.amount ? Math.round(Number(log.amount) / Number(log.liters)) : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Amber Fuel Icon + Title + Date */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Droplets className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-zinc-900 dark:text-white text-base tracking-tight leading-tight truncate">
              Fuel Refuel
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Right: Amount & Delete Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <p className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400 tabular-nums">
            <CountUp value={Number(log.amount || 0)} />
          </p>

          <button
            type="button"
            onClick={onDelete}
            title="Delete fuel log"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Details Row: Volume, Rate, Notes */}
      {(log.liters > 0 || pricePerLiter || log.notes) && (
        <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          {log.liters > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium">
              <Droplets className="w-3 h-3 text-amber-500" />
              {log.liters} Liters
            </span>
          )}

          {pricePerLiter && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
              <Gauge className="w-3 h-3 text-zinc-400" />
              PKR {pricePerLiter}/L
            </span>
          )}

          {log.notes && (
            <span className="inline-flex items-center gap-1 italic text-zinc-500 dark:text-zinc-400 truncate max-w-xs">
              <FileText className="w-3 h-3 text-zinc-400 shrink-0" />
              <span className="truncate">{log.notes}</span>
            </span>
          )}
        </div>
      )}
    </motion.div>
  )
}
