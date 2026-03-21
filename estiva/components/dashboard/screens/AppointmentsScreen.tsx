"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const appointments = [
  {
    client: "Didem Kara",
    phone: "+90 555 123 45 67",
    services: "Lazer Touch",
    date: "24 Dec 2025",
    time: "15:30",
    status: "Approved",
    totalPrice: "TRY 2.150",
    deposit: "TRY 500",
    creator: "Admin",
    created: "20 Dec 2025",
  },
  {
    client: "Pandora Çelenk",
    phone: "+90 532 654 32 10",
    services: "Glow Facial",
    date: "24 Dec 2025",
    time: "17:00",
    status: "Pending",
    totalPrice: "TRY 1.250",
    deposit: "-",
    creator: "Web",
    created: "22 Dec 2025",
  },
];

const copy = {
  en: {
    title: "Appointments",
    statusPlaceholder: "Status",
    datePlaceholder: "This month",
    filterBtn: "Filter / Sort",
    exportBtn: "Export",
    headers: [
      "Client",
      "Phone",
      "Services",
      "Date",
      "Time",
      "Status",
      "Total Price",
      "Deposit",
      "Creator",
      "Created",
    ],
    statusOptions: ["Approved", "Pending", "Cancelled"],
    recordCount: "Total record count",
    actions: {
      settings: "Settings",
      refresh: "Refresh",
      download: "Download",
    }
  },
  tr: {
    title: "Randevular",
    statusPlaceholder: "Durum",
    datePlaceholder: "Bu ay",
    filterBtn: "Filtrele / Sırala",
    exportBtn: "İndir",
    headers: [
      "Müşteri",
      "Telefon",
      "Hizmetler",
      "Tarih",
      "Saat",
      "Durum",
      "Toplam",
      "Kapora",
      "Oluşturan",
      "Oluşturulma",
    ],
    statusOptions: ["Onaylı", "Bekliyor", "İptal"],
    recordCount: "Toplam kayıt sayısı",
    actions: {
      settings: "Ayarlar",
      refresh: "Yenile",
      download: "İndir",
    }
  },
};

export default function AppointmentsScreen() {
  const { language } = useLanguage();
  const text = copy[language];

  return (
    <div className="space-y-4 text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">{text.title}</h1>
          <div className="relative min-w-[150px]">
            <select className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white focus:outline-none">
              <option className="bg-[#1a1a1a]">{text.statusOptions[0]}</option>
              {text.statusOptions.slice(1).map((opt) => (
                <option key={opt} className="bg-[#1a1a1a]">{opt}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40">v</div>
          </div>
        </div>

        <div className="relative min-w-[120px]">
          <select className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white focus:outline-none">
            <option className="bg-[#1a1a1a]">{text.datePlaceholder}</option>
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40">v</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-2">
        <button className="flex items-center gap-2 rounded-lg bg-[#4b5563] px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#374151]">
          <span className="text-[10px]">Y</span> {text.filterBtn}
        </button>

        <div className="flex gap-2">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4b5563] text-white hover:bg-[#374151]">
            <span className="text-xs">⚙️</span>
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4b5563] text-white hover:bg-[#374151]">
            <span className="text-xs">↻</span>
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-[#4b5563] px-4 py-2 text-xs font-medium text-white hover:bg-[#374151]">
            {text.exportBtn}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_15px_40px_rgba(3,2,9,0.5)]">
        <table className="w-full text-left text-[10px] md:text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 font-semibold text-white/50">
              {text.headers.map((label) => (
                <th key={label} className="px-4 py-3 whitespace-nowrap">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {appointments.map((apt, i) => (
              <tr key={i} className="transition hover:bg-white/5">
                <td className="px-4 py-3 font-medium text-white">{apt.client}</td>
                <td className="px-4 py-3 text-white/60">{apt.phone}</td>
                <td className="px-4 py-3 text-white/60">{apt.services}</td>
                <td className="px-4 py-3 text-white/60">{apt.date}</td>
                <td className="px-4 py-3 text-white/60">{apt.time}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${apt.status === "Approved" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                    }`}>
                    {apt.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-white">{apt.totalPrice}</td>
                <td className="px-4 py-3 text-white/60">{apt.deposit}</td>
                <td className="px-4 py-3 text-white/60">{apt.creator}</td>
                <td className="px-4 py-3 text-white/60">{apt.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Footer */}
        <div className="border-t border-white/10 bg-white/5 p-3 text-[10px] font-medium text-white/60">
          {text.recordCount}: {appointments.length}
        </div>
      </div>
    </div>
  );
}
