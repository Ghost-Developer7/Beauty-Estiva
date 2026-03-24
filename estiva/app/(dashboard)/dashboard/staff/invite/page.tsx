"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { tenantService } from "@/services/tenantService";
import toast from "react-hot-toast";

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const copy = {
  en: {
    title: "Invite Staff",
    subtitle: "Send an invitation to add a new team member",
    // Form
    step1: "Enter Email",
    step1Desc: "Enter your staff member's email address. They'll receive a registration link and invite code.",
    emailLabel: "Staff Email",
    emailPh: "staff@example.com",
    emailOptional: "Optional — you can also generate a code without email",
    sendInvite: "Send Invitation",
    generateOnly: "Generate Code Only",
    generating: "Generating...",
    // Result
    step2: "Share Invitation",
    successWithEmail: "Invitation email sent successfully!",
    successNoEmail: "Invite code generated. Share it with your staff member.",
    tokenLabel: "Invite Code",
    linkLabel: "Registration Link",
    copy: "Copy",
    copied: "Copied!",
    expiry: "Expires in 24 hours — single use only",
    emailSent: "Email sent",
    emailFailed: "Email failed — share the code manually",
    newInvite: "Create Another Invite",
    // How it works
    howTitle: "How it works",
    howStep1: "Generate an invite code or send an email",
    howStep2: "Staff member opens the registration link",
    howStep3: "They create their account with the invite code",
    howStep4: "You can see them in the staff list once approved",
  },
  tr: {
    title: "Personel Davet Et",
    subtitle: "Ekibinize yeni bir üye eklemek için davet gönderin",
    step1: "E-posta Girin",
    step1Desc: "Personelin e-posta adresini girin. Kayıt bağlantısı ve davet kodu içeren bir e-posta gönderilecek.",
    emailLabel: "Personel E-postası",
    emailPh: "personel@example.com",
    emailOptional: "İsteğe bağlı — e-posta olmadan da kod oluşturabilirsiniz",
    sendInvite: "Davet Gönder",
    generateOnly: "Sadece Kod Oluştur",
    generating: "Oluşturuluyor...",
    step2: "Daveti Paylaşın",
    successWithEmail: "Davet e-postası başarıyla gönderildi!",
    successNoEmail: "Davet kodu oluşturuldu. Personelinizle paylaşın.",
    tokenLabel: "Davet Kodu",
    linkLabel: "Kayıt Bağlantısı",
    copy: "Kopyala",
    copied: "Kopyalandı!",
    expiry: "24 saat geçerli — tek kullanımlık",
    emailSent: "E-posta gönderildi",
    emailFailed: "E-posta gönderilemedi — kodu manuel paylaşın",
    newInvite: "Yeni Davet Oluştur",
    howTitle: "Nasıl çalışır?",
    howStep1: "Davet kodu oluşturun veya e-posta gönderin",
    howStep2: "Personel kayıt bağlantısını açar",
    howStep3: "Davet kodu ile hesabını oluşturur",
    howStep4: "Onaylandıktan sonra personel listesinde görünür",
  },
};

interface InviteResult {
  token: string;
  registerUrl: string;
  emailSent: boolean;
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function StaffInvitePage() {
  const { language } = useLanguage();
  const t = copy[language];

  const [email, setEmail] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<InviteResult | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await tenantService.generateInviteToken(email || undefined);
      if (res.data.success && res.data.data) {
        setResult(res.data.data);
        toast.success(email ? t.successWithEmail : t.successNoEmail);
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
    toast.success(t.copied);
  };

  const handleNewInvite = () => {
    setResult(null);
    setEmail("");
  };

  const howSteps = [t.howStep1, t.howStep2, t.howStep3, t.howStep4];

  return (
    <div className="space-y-6 text-white">

      {/* ─── HEADER ─── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-0.5 text-sm text-white/40">{t.subtitle}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

        {/* ─── MAIN CARD ─── */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden">

          {!result ? (
            /* ═══ FORM STATE ═══ */
            <div className="p-6 space-y-6">
              {/* Step indicator */}
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">1</div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.step1}</p>
                  <p className="text-xs text-white/40">{t.step1Desc}</p>
                </div>
              </div>

              {/* Email input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t.emailLabel}</label>
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 7L2 7" /></svg>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPh}
                    disabled={generating}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 transition disabled:opacity-50"
                  />
                </div>
                <p className="text-[10px] text-white/25">{t.emailOptional}</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/30 transition-all hover:shadow-blue-900/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {generating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      {t.generating}
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                      {email ? t.sendInvite : t.generateOnly}
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* ═══ RESULT STATE ═══ */
            <div className="p-6 space-y-6">
              {/* Step indicator */}
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-xs font-bold text-white">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.step2}</p>
                  <p className="text-xs text-white/40">{email ? t.successWithEmail : t.successNoEmail}</p>
                </div>
              </div>

              {/* Email status banner */}
              {email && (
                <div className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium ${
                  result.emailSent
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    : "border-amber-500/20 bg-amber-500/10 text-amber-400"
                }`}>
                  <span className={`h-2 w-2 rounded-full ${result.emailSent ? "bg-emerald-400" : "bg-amber-400"}`} />
                  {result.emailSent ? t.emailSent : t.emailFailed}
                </div>
              )}

              {/* Invite Code */}
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{t.tokenLabel}</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-xl border border-white/[0.08] bg-black/20 px-5 py-4 text-center">
                    <code className="text-2xl font-mono font-bold tracking-[0.4em] text-white">{result.token}</code>
                  </div>
                  <button
                    onClick={() => copyText(result.token)}
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/50 transition hover:bg-white/10 hover:text-white"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                  </button>
                </div>
              </div>

              {/* Registration Link */}
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{t.linkLabel}</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 overflow-hidden rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3">
                    <code className="block text-xs font-mono text-white/50 truncate">{result.registerUrl}</code>
                  </div>
                  <button
                    onClick={() => copyText(result.registerUrl)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/50 transition hover:bg-white/10 hover:text-white"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                  </button>
                </div>
              </div>

              {/* Expiry notice */}
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-[11px] text-white/30">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                {t.expiry}
              </div>

              {/* New invite button */}
              <button
                onClick={handleNewInvite}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                {t.newInvite}
              </button>
            </div>
          )}
        </div>

        {/* ─── SIDEBAR: HOW IT WORKS ─── */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 h-fit">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">{t.howTitle}</p>
          <div className="space-y-4">
            {howSteps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-white/40">
                  {i + 1}
                </div>
                <p className="text-xs text-white/50 pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
