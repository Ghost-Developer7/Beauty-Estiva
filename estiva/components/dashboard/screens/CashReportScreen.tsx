"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

const copy = {
    en: {
        title: "Cash report",
        datePlaceholder: "This month",
        download: "Download",
        rows: {
            total: "Total",
            cash: "Cash Total",
            card: "Credit card Total",
            transfer: "Wire Total",
            online: "Online payment Total",
            other: "Other Total",
            income: "Income total",
            labels: ["Cash", "Credit card", "Wire", "Online payment", "Other"]
        }
    },
    tr: {
        title: "Kasa raporu",
        datePlaceholder: "Bu ay",
        download: "İndir",
        rows: {
            total: "Toplam",
            cash: "Nakit Toplam",
            card: "Kredi kartı Toplam",
            transfer: "Havale Toplam",
            online: "Online ödeme Toplam",
            other: "Diğer Toplam",
            income: "Gelirler toplamı",
            incomeCash: "Nakit",
            incomeCard: "Kredi kartı",
            labels: ["Nakit", "Kredi kartı", "Havale", "Online ödeme", "Diğer"]
        }
    },
};

export default function CashReportScreen() {
    const { language } = useLanguage();
    const text = copy[language];
    const [expanded, setExpanded] = useState<Record<string, boolean>>({
        total: true, // Default open per screenshot
        income: true,
    });

    const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className="space-y-6 text-white">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold">{text.title}</h1>

                <div className="flex items-center gap-3">
                    <div className="relative min-w-[120px]">
                        <select className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none">
                            <option className="bg-[#1a1a1a]">{text.datePlaceholder}</option>
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40">v</div>
                    </div>
                    <button className="flex items-center gap-2 rounded-xl bg-[#4b5563] px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#374151]">
                        ⬇ {text.download}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-4">

                {/* Section: Total */}
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    <div
                        onClick={() => toggle('total')}
                        className="flex cursor-pointer items-center justify-between px-6 py-4 transition hover:bg-white/5"
                    >
                        <div className="flex items-center gap-4">
                            <span className={`text-white/60 transition-transform ${expanded.total ? 'rotate-90' : ''}`}>›</span>
                            <span className="font-medium text-sm">{text.rows.total}</span>
                        </div>
                        <span className="font-medium text-sm">0,00 TL</span>
                    </div>

                    {expanded.total && (
                        <div className="border-t border-white/10 px-8 py-2 bg-white/[0.02]">
                            {[text.rows.cash, text.rows.card, text.rows.transfer, text.rows.online, text.rows.other].map((label, i) => (
                                <div key={i} className="flex items-center justify-between py-3 pl-6 border-b border-white/5 last:border-0 text-xs text-white/60">
                                    <span>{label}</span>
                                    <span>0,00 TL</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Section: Income */}
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    <div
                        onClick={() => toggle('income')}
                        className="flex cursor-pointer items-center justify-between px-6 py-4 transition hover:bg-white/5"
                    >
                        <div className="flex items-center gap-4">
                            <span className={`text-white/60 transition-transform ${expanded.income ? 'rotate-90' : ''}`}>›</span>
                            <span className="font-medium text-sm">{text.rows.income}</span>
                        </div>
                        <span className="font-medium text-sm">0,00 TL</span>
                    </div>

                    {expanded.income && (
                        <div className="border-t border-white/10 px-8 py-2 bg-white/[0.02]">
                            {text.rows.labels.map((label, i) => (
                                <div key={i} className="flex items-center justify-between py-3 pl-6 border-b border-white/5 last:border-0 text-xs text-white/60">
                                    <span>{label}</span>
                                    <span>0,00 TL</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
