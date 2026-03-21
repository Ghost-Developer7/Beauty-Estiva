"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

const copy = {
    en: {
        title: "Expenses",
        datePlaceholder: "This month",
        placeholder: "Search",
        newButton: "New",
        download: "Download",
        noGraph: "Graph view not available yet.",
        topTable: {
            cols: ["Expense category", "Expense description", "Amount", "Expense owner", "Payment method", "Date", "Added By", "Created"],
            empty: "Total amount: 0 TL"
        },
        tabs: ["Expense category", "Graph"],
        bottomTable: {
            cols: ["Expense", "Count", "Total amount"]
        }
    },
    tr: {
        title: "Masraflar",
        datePlaceholder: "Bu ay",
        placeholder: "Ara",
        newButton: "Yeni",
        download: "İndir",
        noGraph: "Grafik görünümü henüz mevcut değil.",
        topTable: {
            cols: ["Masraf kategorisi", "Masraf açıklaması", "Tutar", "Masraf sahibi", "Ödeme yöntemi", "Tarih", "Ekleyen Kişi", "Oluşturulma"],
            empty: "Toplam tutar: 0 TL"
        },
        tabs: ["Masraf kategorisi", "Grafik"],
        bottomTable: {
            cols: ["Masraf", "Adet", "Toplam tutar"]
        }
    },
};

export default function ExpensesScreen() {
    const { language } = useLanguage();
    const text = copy[language];
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="space-y-8 text-white h-full flex flex-col">
            {/* Top Section */}
            <div className="space-y-4">
                {/* Header & Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-2xl font-semibold">{text.title}</h1>

                    <div className="flex items-center gap-2 ml-auto">
                        <div className="relative min-w-[120px]">
                            <select className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none">
                                <option className="bg-[#1a1a1a]">{text.datePlaceholder}</option>
                            </select>
                            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40">v</div>
                        </div>
                        <button className="flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-green-500">
                            <span className="text-lg leading-none">+</span> {text.newButton}
                        </button>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-wrap items-center justify-between gap-4">
                    <input
                        type="text"
                        placeholder={text.placeholder}
                        className="w-full md:w-64 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                    />

                    <div className="flex gap-2">
                        <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3b82f6] text-white shadow-lg hover:bg-[#2563eb] text-sm">
                            ⚙
                        </button>
                        <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3b82f6] text-white shadow-lg hover:bg-[#2563eb] text-xs">
                            ↻
                        </button>
                        <button className="flex items-center gap-2 rounded-lg bg-[#3b82f6] px-6 py-2 text-sm font-medium text-white shadow-lg  hover:bg-[#2563eb]">
                            📄 {text.download}
                        </button>
                    </div>
                </div>

                {/* Top Table */}
                <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-white/5 text-xs font-semibold uppercase text-white/60">
                                <tr>
                                    {text.topTable.cols.map((col, i) => (
                                        <th key={i} className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 cursor-pointer hover:text-white">
                                                {col}
                                                <span className="opacity-50 text-[10px]">▼</span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <tr className="bg-white/[0.02]">
                                    <td colSpan={8} className="px-6 py-4 font-bold text-white/60">
                                        {text.topTable.empty}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="flex-1 space-y-4 pt-4 border-t border-white/10">
                {/* Tabs */}
                <div className="flex items-center gap-1 border-b border-white/10">
                    {text.tabs.map((tab, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveTab(i)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === i
                                ? "border-white text-white"
                                : "border-transparent text-white/40 hover:text-white/70"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content per tab */}
                {activeTab === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden min-h-[200px]">
                        <div className="overflow-x-auto">
                            <div className="flex justify-end p-2 border-b border-white/10">
                                <button className="flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-1.5 text-xs font-medium text-white shadow-lg hover:bg-[#2563eb]">
                                    📄 {text.download}
                                </button>
                            </div>
                            <table className="w-full text-left text-xs">
                                <thead className="bg-white/5 text-xs font-semibold uppercase text-white/60">
                                    <tr>
                                        {text.bottomTable.cols.map((col, i) => (
                                            <th key={i} className="px-6 py-4 whitespace-nowrap">
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Empty state for now since screenshot shows empty */}
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-white/30">
                                            No data available
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 flex items-center justify-center min-h-[200px] text-white/30 text-sm">
                        {text.noGraph}
                    </div>
                )}
            </div>
        </div>
    );
}
