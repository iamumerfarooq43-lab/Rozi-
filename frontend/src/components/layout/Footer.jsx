import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPlatforms, getEarnings, getFuelLogs } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";

function formatTimeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── Dashboard: platforms active + last earning logged ───────
function DashboardFooterContent() {
  const { data: platforms = [] } = useQuery({
    queryKey: ["platforms"],
    queryFn: getPlatforms,
  });
  const { data: earnings = [] } = useQuery({
    queryKey: ["earnings"],
    queryFn: () => getEarnings(),
  });
  const lastEarning = earnings[0];

  return (
    <span>
      {platforms.length} platform{platforms.length !== 1 ? "s" : ""} active
      {lastEarning && <> · Last earning logged {formatTimeAgo(lastEarning.date)}</>}
    </span>
  );
}

// ─── Earnings: entry count + total ─────────────────────────────
function EarningsFooterContent() {
  const { data: earnings = [] } = useQuery({
    queryKey: ["earnings"],
    queryFn: () => getEarnings(),
  });
  const total = earnings.reduce((sum, e) => sum + Number(e.gross_amount), 0);

  return (
    <span>
      {earnings.length} entr{earnings.length !== 1 ? "ies" : "y"} this list · Total PKR{" "}
      {total.toLocaleString()}
    </span>
  );
}

// ─── Fuel Logs: log count + avg price/liter ────────────────────
function FuelFooterContent() {
  const { data: fuelLogs = [] } = useQuery({
    queryKey: ["fuel-logs"],
    queryFn: () => getFuelLogs(),
  });
  const logsWithLiters = fuelLogs.filter((l) => l.liters && Number(l.liters) > 0);
  const totalLiters = logsWithLiters.reduce((sum, l) => sum + Number(l.liters), 0);
  const totalSpent = logsWithLiters.reduce((sum, l) => sum + Number(l.amount), 0);
  const avgPrice = totalLiters > 0 ? totalSpent / totalLiters : 0;

  return (
    <span>
      {fuelLogs.length} log{fuelLogs.length !== 1 ? "s" : ""} recorded
      {avgPrice > 0 && <> · Avg price PKR {avgPrice.toFixed(0)}/liter</>}
    </span>
  );
}

// ─── History: full dataset totals (page itself shows filtered/paginated view) ─
function HistoryFooterContent() {
  const { data: earnings = [] } = useQuery({
    queryKey: ["earnings"],
    queryFn: () => getEarnings(),
  });
  const total = earnings.reduce((sum, e) => sum + Number(e.gross_amount), 0);

  return (
    <span>
      {earnings.length} record{earnings.length !== 1 ? "s" : ""} on file · Lifetime total PKR{" "}
      {total.toLocaleString()}
    </span>
  );
}

const DEFAULT_CONTENT = () => <span>Rozi — Earnings Tracker for Captains</span>;

// Map each route to its footer content component
const ROUTE_CONTENT = {
  "/dashboard": DashboardFooterContent,
  "/earnings": EarningsFooterContent,
  "/fuel": FuelFooterContent,
  "/history": HistoryFooterContent,
};

export default function Footer() {
  const location = useLocation();
  const Content = ROUTE_CONTENT[location.pathname] || DEFAULT_CONTENT;

  return (
    <footer
      className="h-9 flex-shrink-0 border-t border-zinc-200/90 bg-zinc-100/95 px-6
        flex items-center justify-between text-xs text-zinc-600 font-medium"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <Content />
        </motion.div>
      </AnimatePresence>
      <span className="text-zinc-400 hidden sm:inline font-semibold tracking-wide text-[11px]">
        Rozi Platform
      </span>
    </footer>
  );
}

