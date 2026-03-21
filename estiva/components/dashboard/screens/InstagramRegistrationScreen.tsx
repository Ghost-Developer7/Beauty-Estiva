"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const copy = {
    en: {
        title: "Business Registration",
        steps: ["Apply", "Application Status", "Instagram Registration"],
        banner: {
            subtitle: "Free SalonDM with you!",
            features: [
                "Connect Instagram Business account to SalonAppy without password",
                "View and reply to incoming DMs from SalonAppy panel",
                "Give limited DM access to staff without sharing Instagram password",
                "Match clients with Instagram accounts",
                "Create appointments from DM screen",
                "Easy messaging with auto-translate for foreign clients",
                "Optional BOT integration*"
            ],
            footnote: "*SalonBot can auto-reply to FAQs and create appointments"
        },
        guideSteps: [
            {
                id: 1,
                title: "Log in to your Instagram Account",
                desc: "Log in with your Instagram account to use the services offered by Instagram."
            },
            {
                id: 2,
                title: "Give Access Permission",
                desc: "Give necessary permissions to pair your Instagram account with SalonAppy."
            },
            {
                id: 3,
                title: "Start Using Instagram",
                desc: "After pairing your Instagram account with SalonAppy, you can use the messaging services offered by Instagram."
            }
        ],
        button: "Login with Instagram"
    },
    tr: {
        title: "İşletme Kaydı",
        steps: ["Başvur", "Başvuru Durumu", "Instagram Kaydı"],
        banner: {
            subtitle: "Ücretsiz SalonDM Sizlerle!",
            features: [
                "Instagram Business hesabını şifreni SalonAppy'ye girmeksizin bağla",
                "Gelen DM'leri SalonAppy panelinden görüntüle ve yanıtla",
                "Instagram şifreni paylaşmadan personellerine kısıtlı DM erişimi ver",
                "Müşteri Instagram hesaplarıyla SalonAppy müşterilerini eşleştir",
                "DM ekranından randevu oluştur",
                "Yabancı müşterilerinle otomatik çeviri özelliğiyle kolayca mesajlaş",
                "İsteğe bağlı BOT entegrasyonu*"
            ],
            footnote: "*Müşterilerin sık sorduğu sorulara SalonBot otomatik yanıtlar versin, randevularını oluşturabilsin"
        },
        guideSteps: [
            {
                id: 1,
                title: "Instagram Hesabınıza Giriş Yapın",
                desc: "Instagram hesabınızla giriş yaparak, Instagram'ın sunduğu hizmetleri kullanabilirsiniz."
            },
            {
                id: 2,
                title: "Erişim İzni Verin",
                desc: "SalonAppy ile Instagram hesabınızı eşleştirmek için gerekli izinleri veriniz."
            },
            {
                id: 3,
                title: "Instagram'ı Kullanmaya Başlayın",
                desc: "Instagram hesabınızı SalonAppy ile eşleştirdikten sonra, Instagram'ın sunduğu mesajlaşma hizmetlerini kullanabilirsiniz."
            }
        ],
        button: "Instagram ile Giriş Yap"
    },
};

export default function InstagramRegistrationScreen() {
    const { language } = useLanguage();
    const text = copy[language];

    return (
        <div className="space-y-8 text-white">
            {/* Header */}
            <h1 className="text-2xl font-semibold">{text.title}</h1>

            {/* Stepper */}
            <div className="w-full relative px-4 md:px-10">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10 -translate-y-[15px]"></div>
                <div className="flex justify-between">
                    {text.steps.map((step, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 bg-[#040309] px-2 md:px-4">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${i === 2 ? 'bg-[#c13584] text-white' : i < 2 ? 'bg-white/10 text-white/50' : 'bg-white/10 text-white/40'}`}>
                                {i + 1}
                            </div>
                            <span className={`text-[10px] md:text-xs ${i === 2 ? 'text-white' : 'text-white/40'}`}>{step}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Content (Guide + Button) */}
                <div className="flex flex-col justify-center items-center lg:items-start space-y-8 p-6 bg-white/5 rounded-3xl border border-white/10">
                    <div className="space-y-6 w-full">
                        {text.guideSteps.map((step) => (
                            <div key={step.id} className="flex gap-4 items-start group">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888] font-bold text-white shadow-lg">
                                    {step.id}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-white group-hover:text-pink-400 transition">{step.title}</h3>
                                    <p className="text-sm text-white/60 leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="w-full flex justify-center pt-4">
                        <button className="rounded-xl bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] px-8 py-3 text-sm font-bold text-white shadow-lg hover:opacity-90 transition transform hover:scale-105">
                            {text.button}
                        </button>
                    </div>
                </div>

                {/* Right Banner (Pink/Red Gradient) */}
                <div className="rounded-3xl bg-gradient-to-br from-[#be185d] to-[#9d174d] p-8 text-white shadow-2xl relative overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-10 -mb-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>

                    <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                        <div className="flex items-center gap-2 text-3xl font-bold">
                            <span>Instagram</span>
                        </div>

                        <div className="bg-white rounded-xl px-6 py-2">
                            <h2 className="text-lg font-bold text-[#be185d]">{text.banner.subtitle}</h2>
                        </div>

                        <ul className="space-y-4 text-left w-full mt-4">
                            {text.banner.features.map((feature, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm font-medium">
                                    <div className="mt-1 min-w-[20px] h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] transform rotate-45">📌</div>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-4 border-t border-white/20 pt-4 w-full">
                            <p className="text-xs text-white/80 font-semibold">{text.banner.footnote}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
