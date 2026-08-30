import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import useThemeStore from "@/store/themeStore";
import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "./components/shared/ProtectedRoute.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import DashboardPage from "./pages/dashboard/DashboardPage.jsx";
import PlatformsPage from "@/pages/platforms/PlatformsPage";
import EarningsPage from "@/pages/earnings/EarningsPage";
import FuelPage from "@/pages/fuel/FuelPage";
import HistoryPage from "@/pages/history/HistoryPage";
import AnalyticsPage from "@/pages/analytics/AnalyticsPage";
import ProfilePage from "@/pages/profile/ProfilePage";
import AssistantPage from "@/pages/assistant/AssistantPage";

function App() {
  const initTheme = useThemeStore((state) => state.initTheme);

  useEffect(() => {
    initTheme();
  }, []);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#ffffff",
            color: "#18181b",
            border: "1px solid #e4e4e7",
            borderRadius: "8px",
            fontSize: "14px",
          },
        }}
      />
      <Routes>
        {/* Public routes — no layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes — wrapped in AppLayout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/earnings"
          element={
            <ProtectedRoute>
              <AppLayout>
                <EarningsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <AppLayout>
                <HistoryPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/platforms"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PlatformsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AnalyticsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/fuel"
          element={
            <ProtectedRoute>
              <AppLayout>
                <FuelPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/assistant"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AssistantPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;
