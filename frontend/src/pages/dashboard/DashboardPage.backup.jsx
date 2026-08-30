import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDashboardSummary,
  getWeeklyAnalytics,
  getEarnings,
  deleteEarning,
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
import { TrendingUp, Fuel, Wallet, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddEarningModal from "@/components/earnings/AddEarningModal";
import { useQuery as usePlatformsQuery } from "@tanstack/react-query";
import { getPlatforms } from "@/services/api";

const RANGES = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
];

// Animated count-up number — counts from its previous value to the new one
const CountUp = ({ value }) => {
  const ref = useRef(null);
  const prevValue = useRef(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const controls = animate(prevValue.current, value, {
      duration: 0.6,
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

// Custom tooltip — refined with accent bar + softer shadow
const LineTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-zinc-100 rounded-xl px-3.5 py-2.5 shadow-lg shadow-zinc-200/50 text-sm flex items-center gap-2.5">
      <span className="w-1.5 h-8 rounded-full bg-indigo-500 flex-shrink-0" />
      <div>
        <p className="text-zinc-400 text-xs mb-0.5">{label}</p>
        <p className="font-semibold text-zinc-900">
          PKR {Number(payload[0].value).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// Summary card — now with a subtle hover lift
const SummaryCard = ({ title, amount, icon: Icon, color, bgColor, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
    whileHover={{ y: -3, transition: { duration: 0.2 } }}
    className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm
      hover:shadow-md hover:border-zinc-300 transition-shadow duration-200 cursor-default"
  >
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-medium text-zinc-500">{title}</p>
      <motion.div
        whileHover={{ scale: 1.08, rotate: 3 }}
        transition={{ duration: 0.2 }}
        className={`w-9 h-9 rounded-lg flex items-center justify-center ${bgColor}`}
      >
        <Icon className={`w-4 h-4 ${color}`} />
      </motion.div>
    </div>
    <p className="text-2xl font-bold text-zinc-900">
      <CountUp value={Number(amount)} />
    </p>
  </motion.div>
);

export default function DashboardPage() {
  const [range, setRange] = useState("month");
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  // Queries
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
    onSuccess: () => queryClient.invalidateQueries(["earnings"]),
  });

  // Format weekly data for chart
  const formattedWeekly = weeklyData.map((d) => ({
    ...d,
    day: new Date(d.day).toLocaleDateString("en-PK", {
      month: "short",
      day: "numeric",
    }),
  }));

  // Show only last 5 earnings in recent table
  const recentFive = recentEarnings.slice(0, 5);

  const cards = [
    {
      title: "Gross Earnings",
      amount: summary?.totalEarnings ?? 0,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Fuel Cost",
      amount: summary?.totalFuel ?? 0,
      icon: Fuel,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Net Profit",
      amount: summary?.netProfit ?? 0,
      icon: Wallet,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Welcome back — here's your earnings overview
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Range toggle — sliding pill indicator */}
          <div className="relative flex items-center gap-1 bg-zinc-100 rounded-lg p-1">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`relative z-10 px-3 py-1.5 text-sm rounded-md font-medium transition-colors duration-150
                  ${
                    range === r.value
                      ? "text-zinc-900"
                      : "text-zinc-500 hover:text-zinc-700"
                  }`}
              >
                {range === r.value && (
                  <motion.span
                    layoutId="rangePill"
                    className="absolute inset-0 bg-white rounded-md shadow-sm -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {r.label}
              </button>
            ))}
          </div>

          {/* Add earning button */}
          <Button onClick={() => setShowModal(true)} size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Log Earning
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summaryLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl skeleton-shimmer" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cards.map((card, index) => (
            <SummaryCard key={card.title} {...card} index={index} />
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart — takes 2/3 width */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">
            Daily Earnings — Last 30 Days
          </h2>
          {weeklyLoading ? (
            <div className="h-48 skeleton-shimmer rounded-lg" />
          ) : formattedWeekly.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-zinc-400 text-sm">
              No data for the past 30 days
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={formattedWeekly}>
                <defs>
                  <linearGradient
                    id="earningsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f4f4f5"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: "#a1a1aa" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#a1a1aa" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={<LineTooltip />}
                  cursor={{ stroke: "#e4e4e7", strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#earningsGradient)"
                  dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#ffffff" }}
                  animationDuration={600}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Platform Breakdown — takes 1/3 width */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">
            Platform Breakdown
          </h2>
          {summaryLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-6 skeleton-shimmer rounded" />
              ))}
            </div>
          ) : !summary?.platforms?.length ? (
            <div className="flex items-center justify-center h-40 text-zinc-400 text-sm">
              No platform data
            </div>
          ) : (
            <div className="space-y-4">
              {summary.platforms.map((p, i) => {
                const pct =
                  summary.totalEarnings > 0
                    ? ((p.total / summary.totalEarnings) * 100).toFixed(1)
                    : 0;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ x: 2 }}
                    className="rounded-lg -mx-1.5 px-1.5 py-1 transition-colors duration-150 hover:bg-zinc-50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: p.color }}
                        />
                        <span className="text-xs font-medium text-zinc-700">
                          {p.name}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-500">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, delay: i * 0.08 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      PKR {Number(p.total).toLocaleString()}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Earnings Table */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <h2 className="text-sm font-semibold text-zinc-900">
            Recent Earnings
          </h2>
          <a
            href="/history"
            className="text-xs text-indigo-500 hover:text-indigo-600 font-medium"
          >
            View all →
          </a>
        </div>

        {earningsLoading ? (
          <div className="p-5 space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 skeleton-shimmer rounded-lg" />
            ))}
          </div>
        ) : recentFive.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 text-sm">
            No earnings yet — log your first earning above
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr>
                {["Date", "Platform", "Amount", "Rides", "Hours", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold
                    text-zinc-500 uppercase tracking-wide"
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
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.06 }}
                  className="hover:bg-zinc-50 transition-colors duration-150"
                >
                  <td className="px-5 py-3 text-zinc-600">
                    {new Date(earning.date).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: earning.platform_color }}
                      />
                      <span className="text-zinc-700 font-medium">
                        {earning.platform_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-zinc-900">
                    PKR {Number(earning.gross_amount).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-zinc-500">
                    {earning.ride_count || "—"}
                  </td>
                  <td className="px-5 py-3 text-zinc-500">
                    {earning.hours_worked ? `${earning.hours_worked}h` : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => deleteMutation.mutate(earning.id)}
                      className="text-zinc-300 hover:text-red-500 hover:scale-110 transition-all duration-150"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
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
