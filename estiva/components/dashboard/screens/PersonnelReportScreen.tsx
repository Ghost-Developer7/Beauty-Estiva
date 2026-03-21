"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

const copy = {
    en: {
        title: "Personnel report",
        datePlaceholder: "This month",
        download: "Download",
        tabs: ["Personnels", "Devices/Rooms"],
        searchPlaceholder: "Search",
        filters: {
            packageLabel: "Package turnover",
            serviceLabel: "Service turnover",
            all: "All",
        },
        total: "Total",
    },
    tr: {
        title: "Personel raporu",
        datePlaceholder: "Bu ay",
        download: "İndir",
        tabs: ["Personeller", "Cihazlar/odalar"],
        searchPlaceholder: "Ara",
        filters: {
            packageLabel: "Paket cirosu",
            serviceLabel: "Hizmet cirosu",
            all: "Tümü",
        },
        total: "Toplam",
    },
};

export default function PersonnelReportScreen() {
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

            {/* Tabs - Simple underline style per screenshot */}
            <div className="border-b border-white/10">
                <div className="flex gap-8">
                    {text.tabs.map((tab, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveTab(i)}
                            className={`pb-3 text-sm font-medium transition-all ${activeTab === i ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Toolbar / Filters */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-wrap items-center justify-between gap-4">
                <input
                    type="text"
                    placeholder={text.searchPlaceholder}
                    className="w-full md:w-64 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                />

                <div className="flex flex-1 flex-wrap gap-4 items-center justify-center md:justify-start">
                    <div className="relative min-w-[180px]">
                        <span className="absolute -top-2.5 left-2 bg-[#0a0a0a] px-1 text-[10px] text-white/60">{text.filters.packageLabel}</span>
                        <select className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none">
                            <option className="bg-[#1a1a1a]">{text.filters.all}</option>
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40">v</div>
                    </div>

                    <div className="relative min-w-[180px]">
                        <span className="absolute -top-2.5 left-2 bg-[#0a0a0a] px-1 text-[10px] text-white/60">{text.filters.serviceLabel}</span>
                        <select className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none">
                            <option className="bg-[#1a1a1a]">{text.filters.all}</option>
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40">v</div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3b82f6] text-white shadow-lg hover:bg-[#2563eb]">
                        <span className="text-xs">↻</span>
                    </button>
                    <button className="flex items-center gap-2 rounded-lg bg-[#3b82f6] px-6 py-2 text-sm font-medium text-white shadow-lg  hover:bg-[#2563eb]">
                        📄 {text.download}
                    </button>
                </div>
            </div>

            {/* Empty Content / Total */}
            <div className="border-t border-white/10 pt-4">
                <h3 className="text-sm font-semibold">{text.total}</h3>
            </div>

        </div>
    );
}
