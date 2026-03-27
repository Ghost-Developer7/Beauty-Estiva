"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

const copy = {
    en: {
        title: "Call logs",
        placeholder: "Search",
        table: {
            cols: ["Caller", "Customer", "Status", "Duration (Sec)", "Created"],
        }
    },
    tr: {
        title: "Arama kayıtları",
        placeholder: "Ara",
        table: {
            cols: ["Arayan", "Müşteri", "Durum", "Süre (Saniye)", "Oluşturulma"],
        }
    },
};

export default function CallLogsScreen() {
    const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
    const text = copy[language];

    return (
        <div className={`space-y-6 ${isDark ? "text-white" : "text-gray-900"} h-full flex flex-col`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">{text.title}</h1>

                <div className="relative min-w-[120px]">
                    <select className={`w-full appearance-none rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none`}>
                        <option className="bg-[#1a1a1a]">Bu ay</option>
                    </select>
                    <div className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] ${isDark ? "text-white/40" : "text-gray-400"}`}>v</div>
                </div>
            </div>

            {/* Toolbar */}
            <div className={`rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} p-4 flex flex-wrap items-center justify-between gap-4`}>
                <input
                    type="text"
                    placeholder={text.placeholder}
                    className={`w-full md:w-64 rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-4 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder-white/30" : "placeholder-gray-400"} focus:outline-none focus:border-white/20`}
                />

                <div className="flex gap-2">
                    <button className={`flex h-9 w-9 items-center justify-center rounded-lg bg-[#3b82f6] ${isDark ? "text-white" : "text-gray-900"} shadow-lg hover:bg-[#2563eb] text-sm`}>
                        ⚙
                    </button>
                    <button className={`flex h-9 w-9 items-center justify-center rounded-lg bg-[#3b82f6] ${isDark ? "text-white" : "text-gray-900"} shadow-lg hover:bg-[#2563eb] text-xs`}>
                        ↻
                    </button>
                    <button className={`flex items-center gap-2 rounded-lg bg-[#3b82f6] px-6 py-2 text-sm font-medium ${isDark ? "text-white" : "text-gray-900"} shadow-lg  hover:bg-[#2563eb]`}>
                        📄 İndir
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className={`flex-1 rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} overflow-hidden`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className={`${isDark ? "bg-white/5" : "bg-gray-50"} text-xs font-semibold ${isDark ? "text-white/60" : "text-gray-600"}`}>
                            <tr>
                                {text.table.cols.map((col, i) => (
                                    <th key={i} className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 cursor-pointer hover:text-white">
                                            {col}
                                            <span className="opacity-50 text-[10px]">▼</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-gray-100"}`}>
                            {/* Empty state implicitly handled by having no rows */}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
