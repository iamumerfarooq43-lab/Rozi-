import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Gauge } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import useAuthStore from "@/store/authStore";
import api from "@/services/api";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", data);
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/google", {
        idToken: credentialResponse.credential,
      });
      login(res.data.data, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Google sign-in failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Full screen rider photo */}
      <img
        src="/rider.jpg"
        alt="Rider"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Thin border overlay */}
      <div className="absolute inset-3 border border-white/30 rounded-2xl pointer-events-none z-10" />

      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Glassmorphism form — right side */}
      <div className="absolute inset-0 flex items-center justify-end pr-16 z-20">
        <div
          className="w-full max-w-sm bg-white/10 backdrop-blur-md border
          border-white/20 rounded-2xl p-8 shadow-2xl"
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div
              className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center
              justify-center"
            >
              <Gauge className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">Rozi</p>
              <p className="text-white/50 text-xs leading-tight">
                Earnings Tracker
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-white/60 text-sm mt-1">
              Sign in to track your daily rozi
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/80">
                Email Address
              </label>
              <input
                type="email"
                placeholder="captain@example.com"
                {...register("email")}
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border
                  border-white/20 text-white placeholder:text-white/30 text-sm
                  focus:outline-none focus:ring-2 focus:ring-indigo-400
                  focus:border-transparent transition-all"
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/80">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border
                    border-white/20 text-white placeholder:text-white/30 text-sm
                    focus:outline-none focus:ring-2 focus:ring-indigo-400
                    focus:border-transparent transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                    text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div
                className="bg-red-500/20 border border-red-500/30 rounded-lg
                px-3 py-2"
              >
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600
                disabled:opacity-60 text-white font-semibold rounded-xl
                transition-all duration-150 text-sm mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/20" />
            <span className="text-white/40 text-xs">OR</span>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          {/* Google Sign-In */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() =>
                setError("Google sign-in failed. Please try again.")
              }
              theme="filled_black"
              shape="pill"
              size="large"
              width="320"
            />
          </div>

          {/* Register link */}
          <p className="text-center text-white/50 text-xs mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-indigo-400 hover:text-indigo-300 font-medium
                transition-colors"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
