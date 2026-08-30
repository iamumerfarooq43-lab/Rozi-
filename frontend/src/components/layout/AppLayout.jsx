import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";
import FloatingAiBot from "./FloatingAiBot";
import MobileBottomNav from "./MobileBottomNav";
import { useQueryClient } from "@tanstack/react-query";
import { requestNotificationPermission } from "../../utils/requestNotificationPermission";
import { messaging, onMessage } from "../../firebase.js";

export default function AppLayout({ children }) {
  const queryClient = useQueryClient();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground message:", payload);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      // Show a real OS notification even when the page is technically still open
      if (Notification.permission === "granted") {
        const { title, body } = payload.notification;
        new Notification(title, { body, icon: "/icon-192.png" });
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans">
      {/* Sidebar: Handles both desktop layout and mobile slide-over drawer */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 pb-18 md:pb-6">
          {children}
        </main>
        <Footer />
      </div>

      {/* Floating AI Bot: available across screens */}
      <FloatingAiBot />

      {/* Mobile Bottom Navigation Bar: quick one-tap thumb navigation on smartphones */}
      <MobileBottomNav
        onOpenDrawer={() => setMobileSidebarOpen(true)}
      />
    </div>
  );
}



