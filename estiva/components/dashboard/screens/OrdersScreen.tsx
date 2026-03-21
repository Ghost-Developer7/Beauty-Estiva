"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const orders = [
  {
    status: "Approved",
    client: "Gökhan Mülayim",
    services: "Signature ritual",
    products: "Estiva kit",
    date: "24 Dec 2025",
    time: "14:30",
    arrived: "Yes",
    points: "100",
    total: "TRY 4.800",
    discount: "0%",
    discountedTotal: "TRY 4.800",
    paid: "TRY 4.800",
    paymentMethod: "Card",
    remaining: "0",
    creator: "Admin",
    created: "24 Dec 2025",
  },
  {
    status: "Awaiting payment",
    client: "Mehmet Kara",
    services: "Glow facial",
    products: "-",
    date: "23 Dec 2025",
    time: "10:00",
    arrived: "Yes",
    points: "50",
    total: "TRY 1.900",
    discount: "10%",
    discountedTotal: "TRY 1.710",
    paid: "TRY 0",
    paymentMethod: "-",
    remaining: "TRY 1.710",
    creator: "Web",
    created: "23 Dec 2025",
  },
];

const copy = {
  en: {
    title: "Orders",
    statusPlaceholder: "Status",
    datePlaceholder: "Today",
    newOrder: "New",
    filterBtn: "Filter / Sort",
    exportBtn: "Export",
    headers: [
      "Status",
      "Client",
      "Services",
      "Products",
      "Date",
      "Time",
      "Arrived?",
      "Points",
      "Total",
      "Discount",
      "Disc. Total",
      "Paid",
      "Pay Method",
      "Remaining",
      "Creator",
      "Created",
    ],
    statusOptions: ["Approved", "Awaiting payment", "Archived"],
    recordCount: "Total record count",
    actions: {
      settings: "Settings",
      refresh: "Refresh",
      download: "Download",
    }
  },
  tr: {
    title: "Adisyonlar",
    statusPlaceholder: "Durum",
    datePlaceholder: "Bugün",
    newOrder: "Yeni",
    filterBtn: "Filtrele / Sırala",
    exportBtn: "İndir",
    headers: [
      "Durum",
      "Müşteri",
      "Hizmetler",
      "Ürünler",
      "Tarih",
      "Saat",
      "Geldi?",
      "Puan",
      "Toplam",
      "İndirim",
      "İndirimli",
      "Ödenen",
      "Ödeme",
      "Kalan",
      "Oluşturan",
      "Oluşturulma",
    ],
    statusOptions: ["Onaylı", "Ödeme bekleniyor", "Arşivlenmiş"],
    recordCount: "Toplam kayıt sayısı",
    actions: {
      settings: "Ayarlar",
      refresh: "Yenile",
      download: "İndir",
    }
  },
};

export default function OrdersScreen() {
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

        <div className="flex items-center gap-3">
          <div className="relative min-w-[120px]">
            <select className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white focus:outline-none">
              <option className="bg-[#1a1a1a]">{text.datePlaceholder}</option>
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40">v</div>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-[#00a651] px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-green-900/20 hover:bg-[#008f45]">
            + {text.newOrder}
          </button>
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

      {/* Table - No Min Width, Compact */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_15px_40px_rgba(3,2,9,0.5)]">
        <table className="w-full text-left text-[10px] md:text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 font-semibold text-white/50">
              {text.headers.map((label, i) => (
                <th key={label} className="px-2 py-3 whitespace-nowrap">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map((order, i) => (
              <tr key={i} className="transition hover:bg-white/5">
                <td className="px-2 py-3 whitespace-nowrap">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${order.status === "Approved" ? "bg-green-500/10 text-green-400" : "bg-orange-500/10 text-orange-400"
                    }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-2 py-3 font-medium text-white max-w-[100px] truncate" title={order.client}>{order.client}</td>
                <td className="px-2 py-3 text-white/60 max-w-[100px] truncate" title={order.services}>{order.services}</td>
                <td className="px-2 py-3 text-white/60 max-w-[80px] truncate" title={order.products}>{order.products}</td>
                <td className="px-2 py-3 text-white/60 whitespace-nowrap">{order.date}</td>
                <td className="px-2 py-3 text-white/60">{order.time}</td>
                <td className="px-2 py-3 text-white/60">{order.arrived}</td>
                <td className="px-2 py-3 text-white/60">{order.points}</td>
                <td className="px-2 py-3 font-semibold text-white whitespace-nowrap">{order.total}</td>
                <td className="px-2 py-3 text-white/60">{order.discount}</td>
                <td className="px-2 py-3 font-semibold text-white whitespace-nowrap">{order.discountedTotal}</td>
                <td className="px-2 py-3 text-white/60 whitespace-nowrap">{order.paid}</td>
                <td className="px-2 py-3 text-white/60">{order.paymentMethod}</td>
                <td className="px-2 py-3 text-white/60 whitespace-nowrap">{order.remaining}</td>
                <td className="px-2 py-3 text-white/60">{order.creator}</td>
                <td className="px-2 py-3 text-white/60 whitespace-nowrap">{order.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Footer */}
        <div className="border-t border-white/10 bg-white/5 p-3 text-[10px] font-medium text-white/60">
          {text.recordCount}: {orders.length}
        </div>
      </div>
    </div>
  );
}
