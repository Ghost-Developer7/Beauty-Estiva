"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const customers = [
    {
        id: 1,
        name: "Şaziye Hanım",
        fileNo: "",
        phone: "+90 531 792 25 22",
        registered: "10 Nis 2025",
        lastAppt: "05 May 2025",
        count: 4,
        points: "0 TL",
        discount: "%0",
        banned: false,
    },
    {
        id: 2,
        name: "Ceren Hanım",
        fileNo: "",
        phone: "+90 553 873 65 30",
        registered: "10 Nis 2025",
        lastAppt: "21 May 2025",
        count: 4,
        points: "0 TL",
        discount: "%0",
        banned: false,
    },
    {
        id: 3,
        name: "Fırat Bey",
        fileNo: "",
        phone: "+90 532 057 32 98",
        registered: "10 Nis 2025",
        lastAppt: "21 May 2025",
        count: 4,
        points: "0 TL",
        discount: "%0",
        banned: false,
    },
    {
        id: 4,
        name: "Şükran Hanım Cullinan",
        fileNo: "",
        phone: "+90 553 626 69 39",
        registered: "10 Nis 2025",
        lastAppt: "18 Nis 2025",
        count: 2,
        points: "0 TL",
        discount: "%0",
        banned: false,
    },
    {
        id: 5,
        name: "Viktoriya Hanım",
        fileNo: "",
        phone: "+90 537 681 56 76",
        registered: "10 Nis 2025",
        lastAppt: "19 May 2025",
        count: 2,
        points: "0 TL",
        discount: "%0",
        banned: false,
    },
    {
        id: 6,
        name: "Sultan Hanım",
        fileNo: "",
        phone: "+90 505 387 15 63",
        registered: "10 Nis 2025",
        lastAppt: "22 Nis 2025",
        count: 2,
        points: "0 TL",
        discount: "%0",
        banned: false,
    },
    {
        id: 7,
        name: "Berrin Taş",
        fileNo: "",
        phone: "+90 533 072 14 54",
        registered: "10 Nis 2025",
        lastAppt: "11 Nis 2025",
        count: 1,
        points: "0 TL",
        discount: "%0",
        banned: false,
    },
    {
        id: 8,
        name: "Sriwahyu",
        fileNo: "",
        phone: "+90 538 735 39 60",
        registered: "10 Nis 2025",
        lastAppt: "14 Nis 2025",
        count: 1,
        points: "0 TL",
        discount: "%0",
        banned: false,
    },
    {
        id: 9,
        name: "Selma Temiz Hanım",
        fileNo: "",
        phone: "+90 543 776 20 55",
        registered: "10 Nis 2025",
        lastAppt: "11 Nis 2025",
        count: 1,
        points: "0 TL",
        discount: "%0",
        banned: false,
    },
];

const copy = {
    en: {
        title: "Customers",
        filter: "Filter",
        sort: "Filter / Sort",
        detailedSearch: "Detailed search",
        new: "New",
        headers: [
            "Client",
            "File No",
            "Phone",
            "Registered",
            "Last appt",
            "Appt count",
            "Points",
            "Discount",
            "Ban",
            "",
        ],
        export: "Export",
        import: "Import",
        download: "Download",
        recordCount: "Total record count",
    },
    tr: {
        title: "Müşteriler",
        filter: "Filtrele",
        sort: "Filtrele / Sırala",
        detailedSearch: "Detaylı arama",
        new: "Yeni",
        headers: [
            "Müşteri",
            "Dosya No",
            "Telefon numarası",
            "Kayıt tarihi",
            "Son randevusu",
            "Randevu sayısı",
            "Mevcut parapuan",
            "İndirim",
            "Yasak",
            "",
        ],
        export: "İçe aktar",
        import: "İçe aktar",
        download: "İndir",
        recordCount: "Toplam kayıt sayısı",
    },
};

export default function CustomersScreen() {
    const { language } = useLanguage();
    const text = copy[language];

    return (
        <div className="space-y-4 text-white">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-semibold">
                        {text.title} <span className="text-white/40">({customers.length})</span>
                    </h1>
                    <button className="flex items-center gap-2 rounded-xl bg-[#4b5563] px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-[#374151]">
                        <span className="text-[10px]">Y</span> {text.filter}
                    </button>
                </div>
                <button className="flex items-center gap-2 rounded-xl bg-[#00a651] px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-green-900/20 hover:bg-[#008f45]">
                    + {text.new}
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-2">
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 rounded-lg bg-[#4b5563] px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#374151]">
                        <span className="text-[10px]">Y</span> {text.sort}
                    </button>
                    <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-transparent px-4 py-2 text-xs font-medium text-white/70 hover:bg-white/5 hover:text-white">
                        <span className="text-sm">🔍</span> {text.detailedSearch}
                    </button>
                </div>

                <div className="flex gap-2">
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4b5563] text-white hover:bg-[#374151]">
                        <span className="text-xs">⚙️</span>
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4b5563] text-white hover:bg-[#374151]">
                        <span className="text-xs">↻</span>
                    </button>
                    <div className="flex rounded-lg bg-[#4b5563] p-0.5">
                        <button className="rounded px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10">
                            {text.download} v
                        </button>
                        <div className="my-1.5 w-px bg-white/10"></div>
                        <button className="rounded px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10">
                            {text.import} v
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_15px_40px_rgba(3,2,9,0.5)]">
                <table className="w-full text-left text-[10px] md:text-sm">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5 font-semibold text-white/50">
                            {text.headers.map((label, i) => (
                                <th key={i} className="px-4 py-3 whitespace-nowrap">
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {customers.map((customer) => (
                            <tr
                                key={customer.id}
                                className="group transition hover:bg-white/5"
                            >
                                <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                                    {customer.name}
                                </td>
                                <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                                    {customer.fileNo}
                                </td>
                                <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                                    {customer.phone}
                                </td>
                                <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                                    {customer.registered}
                                </td>
                                <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                                    {customer.lastAppt}
                                </td>
                                <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                                    {customer.count}
                                </td>
                                <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                                    {customer.points}
                                </td>
                                <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                                    {customer.discount}
                                </td>
                                <td className="px-4 py-3">
                                    {/* Ban column empty per screenshot */}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button className="flex h-7 w-7 items-center justify-center rounded bg-[#3b82f6] text-white shadow hover:bg-[#2563eb]">
                                            <span className="text-[10px]">🔍</span>
                                        </button>
                                        <button className="flex h-7 w-7 items-center justify-center rounded bg-[#3b82f6] text-white shadow hover:bg-[#2563eb]">
                                            <span className="text-[10px]">✎</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Footer */}
                <div className="border-t border-white/10 bg-white/5 p-3 text-[10px] font-medium text-white/60">
                    {text.recordCount}: {customers.length}
                </div>
            </div>
        </div>
    );
}
