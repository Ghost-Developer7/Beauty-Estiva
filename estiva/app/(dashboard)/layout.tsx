"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import SubscriptionGuard from "@/components/dashboard/SubscriptionGuard";
import { NotificationProvider } from "@/contexts/NotificationContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <NotificationProvider>
      <div className="estiva-dashboard flex min-h-screen">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        <div className="estiva-dashboard-panel flex flex-1 flex-col min-w-0">
          <Topbar onMenuToggle={() => setMobileMenuOpen((prev) => !prev)} />
          <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 sm:py-10">
            <SubscriptionGuard>{children}</SubscriptionGuard>
          </div>
        </div>
      </div>
    </NotificationProvider>
  );
}
