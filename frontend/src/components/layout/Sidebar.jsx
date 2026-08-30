import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "lucide-react";

import {
  LayoutDashboard,
  TrendingUp,
  Fuel,
  MonitorSpeaker,
  BarChart2,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Gauge,
  Sparkles,
} from "lucide-react";
import useAuthStore from "@/store/authStore";

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/earnings", label: "Earnings", icon: TrendingUp },
  { to: "/history", label: "History", icon: ClipboardList },
  { to: "/platforms", label: "Platforms", icon: MonitorSpeaker },
  { to: "/analytics", label: "Analytics", icon: BarChart2 },
  { to: "/fuel", label: "Fuel Logs", icon: Fuel },
  { to: "/assistant", label: "AI Assistant", icon: Sparkles },
  { to: "/profile", label: "Profile", icon: User },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative flex flex-col h-screen bg-[#1e2d40] text-white
        flex-shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-4 px-5 py-5 border-b border-white/10">
        <div
          className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center
          justify-center flex-shrink-0"
        >
          <Gauge className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="text-lg font-bold tracking-tight leading-none flex items-center"
            >
              Rozi
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_LINKS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
               transition-all duration-150 group
               ${
                 isActive
                   ? "bg-indigo-500 text-white"
                   : "text-white/60 hover:bg-white/10 hover:text-white"
               }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* Bottom — logout + collapse */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
            font-medium text-white/60 hover:bg-white/10 hover:text-white
            transition-all duration-150"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
            font-medium text-white/60 hover:bg-white/10 hover:text-white
            transition-all duration-150"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 flex-shrink-0" />
          ) : (
            <ChevronLeft className="w-5 h-5 flex-shrink-0" />
          )}
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}

