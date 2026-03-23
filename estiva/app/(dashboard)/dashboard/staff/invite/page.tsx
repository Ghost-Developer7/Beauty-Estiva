"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { tenantService } from "@/services/tenantService";
import toast from "react-hot-toast";

const copy = {
  en: {
    title: "Invite Staff",
    desc: "Enter your staff member's email to send an invitation. They will receive a registration link and invite code via email.",
    emailLabel: "Staff Email (recommended)",
    emailPh: "staff@example.com",
    generate: "Send Invitation",
    generateNoEmail: "Generate Code Only",
    generating: "Generating...",
    successWithEmail: "Invitation sent! An email with the registration link has been sent.",
    successNoEmail: "Invite code generated. Share it with your staff member.",
    tokenLabel: "Invite Code",
    linkLabel: "Registration Link",
    copy: "Copy",
    copied: "Copied!",
    expiry: "This code expires in 24 hours and can only be used once.",
    emailSentNote: "Email sent successfully",
    emailNotSentNote: "Email could not be sent. Please share the code manually.",
    newInvite: "Create New Invite",
  },
  tr: {
    title: "Personel Davet Et",
    desc: "Personelin e-posta adresini girin, kayıt bağlantısı ve davet kodu içeren bir e-posta gönderilsin.",
    emailLabel: "Personel E-postası (önerilir)",
    emailPh: "personel@example.com",
    generate: "Davet Gönder",
    generateNoEmail: "Sadece Kod Oluştur",
    generating: "Oluşturuluyor...",
    successWithEmail: "Davet gönderildi! Kayıt bağlantısı içeren e-posta gönderildi.",
    successNoEmail: "Davet kodu oluşturuldu. Personelinizle paylaşın.",
    tokenLabel: "Davet Kodu",
    linkLabel: "Kayıt Bağlantısı",
    copy: "Kopyala",
    copied: "Kopyalandı!",
    expiry: "Bu kod 24 saat geçerlidir ve yalnızca bir kez kullanılabilir.",
    emailSentNote: "E-posta başarıyla gönderildi",
    emailNotSentNote: "E-posta gönderilemedi. Lütfen kodu manuel paylaşın.",
    newInvite: "Yeni Davet Oluştur",
  },
};

interface InviteResult {
  token: string;
  registerUrl: string;
  emailSent: boolean;
}

export default function StaffInvitePage() {
  const { language } = useLanguage();
  const text = copy[language];

  const [email, setEmail] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<InviteResult | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await tenantService.generateInviteToken(email || undefined);
      if (res.data.success && res.data.data) {
        setResult(res.data.data);
        toast.success(email ? text.successWithEmail : text.successNoEmail);
      } else {
        toast.error(res.data.error?.message || (language === "tr" ? "Oluşturma başarısız" : "Generation failed"));
      }
    } catch {
      toast.error(language === "tr" ? "Oluşturma başarısız" : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const copyText = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success(text.copied);
  };

  const handleNewInvite = () => {
    setResult(null);
    setEmail("");
  };

  return (
    <div className="space-y-6 text-white">
      <h1 className="text-3xl font-semibold">{text.title}</h1>

      <div className="max-w-2xl">
        {!result ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-5">
            <p className="text-sm text-white/50">{text.desc}</p>

            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60">{text.emailLabel}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={text.emailPh}
                disabled={generating}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition"
              >
                {generating ? text.generating : email ? text.generate : text.generateNoEmail}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Email status */}
            {email && (
              <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
                result.emailSent
                  ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border border-amber-500/30 bg-amber-500/10 text-amber-400"
              }`}>
                {result.emailSent ? text.emailSentNote : text.emailNotSentNote}
              </div>
            )}

            {/* Token */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-white/40">{text.tokenLabel}</label>
                <div className="flex items-center gap-3">
                  <code className="flex-1 rounded-xl bg-black/30 px-4 py-3 text-xl font-mono font-bold text-white tracking-[0.3em] text-center">
                    {result.token}
                  </code>
                  <button
                    onClick={() => copyText(result.token)}
                    className="rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white hover:bg-white/20 transition"
                  >
                    {text.copy}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-white/40">{text.linkLabel}</label>
                <div className="flex items-center gap-3">
                  <code className="flex-1 rounded-xl bg-black/30 px-4 py-3 text-sm font-mono text-white/70 truncate">
                    {result.registerUrl}
                  </code>
                  <button
                    onClick={() => copyText(result.registerUrl)}
                    className="rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white hover:bg-white/20 transition"
                  >
                    {text.copy}
                  </button>
                </div>
              </div>

              <p className="text-xs text-white/30">{text.expiry}</p>
            </div>

            <button
              onClick={handleNewInvite}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition"
            >
              {text.newInvite}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
