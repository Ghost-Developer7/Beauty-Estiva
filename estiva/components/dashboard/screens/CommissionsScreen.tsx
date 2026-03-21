"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const copy = {
    en: {
        title: "Appointment Commissions",
        placeholder: "Search",
        table: {
            cols: ["Service date", "Customer", "Services", "Price", "Commission amount", "Customer confirmation", "Objection status"],
            empty: "Total commission amount: 0 TL"
        }
    },
    tr: {
        title: "Randevu Komisyonları",
        placeholder: "Ara",
        table: {
            cols: ["Hizmet tarihi", "Müşteri", "Hizmetler", "Fiyat", "Komisyon tutarı", "Müşteri teyidi", "İtiraz durumu"],
            empty: "Toplam komisyon tutarı: 0 TL"
        }
    },
};

export default function CommissionsScreen() {
    const { language } = useLanguage();
    const text = copy[language];

    return (
        <div className="space-y-6 text-white h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">{text.title}</h1>

                <div className="relative min-w-[120px]">
                    <select className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none">
                        <option className="bg-[#1a1a1a]">Bu ay</option>
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40">v</div>
                </div>
            </div>

            {/* Toolbar */}
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
                        📄 İndir
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-white/5 text-xs font-semibold uppercase text-white/60">
                            <tr>
                                {text.table.cols.map((col, i) => (
                                    <th key={i} className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 cursor-pointer hover:text-white">
                                            {col}
                                            {/* Filter Icon placeholder */}
                                            <span className="opacity-50 text-[10px]">▼</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <tr className="bg-white/[0.02]">
                                <td colSpan={7} className="px-6 py-4 font-bold text-white/60">
                                    {text.table.empty}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
