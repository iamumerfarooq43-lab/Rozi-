import { useState, useRef } from "react";
import AvatarUploadMenu from "@/components/shared/AvatarUploadMenu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAvatar,
} from "@/services/api";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import PageTransition from "@/components/shared/PageTransition";
import useAuthStore from "@/store/authStore";
import {
  Camera,
  Star,
  TrendingUp,
  Shield,
  CheckCircle,
  XCircle,
  Calendar,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Schemas ───────────────────────────────────────────────
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  age: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─── Tier config ───────────────────────────────────────────
const TIER_STYLES = {
  bronze: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  silver: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  gold: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  platinum: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
};

const TIER_ICONS = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
  platinum: "💎",
};

// ─── Reusable glass input ───────────────────────────────────
const GlassInput = ({ label, error, ...props }) => (
  <div className="space-y-1.5">
    {label && (
      <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
        {label}
      </label>
    )}
    <input
      {...props}
      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10
        text-white placeholder:text-white/20 text-sm focus:outline-none
        focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50
        transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    />
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

// ─── Glass card wrapper ─────────────────────────────────────
const GlassCard = ({ children, className = "" }) => (
  <div
    className={`bg-white/5 backdrop-blur-md border border-white/10
    rounded-2xl p-6 ${className}`}
  >
    {children}
  </div>
);

// ─── Section title ──────────────────────────────────────────
const SectionTitle = ({ children }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="h-px flex-1 bg-white/10" />
    <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">
      {children}
    </p>
    <div className="h-px flex-1 bg-white/10" />
  </div>
);

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // ─── Fetch profile ──────────────────────────────────────
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  // ─── Profile form ───────────────────────────────────────
  const {
    register: regProfile,
    handleSubmit: handleProfile,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    values: {
      name: profile?.name || "",
      phone: profile?.phone || "",
      age: profile?.age ? String(profile.age) : "",
    },
  });

  // ─── Password form ──────────────────────────────────────
  const {
    register: regPassword,
    handleSubmit: handlePassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({ resolver: zodResolver(passwordSchema) });

  // ─── Mutations ──────────────────────────────────────────
  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["profile"]);
      setUser(data);
      toast.success("Profile updated");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Update failed");
    },
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Password changed");
      resetPassword();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Password change failed");
    },
  });

  const avatarMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["profile"]);
      setUser({ ...profile, profile_picture: data.profile_picture });
      toast.success("Profile picture updated");
      setAvatarPreview(null);
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message || err.message || "Failed to upload image",
      ),
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: deleteAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries(["profile"]);
      setUser({ ...profile, profile_picture: null });
      toast.success("Profile picture removed");
    },
    onError: () => toast.error("Failed to remove image"),
  });

  // ─── Handlers ───────────────────────────────────────────
  const onProfileSubmit = (data) => {
    profileMutation.mutate({
      name: data.name,
      phone: data.phone || null,
      age: data.age ? Number(data.age) : null,
    });
  };

  const onPasswordSubmit = (data) => {
    passwordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  const handleAvatarFile = (file) => {
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("avatar", file);
    avatarMutation.mutate(formData);
  };

  // ─── Loading ────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        className="min-h-screen rounded-2xl p-6 space-y-4"
        style={{
          background:
            "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e2d40 100%)",
        }}
      >
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  const avatarSrc = avatarPreview || profile?.profile_picture || null;
  const tier = profile?.tier || "bronze";

  return (
    <PageTransition>
      {/* ── Deep indigo background ── */}
      <div
        className="min-h-screen rounded-2xl p-6 space-y-5"
        style={{
          background:
            "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e2d40 100%)",
        }}
      >
        {/* ── Page heading ── */}
        <div>
          <h1 className="text-xl font-bold text-white">Captain Profile</h1>
          <p className="text-sm text-white/40 mt-0.5">
            Manage your personal information and account settings
          </p>
        </div>

        {/* ── Profile header card ── */}
        <div
          className="rounded-2xl border border-white/10 shadow-2xl"
          style={{ position: "relative" }}
        >
          {/* Animated gradient banner */}
          <div
            className="h-36 rounded-t-2xl"
            style={{
              background:
                "linear-gradient(270deg, #6366f1, #8b5cf6, #ec4899, #6366f1)",
              backgroundSize: "300% 300%",
              animation: "gradientShift 6s ease infinite",
            }}
          >
            {/* Subtle pattern overlay */}
            <div
              className="absolute inset-0 rounded-t-2xl opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            />
          </div>

          {/* Avatar — sits between banner and info, outside both */}
          <div className="absolute left-8" style={{ top: "80px", zIndex: 10 }}>
            <div className="relative">
              <div
                className="w-30 h-30 rounded-full border-4 border-[#1e1b4b]
        overflow-hidden bg-indigo-900 flex items-center justify-center shadow-xl"
              >
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-indigo-300">
                    {profile?.name?.charAt(0).toUpperCase() || "C"}
                  </span>
                )}
              </div>

              <AvatarUploadMenu
                onFileSelected={handleAvatarFile}
                onDelete={() => deleteAvatarMutation.mutate()}
                hasAvatar={!!profile?.profile_picture}
                disabled={
                  avatarMutation.isPending || deleteAvatarMutation.isPending
                }
              >
                <button
                  type="button"
                  disabled={
                    avatarMutation.isPending || deleteAvatarMutation.isPending
                  }
                  className="absolute bottom-0 right-0 w-7 h-7 bg-indigo-500
          hover:bg-indigo-400 rounded-full flex items-center justify-center
          shadow-lg transition-colors border-2 border-[#1e1b4b]"
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
                </button>
              </AvatarUploadMenu>
            </div>
          </div>

          {/* Info below banner */}
          <div className="bg-white/5 backdrop-blur-md rounded-b-2xl pt-16 pb-6 px-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-white">
                    {profile?.name}
                  </h2>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full
            border ${TIER_STYLES[tier]}`}
                  >
                    {TIER_ICONS[tier]}{" "}
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-white/40 mb-3">{profile?.email}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {profile?.is_active ? (
                    <span
                      className="flex items-center gap-1.5 text-xs font-medium
              text-green-400 bg-green-500/10 border border-green-500/20
              px-2.5 py-1 rounded-full"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Account Active
                    </span>
                  ) : (
                    <span
                      className="flex items-center gap-1.5 text-xs font-medium
              text-red-400 bg-red-500/10 border border-red-500/20
              px-2.5 py-1 rounded-full"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Account Inactive
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-xs text-white/30">
                    <Calendar className="w-3.5 h-3.5" />
                    Member since{" "}
                    {new Date(profile?.created_at).toLocaleDateString("en-PK", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Performance stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Rating */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Star className="w-4 h-4 text-yellow-400" />
              </div>
              <p className="text-xs font-medium text-white/50">Rating</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {Number(profile?.rating || 0).toFixed(1)}
            </p>
            <div className="flex items-center gap-0.5 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.round(profile?.rating || 0)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-white/10 fill-white/10"
                  }`}
                />
              ))}
            </div>
          </GlassCard>

          {/* Acceptance Rate */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-xs font-medium text-white/50">
                Acceptance Rate
              </p>
            </div>
            <p className="text-2xl font-bold text-white">
              {Number(profile?.acceptance_rate || 0).toFixed(1)}%
            </p>
            <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-400 rounded-full transition-all duration-500"
                style={{ width: `${profile?.acceptance_rate || 0}%` }}
              />
            </div>
          </GlassCard>

          {/* Captain Tier */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-xs font-medium text-white/50">Captain Tier</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {TIER_ICONS[tier]} {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </p>
            <p className="text-xs text-white/30 mt-1">
              {tier === "bronze" && "Complete 100 rides to reach Silver"}
              {tier === "silver" && "Complete 500 rides to reach Gold"}
              {tier === "gold" && "Complete 1000 rides to reach Platinum"}
              {tier === "platinum" && "You have reached the highest tier!"}
            </p>
          </GlassCard>
        </div>

        {/* ── Personal info form ── */}
        <GlassCard>
          <SectionTitle>Personal Information</SectionTitle>
          <form
            onSubmit={handleProfile(onProfileSubmit)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <GlassInput
              label="Full Name"
              placeholder="Muhammad Ali"
              error={profileErrors.name?.message}
              {...regProfile("name")}
            />

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                Email Address
              </label>
              <input
                value={profile?.email || ""}
                disabled
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10
                  text-white/30 text-sm cursor-not-allowed"
              />
              <p className="text-xs text-white/20">Email cannot be changed</p>
            </div>

            <GlassInput
              label="Phone Number"
              placeholder="03XX-XXXXXXX"
              {...regProfile("phone")}
            />

            <GlassInput
              label="Age"
              type="number"
              placeholder="25"
              {...regProfile("age")}
            />

            <div className="sm:col-span-2 flex justify-end pt-2">
              <button
                type="submit"
                disabled={profileMutation.isPending}
                className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400
                  disabled:opacity-50 text-white font-semibold rounded-xl
                  transition-all duration-150 text-sm"
              >
                {profileMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </GlassCard>

        {/* ── Change password form ── */}
        <GlassCard>
          <SectionTitle>
            <Lock className="w-3.5 h-3.5 inline mr-1.5 opacity-60" />
            Change Password
          </SectionTitle>
          <form
            onSubmit={handlePassword(onPasswordSubmit)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div className="sm:col-span-2">
              <GlassInput
                label="Current Password"
                type="password"
                placeholder="••••••••"
                error={passwordErrors.currentPassword?.message}
                {...regPassword("currentPassword")}
              />
            </div>

            <GlassInput
              label="New Password"
              type="password"
              placeholder="••••••••"
              error={passwordErrors.newPassword?.message}
              {...regPassword("newPassword")}
            />

            <GlassInput
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              error={passwordErrors.confirmPassword?.message}
              {...regPassword("confirmPassword")}
            />

            <div className="sm:col-span-2 flex justify-end pt-2">
              <button
                type="submit"
                disabled={passwordMutation.isPending}
                className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400
                  disabled:opacity-50 text-white font-semibold rounded-xl
                  transition-all duration-150 text-sm"
              >
                {passwordMutation.isPending ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
