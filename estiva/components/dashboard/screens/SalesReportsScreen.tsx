"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";

const copy = {
    en: {
        title: "Sales Reports",
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
        title: "Satış Raporları",
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
  const { theme } = useTheme();
  const isDark = theme === "dark";
    const text = copy[language];
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className={`space-y-6 ${isDark ? "text-white" : "text-gray-900"}`}>
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold">{text.title}</h1>

                <div className="relative min-w-[120px]">
                    <select className={`w-full appearance-none rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none`}>
                        <option className="bg-[#1a1a1a]">{text.datePlaceholder}</option>
                    </select>
                    <div className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] ${isDark ? "text-white/40" : "text-gray-400"}`}>v</div>
                </div>
            </div>

            {/* Alert */}
            <div className="flex items-start gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-xs text-yellow-200/80">
                <span className="text-lg">⚠</span>
                <p>{text.alert}</p>
            </div>

            {/* Tabs */}
            <div className={`border-b ${isDark ? "border-white/10" : "border-gray-200"}`}>
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
            <div className={`rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} p-6`}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">{text.table.title}</h2>
                    <button className={`flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2 text-xs font-medium ${isDark ? "text-white" : "text-gray-900"} shadow hover:bg-[#2563eb]`}>
                        📄 {text.download}
                    </button>
                </div>

                <div className="overflow-x-auto">
                    {/* Complex Header Table Layout */}
                    <table className="w-full text-left text-xs">
                        <thead>
                            {/* Top Header */}
                            <tr className={`border-b ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "text-white/40" : "text-gray-400"}`}>
                                <th className="py-2 pr-4">{text.table.headers[0]}</th>
                                <th className="py-2 pr-4">{text.table.headers[1]}</th>
                                <th className={`py-2 text-center border-b ${isDark ? "border-white/10" : "border-gray-200"}`} colSpan={5}>{text.table.headers[2]}</th>
                                <th className="py-2 px-4 text-center">{text.table.headers[3]}</th>
                                <th className="py-2 px-4 text-right">{text.table.headers[4]}</th>
                            </tr>
                            {/* Sub Header for Revenues */}
                            <tr className={`border-b ${isDark ? "border-white/10" : "border-gray-200"} font-medium ${isDark ? "text-white/60" : "text-gray-600"}`}>
                                <th className="py-4"></th>
                                <th className="py-4"></th>
                                <th className="py-4 px-2">{text.table.subHeaders[0]}</th>
                                <th className="py-4 px-2">{text.table.subHeaders[1]}</th>
                                <th className="py-4 px-2">{text.table.subHeaders[2]}</th>
                                <th className="py-4 px-2">{text.table.subHeaders[3]}</th>
                                <th className={`py-4 px-2 ${isDark ? "text-white/40" : "text-gray-400"}`}>{text.table.subHeaders[4]}</th>
                                <th className="py-4 px-2"></th>
                                <th className="py-4 px-2"></th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-gray-100"}`}>
                            {/* Week Header */}
                            <tr className="bg-white/[0.02]">
                                <td colSpan={10} className={`py-2 px-2 font-bold text-[10px] ${isDark ? "text-white/50" : "text-gray-500"} tracking-widest`}>
                                    {text.table.weekHeader}
                                </td>
                            </tr>
                            {text.table.rows.map((row, i) => (
                                <tr key={i} className={`${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"} transition`}>
                                    <td className={`py-3 ${isDark ? "text-white/60" : "text-gray-600"}`}>{row.date}</td>
                                    <td className={`py-3 ${isDark ? "text-white/80" : "text-gray-800"}`}>{row.day}</td>
                                    <td className="py-3 px-2">0</td>
                                    <td className="py-3 px-2">0</td>
                                    <td className="py-3 px-2">0</td>
                                    <td className="py-3 px-2">0</td>
                                    <td className={`py-3 px-2 ${isDark ? "text-white/40" : "text-gray-400"}`}>0</td>
                                    <td className="py-3 text-center px-4">0</td>
                                    <td className="py-3 text-right px-4">0</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className={`border-t ${isDark ? "border-white/10" : "border-gray-200"} font-bold ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                            <tr>
                                <td className={`py-4 ${isDark ? "text-white" : "text-gray-900"}`}>{text.table.footer}</td>
                                <td></td>
                                <td className="py-4 px-2">0 TRY</td>
                                <td className="py-4 px-2">0 TRY</td>
                                <td className="py-4 px-2">0 TRY</td>
                                <td className="py-4 px-2">0 TRY</td>
                                <td className="py-4 px-2">0 TRY</td>
                                <td className="py-4 text-center px-4">0 TRY</td>
                                <td className="py-4 text-right px-4">0 TRY</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div >
    );
}
