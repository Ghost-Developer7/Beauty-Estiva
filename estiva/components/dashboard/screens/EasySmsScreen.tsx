"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const copy = {
    en: {
        title: "Netgsm Installation",
        alert: "You are responsible for all legal and penal liabilities of SMS transmissions... (truncated)",
        content: {
            linkText: "Click here",
            intro: "to create a Netgsm account. Select Bulk SMS in the Service part in the first step of the application form..."
        },
        stepsTitle: "After Creating Netgsm Account:",
        steps: [
            "Step 1: Go to Netgsm | Online Transactions.",
            "Step 2: Click 'Create Sub-User' to enable API SMS sending.",
            "Step 3: Fill in the personal information in the form.",
            "Step 4: Select 'API User' as the Sub-User Type.",
            "Step 5: For 'Commercial Content Sending Status':",
            "Step 6: Enable the API toggle next to 'SMS Service' in the authorization step.",
            "Step 7: Share your login details with your customer representative after registration."
        ],
        step5bullets: [
            "If only informational SMS will be sent (not commercial/campaigns), select the last option 'Informational, cargo, password etc. (Not queried from IYS)'.",
            "If you want to send commercial messages in accordance with regulations, select the first option. In this case, you must have an IYS account and register consents."
        ],
        createLink: "click here",
        createIntro: "To create a Netgsm account"
    },
    tr: {
        title: "Netgsm Kurulum",
        alert: "Yaptığınız SMS gönderimlerinin tüm yasal ve cezai yükümlülüğü size ait olup, Elektronik Ticaretin Düzenlenmesi Hakkında Kanun uyarınca, ticari maksatlı SMS gönderimi yapacağınız numaralardan daha önce ticari ileti izni alarak firmanıza ait İleti Yönetim Sistemi hesabınıza (İYS) kayıt etmiş olmanız gerekmektedir. Ticari ileti izni aldığınız numaralara gönderim yaparken, ücretsiz bir numaraya SMS göndererek SMS ret seçeceği sunulması ve firmanıza ait MERSİS numarasının gönderilen SMS içeriğinde belirtilmesi kanunen zorunludur. İziniz veya gerekli yükümlülükler yerine getirilmeksizin yapılan gönderimler için alıcıların şikayet etmesi durumunda, İl Ticaret Müdürlükleri tarafından gönderilen her bir SMS için yüklü miktarda para cezaları kesilmektedir.",
        stepsTitle: "Netgsm Hesabı Oluşturulduktan Sonra:",
        steps: [
            "1. Adım: Netgsm | Online İşlemler adresine girilir.",
            "2. Adım: Netgsm hesabının API üzerinden SMS gönderimine açılması için \"Alt Kullanıcı Oluştur\" butonuna tıklanır.",
            "3. Adım: Açılan sayfada formdaki ilgili kısımlardaki kişisel bilgiler doldurulur.",
            "4. Adım: \"Alt Kullanıcı Türü\" kısmında \"API kullanıcısı\" seçilir.",
            "5. Adım: \"Ticari İçerik Gönderim Durumu\" seçiminde:",
            "6. Adım: Kullanıcı yetkilendirme seçimi adımında \"SMS Hizmeti\" satırının sağındaki API toggle'ı aktif hale getirilir.",
            "7. Adım: Kayıt işlemi tamamlandıktan sonra giriş bilgilerinizi müşteri temsilciniz ile paylaşınız."
        ],
        step5bullets: [
            "Eğer SMS hesabından kampanya/ticari ileti gönderilmeyecek, yalnızca bilgilendirme SMS'leri için kullanılacaksa, son sıradaki \"Bilgilendirme, kargo, şifre vb. (İYS'den sorgulanmaz)\" seçilir.",
            "Eğer yasalara uygun şekilde kampanya/ticari ileti de göndermek isteniyorsa burada ilk sıradaki \"Kampanya, tanıtım, kutlama vb. (İYS'de Bireysel kayıtlı alıcılarınıza gönderilir.)\" seçilir. Bu durumda İYS sisteminde firma hesabı oluşturulması ve SMS gönderilebilmesi için alınan izinlerin İYS sistemine kayıt edilmesi gerekmektedir."
        ],
        createLink: "buraya tıklayınız",
        createIntro: "Netgsm hesabı oluşturmak için"
    },
};

export default function EasySmsScreen() {
    const { language } = useLanguage();
    const text = copy[language];

    return (
        <div className="space-y-6 text-white w-full">
            {/* Alert Box */}
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-6 text-xs md:text-sm text-yellow-200/80 leading-relaxed flex gap-4">
                <span className="text-2xl">⚠</span>
                <p>{text.alert}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 space-y-6">
                <h1 className="text-2xl font-semibold">{text.title}</h1>

                <div className="text-sm text-white/70">
                    <p>
                        {text.createIntro} <a href="#" className="text-blue-400 hover:underline font-bold">{text.createLink}</a>.
                    </p>
                    <p className="mt-2">Başvuru formunda ilk adımda <b>Hizmet</b> kısmında <b>Toplu SMS</b> seçilir. Diğer tüm kısımlar başvuru sahibinin bilgileriyle doldurularak 2. ve 3. adımlarla birlikte başvuru tamamlanır.</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/10">
                    <h2 className="text-xl font-semibold opacity-90">{text.stepsTitle}</h2>

                    <ul className="space-y-4 text-sm text-white/70">
                        {text.steps.map((step, i) => {
                            // Handle Step 5 specially to inject bullets
                            // Using index 4 for Step 5 (0-indexed)
                            if (i === 4) {
                                return (
                                    <li key={i} className="space-y-2">
                                        <p className="font-medium text-white/90">{step}</p>
                                        <ul className="list-disc pl-6 space-y-2 text-white/60">
                                            {text.step5bullets.map((b, j) => <li key={j}>{b}</li>)}
                                        </ul>
                                    </li>
                                );
                            }
                            return (
                                <li key={i}>
                                    <span className="font-medium text-white/90">{step.split(':')[0]}:</span>
                                    <span>{step.split(':')[1]}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
}
