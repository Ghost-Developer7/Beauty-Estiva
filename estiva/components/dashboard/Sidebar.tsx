"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ComponentType } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
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
  IconEstivaLogo
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
    { label: "Calendar", href: "/dashboard/calendar", icon: IconCalendar },
    { label: "Appointments", href: "/dashboard/appointments", icon: IconClock },
    { label: "Orders", href: "/dashboard/orders", icon: IconList },
    { label: "Customers", href: "/dashboard/customers", icon: IconUsers },
    { label: "Product Sales", href: "/dashboard/product-sales", icon: IconTag },
    { label: "Package Sales", href: "/dashboard/package-sales", icon: IconGrid },
    {
      label: "SalonPOS",
      href: "/dashboard/pos",
      icon: IconPOS,
      expandable: true,
      children: [
        { label: "POS Application", href: "/dashboard/pos/application", icon: IconList },
      ]
    },
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
      label: "Messaging",
      href: "/dashboard/messaging",
      icon: IconMessage,
      expandable: true,
      beta: true,
      children: [
        {
          label: "Whatsapp",
          href: "/dashboard/messaging/whatsapp",
          icon: IconWhatsapp,
          expandable: true,
          beta: true,
          children: [
            { label: "Business Registration", href: "/dashboard/messaging/whatsapp/register", icon: IconMessage }
          ]
        },
        {
          label: "Instagram",
          href: "/dashboard/messaging/instagram",
          icon: IconInstagram,
          expandable: true,
          beta: true,
          children: [
            { label: "Business Registration", href: "/dashboard/messaging/instagram/register", icon: IconMessage }
          ]
        }
      ]
    },
    {
      label: "Other",
      href: "/dashboard/other",
      icon: IconMenu,
      expandable: true,
      children: [
        { label: "Easy SMS", href: "/dashboard/other/sms", icon: IconEnvelope },
        { label: "Appointment Commissions", href: "/dashboard/other/commissions", icon: IconPercent },
        { label: "Reviews", href: "/dashboard/other/reviews", icon: IconMessageSquare },
        { label: "Call Logs", href: "/dashboard/other/calls", icon: IconPhone },
        { label: "Expenses", href: "/dashboard/other/expenses", icon: IconUpload },
        { label: "Collections", href: "/dashboard/other/collections", icon: IconDownload },
        { label: "Receivables", href: "/dashboard/other/receivables", icon: IconArrowDownLeft },
        { label: "Debts", href: "/dashboard/other/debts", icon: IconArrowUpRight },
      ]
    },
  ],
  tr: [
    { label: "Özet", href: "/dashboard", icon: IconHome },
    { label: "Randevu takvimi", href: "/dashboard/calendar", icon: IconCalendar },
    { label: "Randevular", href: "/dashboard/appointments", icon: IconClock },
    { label: "Adisyonlar", href: "/dashboard/orders", icon: IconList },
    { label: "Müşteriler", href: "/dashboard/customers", icon: IconUsers },
    { label: "Ürün satışları", href: "/dashboard/product-sales", icon: IconTag },
    { label: "Paket satışları", href: "/dashboard/package-sales", icon: IconGrid },
    {
      label: "SalonPOS",
      href: "/dashboard/pos",
      icon: IconPOS,
      expandable: true,
      children: [
        { label: "POS başvurusu", href: "/dashboard/pos/application", icon: IconList },
      ]
    },
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
      label: "Mesajlaşma",
      href: "/dashboard/messaging",
      icon: IconMessage,
      expandable: true,
      beta: true,
      children: [
        {
          label: "Whatsapp",
          href: "/dashboard/messaging/whatsapp",
          icon: IconWhatsapp,
          expandable: true,
          beta: true,
          children: [
            { label: "İşletme Kaydı", href: "/dashboard/messaging/whatsapp/register", icon: IconMessage }
          ]
        },
        {
          label: "Instagram",
          href: "/dashboard/messaging/instagram",
          icon: IconInstagram,
          expandable: true,
          beta: true,
          children: [
            { label: "İşletme Kaydı", href: "/dashboard/messaging/instagram/register", icon: IconMessage }
          ]
        }
      ]
    },
    {
      label: "Diğer",
      href: "/dashboard/other",
      icon: IconMenu,
      expandable: true,
      children: [
        { label: "Kolay SMS", href: "/dashboard/other/sms", icon: IconEnvelope },
        { label: "Randevu Komisyonları", href: "/dashboard/other/commissions", icon: IconPercent },
        { label: "Yorumlar", href: "/dashboard/other/reviews", icon: IconMessageSquare },
        { label: "Arama kayıtları", href: "/dashboard/other/calls", icon: IconPhone },
        { label: "Masraflar", href: "/dashboard/other/expenses", icon: IconUpload },
        { label: "Tahsilatlar", href: "/dashboard/other/collections", icon: IconDownload },
        { label: "Alacaklar", href: "/dashboard/other/receivables", icon: IconArrowDownLeft },
        { label: "Borçlar", href: "/dashboard/other/debts", icon: IconArrowUpRight },
      ]
    },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    "/dashboard/pos": false,
    "/dashboard/reports": false,
    "/dashboard/messaging": false,
    "/dashboard/other": true,
  });

  const { language } = useLanguage();
  const items = navItems[language];

  const toggleMenu = (href: string) => {
    setOpenMenus(prev => ({ ...prev, [href]: !prev[href] }));
  };

  return (
    <aside
      className={`estiva-dashboard-sidebar relative flex flex-col text-white shadow-[0_0_40px_rgba(5,4,17,0.8)] transition-all duration-300 ${
        expanded ? "w-64" : "w-20"
      }`}
    >
      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="absolute -right-3 top-9 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg transition-colors hover:bg-white/20 hover:border-white/40"
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
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                Estiva
              </p>
              <p className="text-sm font-semibold whitespace-nowrap">Beauty OS</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="mt-4 flex-1 space-y-1 px-3 overflow-y-auto custom-scrollbar">
        {items.map((item, index) => renderNavItem(item, index, pathname, expanded, openMenus, toggleMenu))}
      </nav>

      <div className="border-t border-white/10 px-5 py-6 text-xs text-white/60">
        <p className={`whitespace-nowrap transition-opacity duration-300 ${expanded ? "opacity-100" : "opacity-0"}`}>
          version 1.0 / Atelier build
        </p>
      </div>
    </aside>
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

  return (
    <div key={index}>
      <div
        onClick={() => item.expandable ? toggleMenu(item.href) : null}
        className={`group flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium transition cursor-pointer ${isActive && !hasChildren
          ? "bg-white/15 text-white"
          : "text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        style={{ paddingLeft: `${12 + level * 12}px` }}
      >
        <Link href={item.expandable ? "#" : item.href} className="flex flex-1 items-center gap-3" onClick={(e) => item.expandable && e.preventDefault()}>
          {expanded ? (
            <div className="flex items-center gap-3">
              <span>{item.label}</span>
              {item.beta && <span className="rounded border border-[#6d28d9] bg-[#6d28d9]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#a78bfa] uppercase tracking-wider">BETA</span>}
            </div>
          ) : (
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/80 group-hover:bg-white/10 ${isActive ? 'bg-white/20' : ''}`}>
              <Icon />
            </span>
          )}
        </Link>

        {expanded && (
          <div className="flex items-center gap-2 text-white/40">
            {item.label !== "Estiva" && <Icon />}
            {item.expandable && (
              <span className="ml-1">
                {isOpen ? <ChevronUp /> : <ChevronDown />}
              </span>
            )}
          </div>
        )}
      </div>

      {expanded && isOpen && hasChildren && (
        <div className="mt-1 space-y-1">
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
      )}
    </div>
  );
};
