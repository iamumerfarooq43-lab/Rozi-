import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  getDashboardSummary,
  getWeeklyAnalytics,
  getEarnings,
  deleteEarning,
  getProfile,
} from "@/services/api";
import { motion, animate } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Fuel,
  Wallet,
  Trash2,
  Plus,
  ArrowUpRight,
  Sparkles,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AddEarningModal from "@/components/earnings/AddEarningModal";
import { useQuery as usePlatformsQuery } from "@tanstack/react-query";
import { getPlatforms } from "@/services/api";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";

const RANGES = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
];

// Animated count-up number
const CountUp = ({ value }) => {
  const ref = useRef(null);
  const prevValue = useRef(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const controls = animate(prevValue.current, value, {
      duration: 0.5,
      ease: "easeOut",
      onUpdate(latest) {
        node.textContent = `PKR ${Math.round(latest).toLocaleString()}`;
      },
    });

    prevValue.current = value;
    return () => controls.stop();
  }, [value]);

  return <span ref={ref}>PKR 0</span>;
};

// Compact Chart Tooltip
const LineTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val = Number(payload[0].value);
  return (
    <div className="bg-white/95 backdrop-blur-md border border-zinc-200/80 rounded-lg px-2.5 py-1.5 shadow-md text-[11px] flex items-center gap-2">
      <div className="w-1.5 h-6 rounded-full bg-indigo-600 flex-shrink-0" />
      <div>
        <p className="text-zinc-400 text-[9px] font-medium mb-0.2">{label}</p>
        <p className="font-bold text-zinc-900 text-xs">
          PKR {val.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// Ultra-Compact Summary Card
const SummaryCard = ({
  title,
  amount,
  subtitle,
  badgeText,
  badgeColor,
  icon: Icon,
  color,
  bgColor,
  borderColor,
  index,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25, delay: index * 0.04 }}
    whileHover={{ y: -1, transition: { duration: 0.15 } }}
    className={`relative overflow-hidden bg-white border ${borderColor || "border-zinc-200"} rounded-lg p-3 shadow-2xs hover:shadow-xs transition-all duration-150 cursor-default group`}
  >
    {/* Top accent bar */}
    <div className={`absolute top-0 left-0 right-0 h-0.5 ${bgColor.replace("bg-", "bg-gradient-to-r from-").replace("-100", "-500 to-indigo-500")}`} />

    <div className="flex items-center justify-between mb-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
        {title}
      </span>
      <div className={`w-7 h-7 rounded-md flex items-center justify-center ${bgColor} shadow-2xs`}>
        <Icon className={`w-3.5 h-3.5 ${color}`} />
      </div>
    </div>

    <div className="flex items-baseline justify-between gap-1.5 mt-0.5">
      <p className="text-lg sm:text-xl font-extrabold text-zinc-900 tracking-tight">
        <CountUp value={Number(amount)} />
      </p>
      {badgeText && (
        <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold ${badgeColor}`}>
          {badgeText}
        </span>
      )}
    </div>

    {subtitle && (
      <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1 font-medium">
        {subtitle}
      </p>
    )}
  </motion.div>
);

export default function DashboardPage() {
  const [range, setRange] = useState("month");
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Queries
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["dashboard", range],
    queryFn: () => getDashboardSummary(range),
  });

  const { data: weeklyData = [], isLoading: weeklyLoading } = useQuery({
    queryKey: ["analytics-weekly"],
    queryFn: getWeeklyAnalytics,
  });

  const { data: recentEarnings = [], isLoading: earningsLoading } = useQuery({
    queryKey: ["earnings"],
    queryFn: () => getEarnings(),
  });

  const { data: platforms = [] } = usePlatformsQuery({
    queryKey: ["platforms"],
    queryFn: getPlatforms,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEarning,
    onSuccess: () => {
      queryClient.invalidateQueries(["earnings"]);
      queryClient.invalidateQueries(["dashboard"]);
      toast.success("Earning record deleted");
    },
    onError: () => toast.error("Failed to delete record"),
  });

  const userName = profile?.name || user?.name || "Captain";

  // Format weekly data for chart
  const formattedWeekly = weeklyData.map((d) => ({
    ...d,
    day: new Date(d.day).toLocaleDateString("en-PK", {
      month: "short",
      day: "numeric",
    }),
  }));

  const recentFive = recentEarnings.slice(0, 5);

  const gross = summary?.totalEarnings ?? 0;
  const fuel = summary?.totalFuel ?? 0;
  const net = summary?.netProfit ?? 0;

  const profitMargin =
    gross > 0 ? ((net / gross) * 100).toFixed(0) : "0";

  const cards = [
    {
      title: "Gross Earnings",
      amount: gross,
      subtitle: "Total income before expenses",
      badgeText: "+Live Sync",
      badgeColor: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100/70",
      borderColor: "hover:border-emerald-300",
    },
    {
      title: "Fuel Expense",
      amount: fuel,
      subtitle: "Logged fuel expenditures",
      badgeText: fuel > 0 ? "Tracked" : "No logs",
      badgeColor: "bg-amber-50 text-amber-700 border border-amber-200/60",
      icon: Fuel,
      color: "text-amber-600",
      bgColor: "bg-amber-100/70",
      borderColor: "hover:border-amber-300",
    },
    {
      title: "Net Profit",
      amount: net,
      subtitle: `Earnings after fuel expenses`,
      badgeText: gross > 0 ? `${profitMargin}% margin` : "0% margin",
      badgeColor: "bg-indigo-50 text-indigo-700 border border-indigo-200/60",
      icon: Wallet,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100/70",
      borderColor: "hover:border-indigo-300",
    },
  ];

  return (
    <div className="space-y-3.5 max-w-6xl mx-auto">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-zinc-900 tracking-tight">
              Dashboard
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Welcome back, <span className="font-semibold text-zinc-800">{userName}</span> — performance summary
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Range toggle */}
          <div className="relative flex items-center gap-0.5 bg-zinc-100/80 p-0.5 rounded-lg border border-zinc-200/60">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`relative z-10 px-2 py-0.5 text-xs rounded font-medium transition-colors duration-150
                  ${
                    range === r.value
                      ? "text-zinc-900 font-semibold"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
              >
                {range === r.value && (
                  <motion.span
                    layoutId="rangePill"
                    className="absolute inset-0 bg-white rounded shadow-2xs -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                {r.label}
              </button>
            ))}
          </div>

          {/* Add earning button */}
          <Button
            onClick={() => setShowModal(true)}
            size="sm"
            className="h-7.5 text-xs px-2.5 shadow-2xs transition-shadow"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Log Earning
          </Button>
        </div>
      </div>

      {/* Ultra-Compact Summary Cards */}
      {summaryLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg skeleton-shimmer" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {cards.map((card, index) => (
            <SummaryCard key={card.title} {...card} index={index} />
          ))}
        </div>
      )}

      {/* Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Area Chart — 2/3 width */}
        <div className="lg:col-span-2 bg-white border border-zinc-200/90 rounded-lg p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-zinc-900">
                Daily Earnings Trend
              </h2>
              <p className="text-[10px] text-zinc-400 mt-0.2">
                Past 30 days
              </p>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-medium bg-indigo-50/70 px-1.5 py-0.5 rounded">
              <Calendar className="w-3 h-3" />
              <span>30 Days</span>
            </div>
          </div>

          {weeklyLoading ? (
            <div className="h-36 skeleton-shimmer rounded" />
          ) : formattedWeekly.length === 0 ? (
            <div className="h-36 flex flex-col items-center justify-center text-zinc-400 text-xs">
              <p className="font-medium">No earnings recorded in 30 days</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">Log your shifts to unlock detailed analytics</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={formattedWeekly} margin={{ top: 4, right: 4, left: -26, bottom: 0 }}>
                <defs>
                  <linearGradient
                    id="earningsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f4f4f5"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 9, fill: "#a1a1aa" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "#a1a1aa" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={<LineTooltip />}
                  cursor={{ stroke: "#c7d2fe", strokeWidth: 1, strokeDasharray: "3 3" }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#earningsGradient)"
                  dot={{ r: 2.5, fill: "#6366f1", strokeWidth: 1, stroke: "#ffffff" }}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: "#ffffff" }}
                  animationDuration={600}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Platform Breakdown — 1/3 width */}
        <div className="bg-white border border-zinc-200/90 rounded-lg p-3 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs sm:text-sm font-bold text-zinc-900">
              Platform Share
            </h2>
            <span className="text-[10px] text-zinc-400 font-medium">By Earnings</span>
          </div>

          {summaryLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 skeleton-shimmer rounded" />
              ))}
            </div>
          ) : !summary?.platforms?.length ? (
            <div className="flex flex-col items-center justify-center h-32 text-zinc-400 text-xs">
              <p className="font-medium">No platform data</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">Shares will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {summary.platforms.map((p, i) => {
                const pct =
                  summary.totalEarnings > 0
                    ? ((p.total / summary.totalEarnings) * 100).toFixed(1)
                    : 0;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="p-1.5 rounded bg-zinc-50/50 border border-zinc-100 hover:bg-zinc-50 transition-all duration-150"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: p.color }}
                        />
                        <span className="text-[11px] font-semibold text-zinc-800">
                          {p.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded">
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1 bg-zinc-200/60 rounded-full overflow-hidden mb-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, delay: i * 0.04 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                    </div>
                    <p className="text-[10px] font-medium text-zinc-500 text-right">
                      PKR {Number(p.total).toLocaleString()}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Ultra-Compact Recent Earnings Table */}
      <div className="bg-white border border-zinc-200/90 rounded-lg shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-100">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-zinc-900">
              Recent Earnings Log
            </h2>
            <p className="text-[10px] text-zinc-400">
              Latest ride shifts and platform payouts
            </p>
          </div>
          <Link
            to="/history"
            className="inline-flex items-center gap-0.5 text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
          >
            <span>View all</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {earningsLoading ? (
          <div className="p-3 space-y-1.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 skeleton-shimmer rounded" />
            ))}
          </div>
        ) : recentFive.length === 0 ? (
          <div className="py-6 text-center text-zinc-400 text-xs">
            <p className="font-medium text-zinc-700">No recent earnings found</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">Log an entry to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-zinc-50/80 border-b border-zinc-100">
                <tr>
                  {["Date", "Platform", "Amount", "Rides", "Hours", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left text-[10px] font-bold
                      text-zinc-400 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {recentFive.map((earning, i) => (
                  <motion.tr
                    key={earning.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: i * 0.03 }}
                    className="hover:bg-zinc-50/80 transition-colors duration-150"
                  >
                    <td className="px-3 py-2 text-zinc-700 font-medium">
                      {new Date(earning.date).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-3 py-2">
                      <div className="inline-flex items-center gap-1 bg-zinc-100/70 border border-zinc-200/60 px-2 py-0.2 rounded-full">
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: earning.platform_color }}
                        />
                        <span className="text-[10px] font-semibold text-zinc-800">
                          {earning.platform_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 font-bold text-zinc-900">
                      PKR {Number(earning.gross_amount).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-zinc-600 font-medium">
                      {earning.ride_count ? `${earning.ride_count} rides` : "—"}
                    </td>
                    <td className="px-3 py-2 text-zinc-600 font-medium">
                      {earning.hours_worked ? `${earning.hours_worked} hrs` : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this earning entry?")) {
                            deleteMutation.mutate(earning.id);
                          }
                        }}
                        className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all duration-150"
                        title="Delete Earning"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Earning Modal */}
      <AddEarningModal
        open={showModal}
        onClose={() => setShowModal(false)}
        platforms={platforms}
      />
    </div>
  );
}
