import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  Fuel,
  Sparkles,
  Menu,
} from "lucide-react";
import { playSound } from "@/utils/sound";

export default function MobileBottomNav({ onOpenDrawer }) {
  const navItems = [
    { to: "/dashboard", label: "Home", icon: LayoutDashboard },
    { to: "/earnings", label: "Earnings", icon: TrendingUp },
    { to: "/fuel", label: "Fuel", icon: Fuel },
    { to: "/assistant", label: "AI Bot", icon: Sparkles, highlight: true },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-zinc-200/90 z-40 md:hidden shadow-lg shadow-zinc-900/10">
      <div className="flex items-center justify-around h-14 px-1 max-w-md mx-auto">
        {navItems.map(({ to, label, icon: Icon, highlight }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => playSound("pop")}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full py-1 transition-all ${
                isActive
                  ? "text-indigo-600 font-bold"
                  : "text-zinc-500 hover:text-zinc-800 font-medium"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`relative p-1 rounded-xl transition-transform ${
                    isActive ? "scale-110" : ""
                  } ${
                    highlight && !isActive
                      ? "text-indigo-500"
                      : ""
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">{label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* 5th Tab: Full Menu Drawer Trigger */}
        <button
          type="button"
          onClick={() => {
            playSound("pop");
            onOpenDrawer();
          }}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-zinc-500 hover:text-zinc-800 font-medium transition-all"
        >
          <div className="p-1 rounded-xl">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">More</span>
        </button>
      </div>
    </div>
  );
}
