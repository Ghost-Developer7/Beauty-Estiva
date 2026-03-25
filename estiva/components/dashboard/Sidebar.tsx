"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { ComponentType } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { tenantService } from "@/services/tenantService";
import type { TenantInfo } from "@/services/tenantService";
import {
  IconCalendar,
  IconHome,
  IconList,
  IconReports,
  IconClock,
  IconUsers,
  IconTag,
  IconGrid,
  IconPOS,
  IconMessage,
  IconMenu,
  IconWallet,
  IconBanknote,
  IconWhatsapp,
  IconInstagram,
  IconEnvelope,
  IconPercent,
  IconMessageSquare,
  IconPhone,
  IconUpload,
  IconDownload,
  IconArrowDownLeft,
  IconArrowUpRight,
  IconEstivaLogo,
  IconUserPlus,
  IconSettings,
  IconBuilding,
} from "@/components/dashboard/icons";

const ChevronDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const ChevronUp = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M18 15l-6-6-6 6" />
  </svg>
);

const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType;
  expandable?: boolean;
  beta?: boolean;
  children?: NavItem[];
};

const navItems = {
  en: [
    { label: "Overview", href: "/dashboard", icon: IconHome },
    { label: "Appointments", href: "/dashboard/appointments", icon: IconClock },
    { label: "Orders", href: "/dashboard/orders", icon: IconList },
    { label: "Customers", href: "/dashboard/customers", icon: IconUsers },
    { label: "Treatments", href: "/dashboard/treatments", icon: IconTag },
    {
      label: "Staff",
      href: "/dashboard/staff",
      icon: IconUserPlus,
      expandable: true,
      children: [
        { label: "Staff List", href: "/dashboard/staff", icon: IconUsers },
        { label: "Invite Staff", href: "/dashboard/staff/invite", icon: IconEnvelope },
        { label: "Shift Management", href: "/dashboard/staff/shifts", icon: IconClock },
        { label: "Leave Management", href: "/dashboard/staff/leaves", icon: IconCalendar },
        { label: "HR Records", href: "/dashboard/staff/hr", icon: IconList },
      ]
    },
    { label: "Product Sales", href: "/dashboard/product-sales", icon: IconTag },
    { label: "Package Sales", href: "/dashboard/package-sales", icon: IconGrid },
    { label: "Subscription", href: "/dashboard/subscription", icon: IconWallet },
    { label: "Branches", href: "/dashboard/branches", icon: IconBuilding },
    {
      label: "Reports",
      href: "/dashboard/reports",
      icon: IconReports,
      expandable: true,
      children: [
        { label: "Cash Report", href: "/dashboard/reports/cash", icon: IconWallet },
        { label: "Personnel Report", href: "/dashboard/reports/personnel", icon: IconUsers },
        { label: "Sales Reports", href: "/dashboard/reports/sales", icon: IconBanknote },
      ]
    },
    {
      label: "Other",
      href: "/dashboard/other",
      icon: IconMenu,
      expandable: true,
      children: [
        { label: "Easy SMS", href: "/dashboard/other/sms", icon: IconEnvelope },
        { label: "Commissions", href: "/dashboard/commission", icon: IconPercent },
        { label: "Reviews", href: "/dashboard/other/reviews", icon: IconMessageSquare },
        { label: "Call Logs", href: "/dashboard/other/calls", icon: IconPhone },
        { label: "Expenses", href: "/dashboard/other/expenses", icon: IconUpload },
        { label: "Collections", href: "/dashboard/other/collections", icon: IconDownload },
        { label: "Receivables", href: "/dashboard/other/receivables", icon: IconArrowDownLeft },
        { label: "Debts", href: "/dashboard/other/debts", icon: IconArrowUpRight },
      ]
    },
    { label: "Settings", href: "/dashboard/settings", icon: IconSettings },
  ],
  tr: [
    { label: "Özet", href: "/dashboard", icon: IconHome },
    { label: "Randevular", href: "/dashboard/appointments", icon: IconClock },
    { label: "Adisyonlar", href: "/dashboard/orders", icon: IconList },
    { label: "Müşteriler", href: "/dashboard/customers", icon: IconUsers },
    { label: "Hizmetler", href: "/dashboard/treatments", icon: IconTag },
    {
      label: "Personel",
      href: "/dashboard/staff",
      icon: IconUserPlus,
      expandable: true,
      children: [
        { label: "Personel Listesi", href: "/dashboard/staff", icon: IconUsers },
        { label: "Personel Davet Et", href: "/dashboard/staff/invite", icon: IconEnvelope },
        { label: "Vardiya Yönetimi", href: "/dashboard/staff/shifts", icon: IconClock },
        { label: "İzin Yönetimi", href: "/dashboard/staff/leaves", icon: IconCalendar },
        { label: "Özlük Bilgileri", href: "/dashboard/staff/hr", icon: IconList },
      ]
    },
    { label: "Ürün satışları", href: "/dashboard/product-sales", icon: IconTag },
    { label: "Paket satışları", href: "/dashboard/package-sales", icon: IconGrid },
    { label: "Abonelik", href: "/dashboard/subscription", icon: IconWallet },
    { label: "Şubeler", href: "/dashboard/branches", icon: IconBuilding },
    {
      label: "Raporlar",
      href: "/dashboard/reports",
      icon: IconReports,
      expandable: true,
      children: [
        { label: "Kasa raporu", href: "/dashboard/reports/cash", icon: IconWallet },
        { label: "Personel raporu", href: "/dashboard/reports/personnel", icon: IconUsers },
        { label: "Satış raporları", href: "/dashboard/reports/sales", icon: IconBanknote },
      ]
    },
    {
      label: "Diğer",
      href: "/dashboard/other",
      icon: IconMenu,
      expandable: true,
      children: [
        { label: "Kolay SMS", href: "/dashboard/other/sms", icon: IconEnvelope },
        { label: "Komisyonlar", href: "/dashboard/commission", icon: IconPercent },
        { label: "Yorumlar", href: "/dashboard/other/reviews", icon: IconMessageSquare },
        { label: "Arama kayıtları", href: "/dashboard/other/calls", icon: IconPhone },
        { label: "Masraflar", href: "/dashboard/other/expenses", icon: IconUpload },
        { label: "Tahsilatlar", href: "/dashboard/other/collections", icon: IconDownload },
        { label: "Alacaklar", href: "/dashboard/other/receivables", icon: IconArrowDownLeft },
        { label: "Borçlar", href: "/dashboard/other/debts", icon: IconArrowUpRight },
      ]
    },
    { label: "Ayarlar", href: "/dashboard/settings", icon: IconSettings },
  ],
};

