"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

const copy = {
    en: {
        title: "Sales reports",
        datePlaceholder: "This month",
        download: "Download",
        tabs: ["Daily/Weekly report", "Summary", "Services", "Product sales", "Package sales"],
        alert: "Calculated amounts in the collected column are same as your cash report...",
        table: {
            title: "Daily/Weekly report",
            headers: ["Date", "Day", "Revenues", "Expenses", "Difference"],
            subHeaders: ["Services", "Product sales", "Package sales", "Total", "(Collected)"],
            rows: [
                { date: "31 Jan", day: "Saturday" },
                { date: "30 Jan", day: "Friday" },
                { date: "29 Jan", day: "Thursday" },
                { date: "28 Jan", day: "Wednesday" },
                { date: "27 Jan", day: "Tuesday" },
                { date: "26 Jan", day: "Monday" },
            ],
            weekHeader: "Week: 2026-01-26 > 2026-02-01 [Jan 26 - Feb 1]",
            footer: "Weekly total"
        }
    },
    tr: {
        title: "Satış raporları",
        datePlaceholder: "Bu ay",
        download: "İndir",
        tabs: ["Günlük/Haftalık rapor", "Özet", "Hizmetler", "Ürün satışları", "Paket satışları"],
        alert: "Tahsil edilen sütunundaki tutarlar kasa raporunuzla aynıdır. Satış tutarları erken/geç/yapılmayan tahsilatlar sebebiyle farklılık gösterebilir.",
        table: {
            title: "Günlük/Haftalık rapor",
            headers: ["Tarih", "Gün", "Gelirler", "Masraflar", "Fark"],
            subHeaders: ["Hizmetler", "Ürün satışları", "Paket satışları", "Toplam", "(Tahsil edilen)"],
            rows: [
                { date: "31 Ocak", day: "Cumartesi" },
                { date: "30 Ocak", day: "Cuma" },
                { date: "29 Ocak", day: "Perşembe" },
                { date: "28 Ocak", day: "Çarşamba" },
                { date: "27 Ocak", day: "Salı" },
                { date: "26 Ocak", day: "Pazartesi" },
            ],
            weekHeader: "Hafta: 2026-01-26 > 2026-02-01 [26 Ocak - 1 Şubat]",
            footer: "Haftalık toplam"
        }
    },
};

export default function SalesReportsScreen() {
    const { language } = useLanguage();
    const text = copy[language];
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="space-y-6 text-white">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold">{text.title}</h1>

                <div className="relative min-w-[120px]">
                    <select className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none">
                        <option className="bg-[#1a1a1a]">{text.datePlaceholder}</option>
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40">v</div>
                </div>
            </div>

            {/* Alert */}
            <div className="flex items-start gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-xs text-yellow-200/80">
                <span className="text-lg">⚠</span>
                <p>{text.alert}</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-white/10">
                <div className="flex gap-6 overflow-x-auto pb-1">
                    {text.tabs.map((tab, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveTab(i)}
                            className={`whitespace-nowrap pb-3 text-sm font-medium transition-all ${activeTab === i ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Panel Content (Daily Report styling) */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">{text.table.title}</h2>
                    <button className="flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2 text-xs font-medium text-white shadow hover:bg-[#2563eb]">
                        📄 {text.download}
                    </button>
                </div>

                <div className="overflow-x-auto">
                    {/* Complex Header Table Layout */}
                    <table className="w-full text-left text-xs">
                        <thead>
                            {/* Top Header */}
                            <tr className="border-b border-white/10 text-white/40">
                                <th className="py-2 pr-4">{text.table.headers[0]}</th> {/* Date */}
                                <th className="py-2 pr-4">{text.table.headers[1]}</th> {/* Day */}
                                <th className="py-2 text-center border-b border-white/10" colSpan={5}>{text.table.headers[2]}</th> {/* Revenues */}
                                <th className="py-2 px-4 text-center">{text.table.headers[3]}</th> {/* Expenses */}
                                <th className="py-2 px-4 text-right">{text.table.headers[4]}</th> {/* Difference */}
                            </tr>
                            {/* Sub Header for Revenues */}
                            <tr className="border-b border-white/10 font-medium text-white/60">
                                <th className="py-4"></th>
                                <th className="py-4"></th>
                                <th className="py-4 px-2">{text.table.subHeaders[0]}</th> {/* Services */}
                                <th className="py-4 px-2">{text.table.subHeaders[1]}</th> {/* Product */}
                                <th className="py-4 px-2">{text.table.subHeaders[2]}</th> {/* Package */}
                                <th className="py-4 px-2">{text.table.subHeaders[3]}</th> {/* Total */}
                                <th className="py-4 px-2 text-white/40">{text.table.subHeaders[4]}</th> {/* Collected */}
                                <th className="py-4 px-2"></th>
                                <th className="py-4 px-2"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {/* Week Header */}
                            <tr className="bg-white/[0.02]">
                                <td colSpan={10} className="py-2 px-2 font-bold text-[10px] text-white/50 uppercase tracking-widest">
                                    {text.table.weekHeader}
                                </td>
                            </tr>
                            {text.table.rows.map((row, i) => (
                                <tr key={i} className="hover:bg-white/5 transition">
                                    <td className="py-3 text-white/60">{row.date}</td>
                                    <td className="py-3 text-white/80">{row.day}</td>
                                    <td className="py-3 px-2">0</td>
                                    <td className="py-3 px-2">0</td>
                                    <td className="py-3 px-2">0</td>
                                    <td className="py-3 px-2">0</td>
                                    <td className="py-3 px-2 text-white/40">0</td>
                                    <td className="py-3 text-center px-4">0</td>
                                    <td className="py-3 text-right px-4">0</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="border-t border-white/10 font-bold bg-white/5">
                            <tr>
                                <td className="py-4 text-white">{text.table.footer}</td>
                                <td></td>
                                <td className="py-4 px-2">0 TL</td>
                                <td className="py-4 px-2">0 TL</td>
                                <td className="py-4 px-2">0 TL</td>
                                <td className="py-4 px-2">0 TL</td>
                                <td className="py-4 px-2">0 TL</td>
                                <td className="py-4 text-center px-4">0 TL</td>
                                <td className="py-4 text-right px-4">0 TL</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div >
    );
}
