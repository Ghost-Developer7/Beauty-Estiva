"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * MOCK DATA
 */
const openTabsData = [
  {
    date: "10 Nisan 2025",
    client: "Şaziye Hanım",
    services: "Lazer Epilasyon",
    products: "Glow Serum",
    total: "₺ 3.250",
  },
  {
    date: "10 Nisan 2025",
    client: "Ceren Hanım",
    services: "Cilt Bakımı",
    products: "-",
    total: "₺ 1.480",
  },
];

const receivablesData = [
  {
    client: "Fırat Bey",
    type: "Kredi Kartı Taksit",
    plannedDate: "15 Nisan 2025",
    amount: "₺ 5.000",
  },
  {
    client: "Şükran Hanım",
    type: "Nakil Bakıye",
    plannedDate: "20 Nisan 2025",
    amount: "₺ 1.250",
  },
];

const birthdaysData = [
  {
    client: "Viktoriya Hanım",
    phone: "+90 537 681 56 76",
    birthday: "15 Nisan",
  },
  {
    client: "Sultan Hanım",
    phone: "+90 505 387 15 63",
    birthday: "18 Nisan",
  },
];

const copy = {
  en: {
    salonSummary: "Salon summary",
    overview: "Overview",
    tabs: ["Last open tabs", "Receivable reminders", "Upcoming birthdays"],
    stats: [
      { label: "Active rituals", value: "128", trend: "+12% vs last week" },
      { label: "Occupancy", value: "86%", trend: "High focus" },
      { label: "Pending confirmations", value: "24", trend: "Resolve today" },
    ],
    headers: {
      openTabs: ["Date", "Client", "Services", "Products", "Total amount"],
      receivables: ["Client", "Type", "Planned payment date", "Amount"],
      birthdays: ["Client", "Phone number", "Birthday"],
    },
    noData: "No data available.",
  },
  tr: {
    salonSummary: "Salon özeti",
    overview: "Özet",
    tabs: ["Son açık adisyonlar", "Alacak hatırlatmaları", "Yaklaşan doğumgünleri"],
    stats: [
      { label: "Aktif ritüeller", value: "128", trend: "Geçen haftaya göre +%12" },
      { label: "Doluluk", value: "86%", trend: "Yüksek odak" },
      { label: "Bekleyen onaylar", value: "24", trend: "Bugün çöz" },
    ],
    headers: {
      openTabs: ["Tarih", "Müşteri", "Hizmetler", "Ürünler", "Toplam tutar"],
      receivables: ["Müşteri", "Tip", "Planlanan ödeme tarihi", "Tutar"],
      birthdays: ["Müşteri", "Telefon numarası", "Doğumgünü"],
    },
    noData: "Veri yok.",
  },
};

export default function OverviewScreen() {
  const { language } = useLanguage();
  const text = copy[language];
  const [activeTab, setActiveTab] = useState(0);

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 0: // Last open tabs
        return (
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-semibold text-white/40">
                {text.headers.openTabs.map((label) => (
                  <th key={label} className="px-6 py-4 uppercase tracking-wider">
                    {label} <span className="ml-1 text-white/20">Y</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {openTabsData.map((row, i) => (
                <tr key={i} className="transition hover:bg-white/5">
                  <td className="px-6 py-4 text-white/80">{row.date}</td>
                  <td className="px-6 py-4 font-medium text-white">
                    {row.client}
                  </td>
                  <td className="px-6 py-4 text-white/60">{row.services}</td>
                  <td className="px-6 py-4 text-white/60">{row.products}</td>
                  <td className="px-6 py-4 font-semibold text-white">
                    {row.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 1: // Receivable reminders
        return (
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-semibold text-white/40">
                {text.headers.receivables.map((label) => (
                  <th key={label} className="px-6 py-4 uppercase tracking-wider">
                    {label} <span className="ml-1 text-white/20">Y</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {receivablesData.map((row, i) => (
                <tr key={i} className="transition hover:bg-white/5">
                  <td className="px-6 py-4 font-medium text-white">
                    {row.client}
                  </td>
                  <td className="px-6 py-4 text-white/60">{row.type}</td>
                  <td className="px-6 py-4 text-white/60">{row.plannedDate}</td>
                  <td className="px-6 py-4 font-semibold text-white">
                    {row.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 2: // Upcoming birthdays
        return (
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-semibold text-white/40">
                {text.headers.birthdays.map((label) => (
                  <th key={label} className="px-6 py-4 uppercase tracking-wider">
                    {label} <span className="ml-1 text-white/20">Y</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {birthdaysData.map((row, i) => (
                <tr key={i} className="transition hover:bg-white/5">
                  <td className="px-6 py-4 font-medium text-white">
                    {row.client}
                  </td>
                  <td className="px-6 py-4 text-white/60">{row.phone}</td>
                  <td className="px-6 py-4 text-white">{row.birthday}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">
          {text.salonSummary}
        </p>
        <h1 className="mt-3 text-3xl font-semibold">{text.overview}</h1>
      </div>

      {/* Stats Cards */}
      <section className="grid gap-4 md:grid-cols-3">
        {text.stats.map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(4,2,12,0.6)]"
          >
            <p className="text-sm uppercase tracking-[0.4em] text-white/50">
              {card.label}
            </p>
            <p className="mt-4 text-4xl font-semibold">{card.value}</p>
            <p className="mt-2 text-sm text-white/60">{card.trend}</p>
          </div>
        ))}
      </section>

      {/* Tabs & Content Container */}
      <section className="rounded-3xl border border-white/10 bg-white/5 shadow-[0_25px_60px_rgba(3,2,9,0.65)]">
        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-4 border-b border-white/10 px-6 py-4">
          {text.tabs.map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(index)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeTab === index
                  ? "bg-white/20 text-white shadow-lg"
                  : "text-white/60 hover:text-white"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-x-auto">
          {renderContent()}
        </div>
      </section>
    </div>
  );
}
