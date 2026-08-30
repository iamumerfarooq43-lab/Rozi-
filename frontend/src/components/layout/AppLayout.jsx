import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";
import FloatingAiBot from "./FloatingAiBot";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { requestNotificationPermission } from "../../utils/requestNotificationPermission";
import { messaging, onMessage } from "../../firebase.js";

export default function AppLayout({ children }) {
  const queryClient = useQueryClient();

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

  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground message:", payload);
      // refresh the notifications query so the bell badge updates immediately
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

    return () => unsubscribe();
  }, [queryClient]);

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
        <Footer />
      </div>
      <FloatingAiBot />
    </div>
  );
}

