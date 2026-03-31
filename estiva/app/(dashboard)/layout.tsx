"use client";

import { useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import SubscriptionGuard from "@/components/dashboard/SubscriptionGuard";
import PageTransition from "@/components/dashboard/PageTransition";
import { NotificationProvider } from "@/contexts/NotificationContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Route değişince sadece main content scroll'unu sıfırla (sidebar değil)
  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [pathname]);

  return (
    <NotificationProvider>
      <div className="estiva-dashboard flex min-h-screen">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        <div className="estiva-dashboard-panel relative z-0 flex flex-1 flex-col min-w-0">
          <Topbar onMenuToggle={() => setMobileMenuOpen((prev) => !prev)} />
          <div ref={mainRef} className="relative z-0 flex-1 overflow-y-auto px-3 sm:px-6 py-6 sm:py-10">
            <SubscriptionGuard>
              <PageTransition>{children}</PageTransition>
            </SubscriptionGuard>
          </div>
        </div>
      </div>
    </NotificationProvider>
  );
}
