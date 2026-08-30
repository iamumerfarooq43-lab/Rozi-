import { motion } from "framer-motion";

export default function SummaryCard({
  title,
  amount,
  subtitle,
  icon: Icon,
  color,
  index,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-zinc-500">{title}</p>
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-zinc-900">
        PKR {Number(amount).toLocaleString()}
      </p>
      {subtitle && <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>}
    </motion.div>
  );
}
