"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

const copy = {
    en: {
        title: "POS Application",
        steps: ["Get Info", "Fill Form", "Upload Docs", "Review"],
        banner: {
            title: "SalonPOS",
            subtitle: "Ödeal Cooperation",
            features: [
                "%3.49 Single Shot Commission*",
                "Next Business Day Payment",
                "Installments for All Credit Cards",
                "Free E-invoice POS Device",
                "SalonAppy Integration",
                "Customer Service Support",
                "Easy E-invoice Transition",
                "Unlimited Withdrawal",
                "Compliant with Latest Regulations"
            ],
            footnote: "*Lower rates available for high volume businesses"
        },
        table: {
            headers: ["EFT-POS", "YN-ÖKC (Register) POS", "GMU (VUK 507) E-Invoice POS"],
            rows: [
                ["Usage after Nov 15, 2024", false, true, true],
                ["Usage over 3000 ₺ after Jan 1, 2025", false, false, true],
                ["Usage after Jan 1, 2026", false, "!", true],
                ["Sales software integration mandatory", false, "!", true],
                ["E-invoice / E-archive issuance", false, false, true],
                ["Incoming e-invoice feature", false, false, true],
            ],
            types: [
                "Old type, button-based, payment-only devices",
                "Old type, button-based, payment-only devices",
                "New generation, smart Android devices capable of running different apps"
            ]
        },
        buttons: {
            physical: "Get Info for Physical + Virtual POS",
            virtual: "Get Info for Virtual POS"
        }
    },
    tr: {
        title: "POS başvurusu",
        steps: ["Bilgi al", "Formu doldur", "Belgelerinizi yükleyin", "İnceleniyor"],
        banner: {
            title: "SalonPOS",
            subtitle: "Ödeal İşbirliğiyle",
            features: [
                "%3.49 Tek Çekim Komisyonu*",
                "Ertesi İş Günü Ödeme",
                "Tüm Kredi Kartlarına Taksit",
                "Kiralık E-fatura POS Cihazı",
                "SalonAppy Entegrasyonu",
                "Müşteri Temsilcisi Desteği",
                "Kolay E-fatura Geçişi",
                "Karttan Limitsiz Çekim İmkanı",
                "En Güncel Mevzuata Uyumluluk"
            ],
            footnote: "*Aylık işlem hacmi yüksek işletmeler için daha da düşük oran imkanı"
        },
        table: {
            headers: ["EFT-POS", "YN-ÖKC (Yazarkasa) POS", "GMU (VUK 507) E-Fatura POS"],
            rows: [
                ["15 Kasım 2024 sonrası kullanım", false, true, true],
                ["1 Ocak 2025 sonrası 3000 ₺ üzeri ödemelerde kullanım", false, false, true],
                ["1 Ocak 2026 sonrası kullanım", false, "!", true],
                ["Satış yazılımı entegrasyon zorunluluğu mevzuatına uyumluluk", false, "!", true],
                ["E-fatura / E-arşiv kesme özelliği", false, false, true],
                ["Gelen e-fatura özelliği", false, false, true],
            ],
            types: [
                "Eski tip, tuşlu ve sadece ödeme almak için kullanılabilen pos cihazları 👎",
                "Eski tip, tuşlu ve sadece ödeme almak için kullanılabilen pos cihazları 👎",
                "Yeni nesil, farklı uygulamaların da kurularak kullanılabildiği akıllı Android cihazlar 👍"
            ]
        },
        buttons: {
            physical: "Fiziksel + Sanal POS İçin Bilgi Al",
            virtual: "Sanal POS İçin Bilgi Al"
        }
    },
};

