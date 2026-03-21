"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const sales = [
    {
        date: "24 Dec 2025",
        client: "Ceren Hanım",
        seller: "Admin",
        service: "Lazer Epilasyon",
        amount: "8 Seans",
        used: "2",
        remaining: "6",
        total: "TRY 5.000",
        paid: "TRY 5.000",
        remainingPayment: "0",
        creator: "Admin",
        validUntil: "24 Dec 2026",
        created: "24 Dec 2025",
    }
];

const copy = {
    en: {
        title: "Package sales",
        datePlaceholder: "This month",
        new: "New",
        filterBtn: "Filter / Sort",
        exportBtn: "Export", // Indir
        importBtn: "Import", // Ice aktar
        headers: [
            "Sale date",
            "Client",
            "Seller",
            "Service",
            "Amount",
            "Used",
            "Remaining usage",
            "Total amount",
            "Paid amount",
            "Remaining payment",
            "Creator",
            "Validity end",
            "Created at",
        ],
        footerSummary: "Total amount of package sales on page",
        recordCount: "Total record count",
        currency: "TRY 0",
        actions: {
            settings: "Settings",
            refresh: "Refresh",
            download: "Download",
        }
    },
    tr: {
        title: "Paket satışları",
        datePlaceholder: "Bu ay",
        new: "Yeni",
        filterBtn: "Filtrele / Sırala",
        exportBtn: "İndir",
        importBtn: "İçe aktar",
        headers: [
            "Satış tarihi",
            "Müşteri",
            "Satıcı",
            "Hizmet",
            "Miktar",
            "Kullanılan",
            "Kalan kullanım",
            "Toplam tutar",
            "Ödenen tutar",
            "Kalan ödeme",
            "Oluşturan",
            "Geçerlilik bitişi",
            "Oluşturulma",
        ],
        footerSummary: "Sayfadaki paket satışlarının toplam tutarı",
        recordCount: "Toplam kayıt sayısı",
        currency: "0 TL",
        actions: {
            settings: "Ayarlar",
            refresh: "Yenile",
            download: "İndir",
        }
    },
};

export default function PackageSalesScreen() {
    const { language } = useLanguage();
    const text = copy[language];

    // Calculate actual totals if needed, for now mocking as 0 TL per screenshot or mock data
    const totalAmount = sales.length > 0 ? "TRY 5.000" : text.currency;

    return (
        <div className="space-y-4 text-white">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold">{text.title}</h1>

                <div className="flex items-center gap-3">
                    <div className="relative min-w-[120px]">
                        <select className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white focus:outline-none">
                            <option className="bg-[#1a1a1a]">{text.datePlaceholder}</option>
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40">v</div>
                    </div>
                    <button className="flex items-center gap-2 rounded-xl bg-[#00a651] px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-green-900/20 hover:bg-[#008f45]">
                        + {text.new}
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
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 rounded-lg bg-[#4b5563] px-4 py-2 text-xs font-medium text-white hover:bg-[#374151]">
                            {text.exportBtn} v
                        </button>
                        <button className="flex items-center gap-2 rounded-lg bg-[#4b5563] px-4 py-2 text-xs font-medium text-white hover:bg-[#374151]">
                            {text.importBtn} v
                        </button>
                    </div>
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
                        {sales.length > 0 ? sales.map((sale, i) => (
                            <tr key={i} className="transition hover:bg-white/5">
                                <td className="px-4 py-3 text-white/60">{sale.date}</td>
                                <td className="px-4 py-3 font-medium text-white">{sale.client}</td>
                                <td className="px-4 py-3 text-white/60">{sale.seller}</td>
                                <td className="px-4 py-3 text-white/60">{sale.service}</td>
                                <td className="px-4 py-3 text-white/60">{sale.amount}</td>
                                <td className="px-4 py-3 text-white/60">{sale.used}</td>
                                <td className="px-4 py-3 text-white/60">{sale.remaining}</td>
                                <td className="px-4 py-3 font-semibold text-white">{sale.total}</td>
                                <td className="px-4 py-3 text-white/60">{sale.paid}</td>
                                <td className="px-4 py-3 text-white/60">{sale.remainingPayment}</td>
                                <td className="px-4 py-3 text-white/60">{sale.creator}</td>
                                <td className="px-4 py-3 text-white/60">{sale.validUntil}</td>
                                <td className="px-4 py-3 text-white/60">{sale.created}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={13} className="px-4 py-8 text-center text-white/40">
                                    {text.recordCount}: 0
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {/* Footer */}
                <div className="flex flex-col gap-1 border-t border-white/10 bg-white/5 p-3 text-[10px] font-medium text-white/60">
                    <div className="flex justify-between border-b border-white/5 pb-2 mb-1">
                        <span>{text.footerSummary}:</span>
                        <span className="text-white">{sales.length > 0 ? totalAmount : text.currency}</span>
                    </div>
                    <div>
                        {text.recordCount}: {sales.length}
                    </div>
                </div>
            </div>
        </div>
    );
}