// SuperAdmin-only nav items
const superAdminItems = {
  en: [
    { label: "Package Management", href: "/dashboard/subscription-management", icon: IconSettings },
  ],
  tr: [
    { label: "Paket Yönetimi", href: "/dashboard/subscription-management", icon: IconSettings },
  ],
};

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    "/dashboard/staff": false,
    "/dashboard/pos": false,
    "/dashboard/reports": false,
    "/dashboard/messaging": false,
    "/dashboard/other": true,
  });

  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const { user } = useAuth();
  const isSuperAdmin = user?.roles?.includes("SuperAdmin") ?? false;

  useEffect(() => {
    tenantService.getTenantInfo().then((res) => {
      if (res.data.success && res.data.data) {
        setTenantInfo(res.data.data);
      }
    }).catch(() => {});
  }, []);

  // Reset submenus when sidebar collapses
  useEffect(() => {
    if (!expanded) {
      setOpenMenus(prev => {
        const reset: Record<string, boolean> = {};
        Object.keys(prev).forEach(key => { reset[key] = false; });
        return reset;
      });
    }
  }, [expanded]);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (mobileOpen && onMobileClose) {
      onMobileClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Combine regular items with SuperAdmin items if applicable
  const items: NavItem[] = [
    ...navItems[language],
    ...(isSuperAdmin ? superAdminItems[language] : []),
  ];

  const toggleMenu = (href: string) => {
    setOpenMenus(prev => ({ ...prev, [href]: !prev[href] }));
  };

  const sidebarContent = (
    <aside
      className={`estiva-dashboard-sidebar relative flex flex-col overflow-hidden text-white shadow-[0_0_40px_rgba(5,4,17,0.8)] transition-all duration-300 h-full ${
        expanded ? "w-64" : "w-20"
      }`}
    >
      {/* Floating Toggle Button - hidden on mobile overlay */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className={`absolute -right-3 top-8 z-50 hidden md:flex h-7 w-7 items-center justify-center rounded-full border shadow-lg transition-colors ${
          isLight
            ? "border-gray-300 bg-white text-gray-600 hover:bg-gray-100 hover:border-gray-400"
            : "border-white/20 bg-[#1a1625] text-white hover:bg-white/20 hover:border-white/40"
        }`}
      >
        {expanded ? <ChevronLeft /> : <ChevronRight />}
      </button>

      {/* Header Logo Area */}
      <div className={`flex items-center px-5 py-6 ${expanded ? "justify-start" : "justify-center"}`}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0">
            <IconEstivaLogo />
          </div>
          <div className={`transition-all duration-300 overflow-hidden ${expanded ? "w-auto opacity-100" : "w-0 opacity-0 hidden"}`}>
            <div className="min-w-0">
              {tenantInfo?.companyName ? (
                <>
                  <p className="text-sm font-semibold whitespace-nowrap truncate max-w-[160px]">
                    {tenantInfo.companyName}
                  </p>
                  <p className="text-[10px] tracking-[0.3em] text-white/40">
                    POWERED BY ESTIVA
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs tracking-[0.4em] text-white/60">
                    ESTIVA
                  </p>
                  <p className="text-sm font-semibold whitespace-nowrap">Beauty OS</p>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Close button for mobile */}
        {mobileOpen && (
          <button
            type="button"
            onClick={onMobileClose}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white md:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      <nav className="mt-4 flex-1 min-h-0 space-y-1 px-3 overflow-y-auto custom-scrollbar">
        {items.map((item, index) => renderNavItem(item, index, pathname, expanded, openMenus, toggleMenu))}
      </nav>

      <div className="border-t border-white/10 px-5 py-6 text-xs text-white/60">
        <p className={`whitespace-nowrap transition-opacity duration-300 ${expanded ? "opacity-100" : "opacity-0"}`}>
          version 1.0 / Atelier build
        </p>
      </div>
    </aside>
  );

  // Desktop: render sidebar inline
  // Mobile: render as overlay
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          {/* Sidebar panel */}
          <div className="relative z-10 h-full w-64 animate-slide-in-left">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

const renderNavItem = (
  item: NavItem,
  index: number,
  pathname: string,
  expanded: boolean,
  openMenus: Record<string, boolean>,
  toggleMenu: (href: string) => void,
  level = 0,
) => {
  const isActive = pathname === item.href;
  const isOpen = openMenus[item.href];
  const children = item.children ?? [];
  const hasChildren = children.length > 0;
  const Icon = item.icon;

  const rowClasses = `group relative flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium cursor-pointer select-none
    transition-all duration-200 ease-out
    ${isActive && !hasChildren
      ? "bg-white/15 text-white shadow-[0_0_12px_rgba(255,255,255,0.06)]"
      : "text-white/60 hover:bg-white/[0.07] hover:text-white active:scale-[0.98]"
    }`;

  const iconBox = (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
      isActive && !hasChildren
        ? "bg-white/20 text-white"
        : "bg-white/5 text-white/70 group-hover:bg-white/10 group-hover:text-white"
    }`}>
      <Icon />
    </span>
  );

  const content = (
    <>
      {expanded ? (
        <div className="flex items-center gap-3 min-w-0">
          {iconBox}
          <span className="truncate">{item.label}</span>
          {item.beta && (
            <span className="rounded border border-[#6d28d9] bg-[#6d28d9]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#a78bfa] tracking-wider shrink-0">
              BETA
            </span>
          )}
        </div>
      ) : (
        iconBox
      )}

      {expanded && item.expandable && (
        <span className={`shrink-0 text-white/40 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
          <ChevronDown />
        </span>
      )}
    </>
  );

  return (
    <div key={index}>
      {item.expandable ? (
        <button
          type="button"
          onClick={() => toggleMenu(item.href)}
          className={rowClasses}
          style={{ paddingLeft: `${12 + level * 12}px` }}
        >
          {content}
        </button>
      ) : (
        <Link
          href={item.href}
          className={rowClasses}
          style={{ paddingLeft: `${12 + level * 12}px` }}
        >
          {content}
        </Link>
      )}

      {expanded && hasChildren && (
        <div
          className="overflow-hidden transition-all duration-200 ease-out pb-1"
          style={{
            maxHeight: isOpen ? `${children.length * 52 + 8}px` : "0px",
            opacity: isOpen ? 1 : 0,
          }}
        >
          <div className="mt-1 space-y-1 ml-4 border-l border-white/[0.06] pl-1">
            {children.map((child, cIndex) =>
              renderNavItem(
                child,
                cIndex,
                pathname,
                expanded,
                openMenus,
                toggleMenu,
                level + 1,
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
};
