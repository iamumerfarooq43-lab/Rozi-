import { motion } from "framer-motion";

export default function PlatformBreakdown({ platforms, totalEarnings }) {
  if (!platforms || platforms.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-400">
        <p className="text-sm">No platform data for this period</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {platforms.map((platform, index) => {
        const percentage =
          totalEarnings > 0
            ? ((platform.total / totalEarnings) * 100).toFixed(1)
            : 0;

        return (
          <motion.div
            key={platform.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            className="flex items-center gap-4"
          >
            {/* Color dot + name */}
            <div className="flex items-center gap-2 w-28 flex-shrink-0">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: platform.color }}
              />
              <span className="text-sm font-medium text-zinc-700 truncate">
                {platform.name}
              </span>
            </div>

            {/* Progress bar */}
            <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="h-full rounded-full"
                style={{ backgroundColor: platform.color }}
              />
            </div>

            {/* Stats */}
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-semibold text-zinc-900">
                PKR {Number(platform.total).toLocaleString()}
              </p>
              <p className="text-xs text-zinc-400">{percentage}%</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