export default function PosApplicationScreen() {
    const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
    const text = copy[language];

    const CheckIcon = () => <span className={`flex h-5 w-5 items-center justify-center rounded bg-green-500 text-xs ${isDark ? "text-white" : "text-gray-900"}`}>✓</span>;
    const CrossIcon = () => <span className={`flex h-5 w-5 items-center justify-center rounded bg-red-500 text-xs ${isDark ? "text-white" : "text-gray-900"}`}>✕</span>;
    const ExclaimIcon = () => <span className={`flex h-5 w-5 items-center justify-center rounded bg-yellow-500 text-xs ${isDark ? "text-white" : "text-gray-900"} font-bold`}>!</span>;

    const renderStatus = (status: boolean | string) => {
        if (status === true) return <div className="flex justify-center"><CheckIcon /></div>;
        if (status === false) return <div className="flex justify-center"><CrossIcon /></div>;
        if (status === "!") return <div className="flex justify-center"><ExclaimIcon /></div>;
        return status;
    };

    return (
        <div className={`space-y-8 ${isDark ? "text-white" : "text-gray-900"}`}>
            {/* Header */}
            <h1 className="text-2xl font-semibold">{text.title}</h1>

            {/* Stepper */}
            <div className="w-full relative px-10">
                <div className={`absolute top-1/2 left-0 w-full h-0.5 ${isDark ? "bg-white/10" : "bg-gray-100"} -z-10 -translate-y-[15px]`}></div>
                <div className="flex justify-between">
                    {text.steps.map((step, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 bg-[#040309] px-4">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${i === 0 ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/40'}`}>
                                {i + 1}
                            </div>
                            <span className={`text-xs ${i === 0 ? 'text-white' : 'text-white/40'}`}>{step}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Info */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Banner */}
                <div className={`lg:col-span-3 rounded-3xl bg-gradient-to-b from-[#db2777] to-[#be185d] p-6 ${isDark ? "text-white" : "text-gray-900"} shadow-2xl relative overflow-hidden`}>
                    <div className={`absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 rounded-full ${isDark ? "bg-white/10" : "bg-gray-100"} blur-3xl`}></div>

                    <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                        <div className="rounded-xl bg-white px-4 py-2">
                            <h2 className="text-xl font-bold text-[#be185d]">{text.banner.title}</h2>
                        </div>
                        <p className="font-medium text-white/90">{text.banner.subtitle}</p>

                        {/* Placeholder for POS Image */}
                        <div className="h-32 w-full bg-white/20 rounded-xl backdrop-blur-sm flex items-center justify-center">
                            <span className="text-4xl">💳</span>
                        </div>

                        <ul className="space-y-3 text-left w-full mt-4">
                            {text.banner.features.map((feature, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs font-medium">
                                    <span className="mt-0.5">⭐</span>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <p className={`text-[10px] ${isDark ? "text-white/60" : "text-gray-600"} mt-4`}>{text.banner.footnote}</p>
                    </div>
                </div>

                {/* Right Comparison Table */}
                <div className="lg:col-span-9 space-y-6">
                    <div className={`rounded-3xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} p-6 overflow-x-auto`}>
                        <div className="grid grid-cols-4 gap-4 text-center text-xs min-w-[500px]">
                            {/* Headers */}
                            <div className="col-span-1"></div> {/* Empty corner */}
                            <div className="col-span-1 rounded-t-xl bg-red-500/10 p-4 font-bold text-red-400 border border-red-500/20">
                                {text.table.headers[0]}
                            </div>
                            <div className="col-span-1 rounded-t-xl bg-yellow-500/10 p-4 font-bold text-yellow-400 border border-yellow-500/20">
                                {text.table.headers[1]}
                            </div>
                            <div className="col-span-1 rounded-t-xl bg-green-500/20 p-4 font-bold text-green-400 border border-green-500/20 flex flex-col items-center justify-center">
                                <span>✨ {text.banner.title} ✨</span>
                                <span>{text.table.headers[2]}</span>
                            </div>

                            {/* Description Rows */}
                            <div className={`col-span-1 text-left py-4 ${isDark ? "text-white/60" : "text-gray-600"}`}>Device Description</div>
                            <div className={`col-span-1 bg-red-500/5 p-4 text-[10px] ${isDark ? "text-white/60" : "text-gray-600"} border-x border-red-500/10`}>{text.table.types[0]}</div>
                            <div className={`col-span-1 bg-yellow-500/5 p-4 text-[10px] ${isDark ? "text-white/60" : "text-gray-600"} border-x border-yellow-500/10`}>{text.table.types[1]}</div>
                            <div className={`col-span-1 bg-green-500/10 p-4 text-[10px] ${isDark ? "text-white/80" : "text-gray-800"} font-medium border-x border-green-500/20`}>{text.table.types[2]}</div>


                            {/* Data Rows */}
                            {text.table.rows.map((row, i) => (
                                <div key={i} className={`col-span-4 grid grid-cols-4 border-t ${isDark ? "border-white/5" : "border-gray-100"} items-center`}>
                                    <div className={`col-span-1 text-left py-4 pr-4 font-medium ${isDark ? "text-white/80" : "text-gray-800"}`}>{row[0]}</div>
                                    <div className="col-span-1 h-full py-4 flex items-center justify-center bg-red-500/5 border-x border-red-500/10">{renderStatus(row[1])}</div>
                                    <div className="col-span-1 h-full py-4 flex items-center justify-center bg-yellow-500/5 border-x border-yellow-500/10">{renderStatus(row[2])}</div>
                                    <div className="col-span-1 h-full py-4 flex items-center justify-center bg-green-500/10 border-x border-green-500/20">{renderStatus(row[3])}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button className={`flex items-center justify-center rounded-2xl bg-[#00a651] p-4 text-sm font-bold ${isDark ? "text-white" : "text-gray-900"} shadow-lg shadow-green-900/20 hover:bg-[#008f45] transition transform hover:scale-[1.02]`}>
                            {text.buttons.physical}
                        </button>
                        <button className={`flex items-center justify-center rounded-2xl bg-[#3b82f6] p-4 text-sm font-bold ${isDark ? "text-white" : "text-gray-900"} shadow-lg shadow-blue-900/20 hover:bg-[#2563eb] transition transform hover:scale-[1.02]`}>
                            {text.buttons.virtual}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
