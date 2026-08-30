import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  BellRing,
  ChevronDown,
  User,
  LogOut,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Volume2,
  VolumeX,
  Menu,
  Gauge,
} from "lucide-react";
import useAuthStore from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProfile,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  uploadAvatar,
  deleteAvatar,
} from "@/services/api";
import AvatarUploadMenu from "@/components/shared/AvatarUploadMenu";
import toast from "react-hot-toast";
import { playSound, isSoundEnabled, setSoundEnabled } from "@/utils/sound";

// Words to cycle through in the center brand animation — English then Urdu
const BRAND_WORDS = [
  { text: "Rozi", dir: "ltr" },
  { text: "روزی", dir: "rtl" },
];

// Container controls the stagger timing between each letter
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

// Each letter slides in from its "reading direction" — left for English,
// right for Urdu — so the word appears to type itself in the correct flow
const letterVariants = {
  hidden: (dir) => ({ opacity: 0, x: dir === "rtl" ? 8 : -8 }),
  visible: { opacity: 1, x: 0, transition: { duration: 0.25 } },
};

// Cycles "Rozi" (English) / "روزی" (Urdu), typing out letter by letter
// in each word's natural reading direction, then crossfades to the next
function AnimatedBrand() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % BRAND_WORDS.length);
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  const current = BRAND_WORDS[index];
  const letters = Array.from(current.text);

  return (
    <div
      className="relative h-6 flex items-center overflow-hidden"
      style={{ minWidth: "90px", transform: "translateX(14px)" }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current.text}
          dir={current.dir}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          variants={containerVariants}
          className={`absolute flex ${
            current.dir === "rtl" ? "flex-row-reverse" : "flex-row"
          }`}
        >
          {letters.map((ch, i) => (
            <motion.span
              key={i}
              custom={current.dir}
              variants={letterVariants}
              className={`font-bold text-zinc-900 ${
                current.dir === "rtl"
                  ? "text-base font-urdu leading-none"
                  : "text-xl tracking-tight font-brand"
              }`}
            >
              {ch}
            </motion.span>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Helper to determine notification color scheme & dynamic icon based on context
export function getNotificationDetails(notification) {
  const text = `${notification?.title || ""} ${notification?.message || ""}`.toLowerCase();
  
  if (
    text.includes("success") ||
    text.includes("earned") ||
    text.includes("payout") ||
    text.includes("complete") ||
    text.includes("added")
  ) {
    return {
      Icon: CheckCircle2,
      badgeBg: "bg-emerald-500/10 text-emerald-600 ring-4 ring-emerald-500/10",
      accentGradient: "from-emerald-500 via-teal-500 to-cyan-500",
      btnGradient: "from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/25",
      label: "Success",
    };
  }
  if (
    text.includes("warning") ||
    text.includes("alert") ||
    text.includes("fuel") ||
    text.includes("expense") ||
    text.includes("high")
  ) {
    return {
      Icon: AlertTriangle,
      badgeBg: "bg-amber-500/10 text-amber-600 ring-4 ring-amber-500/10",
      accentGradient: "from-amber-500 via-orange-500 to-rose-500",
      btnGradient: "from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-500/25",
      label: "Alert",
    };
  }
  if (
    text.includes("ai") ||
    text.includes("assistant") ||
    text.includes("insight") ||
    text.includes("report") ||
    text.includes("rozi")
  ) {
    return {
      Icon: Sparkles,
      badgeBg: "bg-purple-500/10 text-purple-600 ring-4 ring-purple-500/10",
      accentGradient: "from-purple-500 via-indigo-500 to-pink-500",
      btnGradient: "from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/25",
      label: "AI Insight",
    };
  }
  return {
    Icon: BellRing,
    badgeBg: "bg-indigo-500/10 text-indigo-600 ring-4 ring-indigo-500/10",
    accentGradient: "from-indigo-500 via-violet-500 to-purple-500",
    btnGradient: "from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-500/25",
    label: "Notification",
  };
}

// Centered modal shown when a notification is clicked — premium modern UI with vibrant gradient header
function NotificationModal({ notification, onClose }) {
  if (!notification) return null;

  const { Icon, badgeBg, accentGradient, btnGradient, label } = getNotificationDetails(notification);

  const formattedDate = new Date(notification.created_at || Date.now()).toLocaleString(
    "en-PK",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-md px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 16 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-zinc-100 overflow-hidden"
        >
          {/* Top dynamic gradient accent line */}
          <div className={`h-2.5 bg-gradient-to-r ${accentGradient}`} />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center
              rounded-full bg-zinc-100/80 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-800 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-6 sm:p-7 text-center">
            {/* Animated Icon badge with glowing aura */}
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 20,
              }}
              className={`w-16 h-16 mx-auto mb-3 rounded-2xl ${badgeBg} flex items-center justify-center shadow-sm`}
            >
              <Icon className="w-8 h-8" />
            </motion.div>

            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              {label}
            </span>

            {/* Notification Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-3 leading-snug tracking-tight">
              {notification.title}
            </h2>

            {/* Message Box */}
            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 mb-4 text-left">
              <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                {notification.message}
              </p>
            </div>

            {/* Timestamp Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-zinc-100 text-zinc-500 text-xs font-medium mb-6">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>{formattedDate}</span>
            </div>

            {/* Got It Button */}
            <div>
              <button
                onClick={onClose}
                className={`w-full py-3 rounded-2xl bg-gradient-to-r ${btnGradient}
                  text-white text-sm font-semibold transition-all shadow-md active:scale-[0.98] cursor-pointer`}
              >
                Got it
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Topbar({ onToggleMobileSidebar }) {
  const { user, logout, setUser } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [time, setTime] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notifCoords, setNotifCoords] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const handleToggleSound = (e) => {
    e.stopPropagation();
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
    if (next) playSound("pop");
  };

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const userName = profile?.name || user?.name || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 22) return "Good evening";
    return "Welcome back";
  };
  const greeting = getGreeting();

  const { data: notifData } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 30000,
  });

  const unreadCount = notifData?.unreadCount || 0;
  const notifications = notifData?.notifications || [];
  const prevUnreadRef = useRef(0);

  useEffect(() => {
    if (notifData && unreadCount > prevUnreadRef.current) {
      playSound("notification");
    }
    prevUnreadRef.current = unreadCount;
  }, [notifData, unreadCount]);

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      toast.success("All notifications marked as read");
    },
    onError: () => toast.error("Failed to mark all as read"),
  });

  const handleMarkAllRead = () => {
    markAllMutation.mutate();
  };

  // ─── Avatar upload mutation ───
  const avatarMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["profile"]);
      setUser({ ...profile, profile_picture: data.profile_picture });
      toast.success("Profile picture updated");
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message || err.message || "Failed to upload image",
      ),
  });

  // ─── Avatar delete mutation ───
  const deleteAvatarMutation = useMutation({
    mutationFn: deleteAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries(["profile"]);
      setUser({ ...profile, profile_picture: null });
      toast.success("Profile picture removed");
    },
    onError: () => toast.error("Failed to remove image"),
  });

  const handleAvatarFile = (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    avatarMutation.mutate(formData);
  };

  // Live clock — updates every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const formattedDate = time.toLocaleDateString("en-PK", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <header
        className="relative h-14 bg-white border-b border-zinc-200 flex items-center
        justify-between px-3 sm:px-6 flex-shrink-0 z-40"
      >
        {/* Left — Hamburger button on mobile OR Live Clock on desktop */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 -ml-1 rounded-xl text-zinc-700 hover:text-indigo-600 hover:bg-zinc-100 transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile Brand Logo (Beside Hamburger Button) */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Gauge className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm tracking-tight text-zinc-900">
              Rozi
            </span>
          </div>

          {/* Desktop Live Clock (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-semibold text-zinc-800 tabular-nums">
              {formattedTime}
            </span>
            <span className="text-zinc-300 mx-1">|</span>
            <span className="text-sm text-zinc-500">{formattedDate}</span>
          </div>
        </div>

        {/* Center — Animated app name (Only on md+ tablets/desktops to prevent any mobile collision) */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 pointer-events-none">
          <AnimatedBrand />
        </div>

        {/* Right — Bell + User dropdown */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                playSound("pop");
                setNotifOpen(!notifOpen);
              }}
              className="relative p-2 rounded-xl hover:bg-zinc-100/80 transition-all duration-150 active:scale-95 cursor-pointer group"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-zinc-600 group-hover:text-indigo-600 transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotifOpen(false)}
                />
                <div className="fixed right-2 sm:right-6 top-14 w-[calc(100vw-1rem)] sm:w-84 max-w-sm bg-white border border-zinc-200/90 rounded-2xl shadow-2xl z-50 overflow-hidden font-sans">
                  {/* Top gradient bar */}
                  <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                  {/* Header */}
                  <div className="flex justify-between items-center px-4 py-3 bg-zinc-50/70 border-b border-zinc-100">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-800 tracking-tight">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold bg-indigo-50 text-indigo-600 border border-indigo-200/60 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Sound toggle button */}
                      <button
                        onClick={handleToggleSound}
                        title={soundOn ? "Mute notification sound" : "Enable notification sound"}
                        className="p-1 text-zinc-400 hover:text-indigo-600 rounded-lg hover:bg-zinc-100 transition-colors"
                      >
                        {soundOn ? (
                          <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                        ) : (
                          <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
                        )}
                      </button>

                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notification Items List */}
                  <div className="max-h-84 overflow-y-auto divide-y divide-zinc-100">
                    {notifications.length === 0 ? (
                      <div className="py-10 px-6 text-center">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-indigo-50 text-indigo-400 flex items-center justify-center">
                          <BellRing className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-semibold text-zinc-700">No notifications yet</p>
                        <p className="text-xs text-zinc-400 mt-1">We'll alert you when new updates arrive.</p>
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const { Icon, badgeBg } = getNotificationDetails(n);
                        return (
                          <div
                            key={n.id}
                            onClick={() => {
                              playSound("pop");
                              setSelectedNotification(n);
                              setNotifOpen(false);
                              if (!n.is_read) {
                                markNotificationRead(n.id)
                                  .then(() =>
                                    queryClient.invalidateQueries({
                                      queryKey: ["notifications"],
                                    })
                                  )
                                  .catch(() => {});
                              }
                            }}
                            className={`flex items-start gap-3 px-4 py-3 text-sm cursor-pointer transition-all duration-150 ${
                              !n.is_read
                                ? "bg-indigo-50/40 border-l-4 border-l-indigo-600 hover:bg-indigo-50/70"
                                : "hover:bg-zinc-50 border-l-4 border-l-transparent"
                            }`}
                          >
                            {/* Dynamic Icon Badge */}
                            <div className={`w-9 h-9 rounded-xl ${badgeBg} flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs`}>
                              <Icon className="w-4.5 h-4.5" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <p className={`text-xs sm:text-sm font-semibold truncate ${!n.is_read ? "text-zinc-900" : "text-zinc-700"}`}>
                                  {n.title}
                                </p>
                                {!n.is_read && (
                                  <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-zinc-500 text-xs mt-0.5 line-clamp-2 leading-snug font-normal">
                                {n.message}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg
              hover:bg-zinc-100 transition-colors duration-150"
            >
              {/* Avatar — with upload/delete menu */}
              <AvatarUploadMenu
                onFileSelected={handleAvatarFile}
                onDelete={() => deleteAvatarMutation.mutate()}
                hasAvatar={!!profile?.profile_picture}
                disabled={
                  avatarMutation.isPending || deleteAvatarMutation.isPending
                }
              >
                <div
                  className="w-8 h-8 rounded-full overflow-hidden bg-indigo-600 shadow-sm ring-2 ring-indigo-500/20
                  flex items-center justify-center text-white text-xs font-bold flex-shrink-0 cursor-pointer"
                >
                  {profile?.profile_picture ? (
                    <img
                      src={profile.profile_picture}
                      alt={userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{userInitial}</span>
                  )}
                </div>
              </AvatarUploadMenu>

              {/* Name + Greeting */}
              <div className="text-left hidden sm:block">
                <p className="text-[11px] font-medium text-zinc-400 leading-none mb-0.5">
                  {greeting}, 👋
                </p>
                <p className="text-sm font-semibold text-zinc-800 leading-tight truncate max-w-[140px]">
                  {userName}
                </p>
              </div>

              <ChevronDown className="w-4 h-4 text-zinc-400" />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="fixed right-6 top-14 w-52 bg-white border border-zinc-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-zinc-100">
                      <p className="text-sm font-semibold text-zinc-800 truncate">
                        {userName}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5 truncate">
                        {user?.email || profile?.email || ""}
                      </p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate("/profile");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                      text-zinc-700 hover:bg-zinc-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-zinc-400" />
                        Profile
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                      text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
          </div>
        </div>
      </header>

      <NotificationModal
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />
    </>
  );
}
