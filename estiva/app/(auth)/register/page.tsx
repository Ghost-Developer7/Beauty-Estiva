"use client";

import { useState, useEffect, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { authService } from "@/services/authService";
import LanguageToggle from "@/components/ui/LanguageToggle";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { LocaleDateInput } from "@/components/ui/LocaleDateInput";
import toast from "react-hot-toast";

const copy = {
  en: {
    badge: "STAFF REGISTRATION",
    title: "Join your salon",
    subtitle: "Enter the invite code shared by your salon owner to create your account.",
    inviteToken: "Invite Code",
    inviteTokenPh: "Enter invite code",
    name: "Name",
    namePh: "Your name",
    surname: "Surname",
    surnamePh: "Your surname",
    email: "Email",
    emailPh: "you@example.com",
    password: "Password",
    passwordPh: "Min 8 chars, uppercase, number, symbol",
    confirmPassword: "Confirm Password",
    confirmPasswordPh: "Repeat password",
    birthDate: "Birth Date",
    submit: "Create Account",
    submitting: "Creating...",
    haveAccount: "Already have an account?",
    login: "Sign in",
    ownerSignup: "Register as salon owner",
    success: "Registration successful! You can now sign in.",
    passwordMismatch: "Passwords don't match",
    passwordRules: "Min 8 chars, 1 uppercase, 1 number, 1 symbol (!@#$...)",
    rule8: "At least 8 characters",
    ruleUpper: "At least 1 uppercase letter",
    ruleNumber: "At least 1 number",
    ruleSymbol: "At least 1 symbol (!@#$%&*)",
  },
  tr: {
    badge: "PERSONEL KAYDI",
    title: "Salonuna katıl",
    subtitle: "Salon sahibinizin paylaştığı davet kodunu girerek hesabınızı oluşturun.",
    inviteToken: "Davet Kodu",
    inviteTokenPh: "Davet kodunu girin",
    name: "Ad",
    namePh: "Adınız",
    surname: "Soyad",
    surnamePh: "Soyadınız",
    email: "E-posta",
    emailPh: "siz@example.com",
    password: "Şifre",
    passwordPh: "Min 8 karakter, büyük harf, rakam, sembol",
    confirmPassword: "Şifre Tekrar",
    confirmPasswordPh: "Şifreyi tekrarlayın",
    birthDate: "Doğum Tarihi",
    submit: "Hesap Oluştur",
    submitting: "Oluşturuluyor...",
    haveAccount: "Zaten hesabınız var mı?",
    login: "Giriş yap",
    ownerSignup: "Salon sahibi olarak kayıt ol",
    success: "Kayıt başarılı! Artık giriş yapabilirsiniz.",
    passwordMismatch: "Şifreler uyuşmuyor",
    passwordRules: "Min 8 karakter, 1 büyük harf, 1 rakam, 1 sembol (!@#$...)",
    rule8: "En az 8 karakter",
    ruleUpper: "En az 1 büyük harf",
    ruleNumber: "En az 1 rakam",
    ruleSymbol: "En az 1 sembol (!@#$%&*)",
  },
};

function StaffRegisterContent() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDark = theme === "dark";
  const text = copy[language];

  const inviteFromUrl = searchParams.get("invite") || "";
  const emailFromUrl = searchParams.get("email") || "";

  const [form, setForm] = useState({
    inviteToken: "",
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (inviteFromUrl || emailFromUrl) {
      setForm((f) => ({
        ...f,
        ...(inviteFromUrl ? { inviteToken: inviteFromUrl } : {}),
        ...(emailFromUrl ? { email: emailFromUrl } : {}),
      }));
    }
  }, [inviteFromUrl, emailFromUrl]);

  const baseBg = isDark ? "bg-[#0b0614]" : "bg-[#f7f4ff]";
  const baseText = isDark ? "text-white" : "text-[#1f1233]";
  const subtleText = isDark ? "text-white/60" : "text-[#6a5c8c]";
  const cardBorder = isDark ? "border-white/10" : "border-[#e3d8ff]";
  const cardBg = isDark ? "bg-white/5" : "bg-white";
  const inputClass = isDark
    ? "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
    : "w-full rounded-xl border border-[#d9cef4] bg-white px-4 py-3 text-sm text-[#1d1233] placeholder:text-[#73619d] focus:border-[#a18ddc] focus:outline-none focus:ring-2 focus:ring-[#b79df1]/40";
  const labelClass = isDark ? "text-xs font-medium text-white/60" : "text-xs font-medium text-[#47376d]";

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error(text.passwordMismatch);
      return;
    }
    setSubmitting(true);
    try {
      const res = await authService.registerStaff({
        inviteToken: form.inviteToken,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        name: form.name,
        surname: form.surname,
        birthDate: form.birthDate || undefined,
      });
      if (res.data.success) {
        toast.success(text.success);
        router.push("/login");
      } else {
        toast.error(res.data.error?.message || (language === "tr" ? "Kayıt başarısız" : "Registration failed"));
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      const msg = axiosErr?.response?.data?.error?.message || (language === "tr" ? "Kayıt başarısız" : "Registration failed");
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`relative min-h-screen ${baseBg} ${baseText}`}>
      {isDark && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0b0614] via-[#130628] to-[#200c3c] opacity-95" />
        </div>
      )}

      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
        {/* Top controls */}
        <div className="absolute top-6 right-6 flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
        </div>

        <div className={`w-full max-w-lg rounded-3xl ${cardBorder} ${cardBg} p-5 sm:p-10 shadow-2xl`}>
          {/* Header */}
          <div className="mb-8 text-center">
            <p className={`text-xs font-semibold tracking-[0.4em] ${subtleText}`}>
              {text.badge}
            </p>
            <h1 className="mt-2 text-2xl font-semibold">{text.title}</h1>
            <p className={`mt-2 text-sm ${subtleText}`}>{text.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Invite Token — highlighted */}
            <div className={`space-y-1 rounded-xl border p-4 ${isDark ? "border-emerald-500/30 bg-emerald-500/5" : "border-emerald-300 bg-emerald-50"}`}>
              <label className="text-xs font-semibold text-emerald-500">{text.inviteToken} *</label>
              <input
                type="text"
                required
                value={form.inviteToken}
                onChange={(e) => update("inviteToken", e.target.value.toUpperCase())}
                placeholder={text.inviteTokenPh}
                disabled={submitting || !!inviteFromUrl}
                readOnly={!!inviteFromUrl}
                className={`${inputClass} font-mono text-lg tracking-widest text-center ${inviteFromUrl ? "opacity-70 cursor-not-allowed" : ""}`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>{text.name} *</label>
                <input type="text" required value={form.name} onChange={(e) => update("name", e.target.value)}
                  placeholder={text.namePh} disabled={submitting} className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>{text.surname} *</label>
                <input type="text" required value={form.surname} onChange={(e) => update("surname", e.target.value)}
                  placeholder={text.surnamePh} disabled={submitting} className={inputClass} />
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>{text.email} *</label>
              <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)}
                placeholder={text.emailPh} disabled={submitting || !!emailFromUrl} readOnly={!!emailFromUrl}
                className={`${inputClass} ${emailFromUrl ? "opacity-70 cursor-not-allowed" : ""}`} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>{text.password} *</label>
                <input type="password" required value={form.password} onChange={(e) => update("password", e.target.value)}
                  placeholder="••••••••" disabled={submitting} className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>{text.confirmPassword} *</label>
                <input type="password" required value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)}
                  placeholder="••••••••" disabled={submitting} className={inputClass} />
              </div>
            </div>
            {/* Password rules */}
            {form.password.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 px-1">
                {[
                  { ok: form.password.length >= 8, label: text.rule8 },
                  { ok: /[A-Z]/.test(form.password), label: text.ruleUpper },
                  { ok: /[0-9]/.test(form.password), label: text.ruleNumber },
                  { ok: /[^A-Za-z0-9]/.test(form.password), label: text.ruleSymbol },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-1.5">
                    <span className={`text-xs ${r.ok ? "text-emerald-400" : "text-red-400"}`}>
                      {r.ok ? "✓" : "✗"}
                    </span>
                    <span className={`text-[11px] ${r.ok ? (isDark ? "text-white/50" : "text-gray-500") : "text-red-400"}`}>
                      {r.label}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-[11px] px-1 ${isDark ? "text-white/30" : "text-gray-400"}`}>
                {text.passwordRules}
              </p>
            )}

            <div className="space-y-1">
              <label className={labelClass}>{text.birthDate}</label>
              <LocaleDateInput value={form.birthDate} onChange={(e) => update("birthDate", e.target.value)}
                disabled={submitting} isDark={isDark} className={`${inputClass} ${isDark ? "[color-scheme:dark]" : "[color-scheme:light]"}`} />
            </div>

            <button type="submit" disabled={submitting}
              className={`w-full rounded-2xl py-3 text-base font-semibold transition shadow-sm disabled:opacity-50 ${
                isDark
                  ? "border border-white/30 bg-white/10 text-white hover:bg-white/20"
                  : "border border-[#c9b4ff] bg-[#3b2268] text-white hover:bg-[#2b174e]"
              }`}>
              {submitting ? text.submitting : text.submit}
            </button>
          </form>

          <div className={`mt-6 space-y-2 text-center text-xs ${subtleText}`}>
            <p>
              {text.haveAccount}{" "}
              <Link href="/login" className="font-semibold text-[var(--color-pico-8-pink)] hover:underline">
                {text.login}
              </Link>
            </p>
            <p>
              <Link href="/signup" className="font-semibold text-[var(--color-pico-8-pink)] hover:underline">
                {text.ownerSignup}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StaffRegisterPage() {
  return (
    <Suspense>
      <StaffRegisterContent />
    </Suspense>
  );
}
