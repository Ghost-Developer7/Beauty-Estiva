"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

const copy = {
    en: {
        title: "Business Registration",
        steps: ["Apply", "Application Status", "Facebook Registration"],
        banner: {
            title: "SalonWP",
            subtitle: "Official WhatsApp Business Integration for You!",
            features: [
                "Connect WhatsApp Business number to SalonAppy officially",
                "View and reply to incoming messages from panel for free",
                "Give limited access to staff without sharing WhatsApp account",
                "Send reminders and satisfaction messages via WhatsApp",
                "Create appointments from message screen",
                "Easy messaging with auto-translate for foreign clients",
                "SalonBot auto-replies to FAQs"
            ]
        },
        faq: [
            {
                q: "What is SalonWP?",
                a: "We worked hard behind the scenes to make life easier for you and your clients. Result: SalonWP! SalonWP represents the official integration between SalonAppy and WhatsApp Business accounts. As a certified Meta Business Partner, we allow you to connect your existing WhatsApp Business account to SalonAppy and combine the advantages of both platforms."
            },
            {
                q: "How are messages sent via integration priced?",
                a: "We do not charge any fee for integration between WhatsApp Business account and SalonAppy account. However, messages sent via official WhatsApp Business integration are priced by Meta/Facebook. ... (truncated for brevity)"
            },
            {
                q: "Outgoing WhatsApp Business Message types are:",
                a: [
                    "Authentication: Codes sent for login verification",
                    "Utility: Appointment reminders, reservation confirmations etc.",
                    "Marketing: Promotions, special offers, celebration messages etc."
                ]
            }
        ],
        button: "Apply"
    },
    tr: {
        title: "İşletme Kaydı",
        steps: ["Başvur", "Başvuru Durumu", "Facebook Kaydı"],
        banner: {
            title: "SalonWP", // Salon[WP] style icon
            subtitle: "Resmi WhatsApp Business Entegrasyonu Sizlerle!",
            features: [
                "WhatsApp Business numaranı resmi yöntemle SalonAppy'ye bağla",
                "Gelen mesajları SalonAppy panelinden ücretsiz görüntüle ve yanıtla",
                "WhatsApp hesabını paylaşmadan personellerine kısıtlı erişim ver",
                "Hatırlatma ve memnuniyet mesajları WhatsApp üzerinden gitsin",
                "Mesaj ekranından randevu oluştur",
                "Yabancı müşterilerinle otomatik çeviri özelliğiyle kolayca mesajlaş",
                "Müşterilerin sık sorduğu sorulara SalonBot otomatik yanıtlar versin"
            ]
        },
        faq: [
            {
                q: "SalonWP nedir?",
                a: "Hem sizin hem de müşterilerinizin hayatını kolaylaştırmak için perde arkasında çok çalıştık. Uzun çabalarımızın sonucu olarak, işte yeni hizmetimiz: SalonWP! SalonWP, SalonAppy ve WhatsApp Business hesapları arasındaki resmi entegrasyondur. Sertifikalı bir Meta İş Ortağı (Meta Business Partner) olarak, mevcut WhatsApp Business hesabınızı SalonAppy hesabınıza bağlamanıza ve her iki platformun avantajlarını birleştirmenize olanak tanıyoruz!"
            },
            {
                q: "Entegrasyon aracılığıyla gönderdiğim mesajlar nasıl fiyatlandırılır?",
                a: "WhatsApp Business hesabınız ve SalonAppy hesabınız arasındaki entegrasyon için herhangi bir ücret talep etmiyoruz. Ancak, resmi WhatsApp Business entegrasyonu aracılığıyla gönderilen mesajlar ücretlidir ve kullanım miktarına bağlı olarak Meta tarafından doğrudan sizin kendi Meta/Facebook hesabınıza faturalandırılır."
            },
            {
                q: "Giden WhatsApp Business Mesaj türleri şunlardır:",
                a: [
                    "Authentication (Doğrulama mesajları): Doğrulama kodları gibi kimlik doğrulama için gönderilen mesajlar",
                    "Utility (Hizmet mesajları): Randevu hatırlatıcıları, rezervasyon onayları vb. için gönderilen mesajlar",
                    "Marketing (Pazarlama mesajları): Promosyonlar, özel teklifler, kutlamalar vb. için gönderilen mesajlar"
                ]
            }
        ],
        button: "Başvur"
    },
};

export default function WhatsappRegistrationScreen() {
    const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
    const text = copy[language];

    return (
        <div className={`space-y-8 ${isDark ? "text-white" : "text-gray-900"}`}>
            {/* Header */}
            <h1 className="text-2xl font-semibold">{text.title}</h1>

            {/* Stepper */}
            <div className="w-full relative px-4 md:px-10">
                <div className={`absolute top-1/2 left-0 w-full h-0.5 ${isDark ? "bg-white/10" : "bg-gray-100"} -z-10 -translate-y-[15px]`}></div>
                <div className="flex justify-between">
                    {text.steps.map((step, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 bg-[#040309] px-2 md:px-4">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${i === 0 ? 'bg-green-500 text-white' : 'bg-white/10 text-white/40'}`}>
                                {i + 1}
                            </div>
                            <span className={`text-[10px] md:text-xs ${i === 0 ? 'text-white' : 'text-white/40'}`}>{step}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Content (FAQ) */}
                <div className="space-y-8">
                    {text.faq.map((item, i) => (
                        <div key={i} className="space-y-2">
                            <h3 className="font-semibold text-sm md:text-base text-white/90">{item.q}</h3>
                            {Array.isArray(item.a) ? (
                                <ul className={`list-disc pl-5 space-y-1 text-xs md:text-sm ${isDark ? "text-white/60" : "text-gray-600"}`}>
                                    {item.a.map((li, j) => <li key={j}>{li}</li>)}
                                </ul>
                            ) : (
                                <p className={`text-xs md:text-sm ${isDark ? "text-white/60" : "text-gray-600"} leading-relaxed`}>{item.a}</p>
                            )}
                        </div>
                    ))}

                    <button className={`rounded-full bg-[#00a651] px-12 py-3 text-sm font-bold ${isDark ? "text-white" : "text-gray-900"} shadow-lg shadow-green-900/40 hover:bg-[#008f45] transition transform hover:scale-105`}>
                        {text.button}
                    </button>
                </div>

                {/* Right Banner (Green) */}
                <div className={`rounded-3xl bg-[#00a651] p-8 ${isDark ? "text-white" : "text-gray-900"} shadow-2xl relative overflow-hidden`}>
                    {/* Decorative circles */}
                    <div className={`absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 rounded-full ${isDark ? "bg-white/10" : "bg-gray-100"} blur-3xl`}></div>
                    <div className={`absolute bottom-0 left-0 -ml-10 -mb-10 h-40 w-40 rounded-full ${isDark ? "bg-white/10" : "bg-gray-100"} blur-3xl`}></div>

                    <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                        <div className="flex items-center gap-2 text-2xl font-bold">
                            <span>Salon</span>
                            <span className="rounded bg-black/20 px-2 border-2 border-dashed border-white/40">WP</span>
                        </div>

                        <div className="bg-white rounded-xl px-6 py-2">
                            <h2 className="text-lg font-bold text-[#00a651]">{text.banner.subtitle}</h2>
                        </div>

                        <ul className="space-y-4 text-left w-full mt-4">
                            {text.banner.features.map((feature, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm font-medium">
                                    <div className="mt-1 min-w-[20px] h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">✓</div>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        {/* Chat Icon Bottom Right */}
                        <div className="absolute bottom-4 right-4 text-white/20">
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" /></svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
