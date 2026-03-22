"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { tenantService } from "@/services/tenantService";
import toast from "react-hot-toast";

const copy = {
  en: {
    companyBadge: "Business registration",
    companyTitle: "Register your beauty center",
    companyName: "Company Name",
    companyNamePh: "Glow Atelier",
    phone: "Phone",
    phonePh: "+90 5XX XXX XX XX",
    address: "Address",
    addressPh: "Istanbul, Turkey",
    taxNumber: "Tax Number",
    taxNumberPh: "1234567890",
    taxOffice: "Tax Office",
    taxOfficePh: "Kadikoy VD",
    ownerTitle: "Owner Account",
    ownerName: "Name",
    ownerNamePh: "Mehmet",
    ownerSurname: "Surname",
    ownerSurnamePh: "Kara",
    ownerEmail: "Email",
    ownerEmailPh: "owner@example.com",
    ownerPassword: "Password",
    ownerPasswordPh: "Min 8 chars, uppercase, number, symbol",
    ownerConfirmPassword: "Confirm Password",
    ownerConfirmPasswordPh: "Repeat password",
    submit: "Create Account",
    submitting: "Creating...",
    disclaimer: "After registration you can invite staff members from your dashboard.",
    successMessage: "Registration successful! Please login.",
  },
  tr: {
    companyBadge: "İşletme kaydı",
    companyTitle: "Güzellik merkezinizi kaydedin",
    companyName: "Şirket Adı",
    companyNamePh: "Glow Atelier",
    phone: "Telefon",
    phonePh: "+90 5XX XXX XX XX",
    address: "Adres",
    addressPh: "İstanbul, Türkiye",
    taxNumber: "Vergi No",
    taxNumberPh: "1234567890",
    taxOffice: "Vergi Dairesi",
    taxOfficePh: "Kadıköy VD",
    ownerTitle: "İşletme Sahibi Hesabı",
    ownerName: "Ad",
    ownerNamePh: "Mehmet",
    ownerSurname: "Soyad",
    ownerSurnamePh: "Kara",
    ownerEmail: "E-posta",
    ownerEmailPh: "sahip@example.com",
    ownerPassword: "Şifre",
    ownerPasswordPh: "Min 8 karakter, büyük harf, rakam, sembol",
    ownerConfirmPassword: "Şifre Tekrar",
    ownerConfirmPasswordPh: "Şifreyi tekrarlayın",
    submit: "Hesap Oluştur",
    submitting: "Oluşturuluyor...",
    disclaimer: "Kayıt sonrası panelden personel davet edebilirsiniz.",
    successMessage: "Kayıt başarılı! Lütfen giriş yapın.",
  },
};

export default function SignUpForm() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const router = useRouter();
  const isDark = theme === "dark";
  const text = copy[language];

  const [form, setForm] = useState({
    companyName: "", phone: "", address: "", taxNumber: "", taxOffice: "",
    ownerName: "", ownerSurname: "", ownerEmail: "", ownerPassword: "", ownerConfirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const baseText = isDark ? "text-white" : "text-[#1d1233]";
  const eyebrowText = isDark ? "text-white/40" : "text-[#9a88c2]";
  const cardBorder = isDark ? "border-white/10" : "border-[#e3d8ff]";
  const cardBg = isDark ? "bg-white/5" : "bg-white";
  const mutedText = isDark ? "text-white/60" : "text-[#6a5c8c]";
  const inputClass = isDark
    ? "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
    : "w-full rounded-xl border border-[#d9cef4] bg-white px-3 py-2.5 text-sm text-[#1d1233] placeholder:text-[#73619d] focus:border-[#a18ddc] focus:outline-none";
  const labelClass = isDark ? "text-xs font-medium text-white/60" : "text-xs font-medium text-[#47376d]";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.ownerPassword !== form.ownerConfirmPassword) {
      toast.error(language === "tr" ? "Şifreler uyuşmuyor" : "Passwords don't match");
      return;
    }
    setSubmitting(true);
    try {
      const res = await tenantService.register({
        companyName: form.companyName,
        phone: form.phone,
        address: form.address || "",
        taxNumber: form.taxNumber || "",
        taxOffice: form.taxOffice || "",
        email: form.ownerEmail,
        password: form.ownerPassword,
        confirmPassword: form.ownerConfirmPassword,
        name: form.ownerName,
        surname: form.ownerSurname,
      });
      if (res.data.success) {
        toast.success(text.successMessage);
        router.push("/login");
      } else {
        toast.error(res.data.error?.message || (language === "tr" ? "Kayıt başarısız" : "Registration failed"));
      }
    } catch {
      toast.error(language === "tr" ? "Kayıt başarısız" : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <form className={`space-y-6 ${baseText}`} onSubmit={handleSubmit}>
      <section className={`space-y-6 rounded-3xl border p-8 shadow-[0_25px_60px_rgba(3,2,9,0.6)] ${cardBorder} ${cardBg}`}>
        <div>
          <p className={`text-sm uppercase tracking-[0.2em] ${eyebrowText}`}>{text.companyBadge}</p>
          <h2 className="text-2xl font-semibold">{text.companyTitle}</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className={labelClass}>{text.companyName} *</label>
            <input type="text" required value={form.companyName} onChange={(e) => update("companyName", e.target.value)}
              placeholder={text.companyNamePh} className={inputClass} disabled={submitting} />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>{text.phone} *</label>
            <input type="tel" required value={form.phone} onChange={(e) => update("phone", e.target.value)}
              placeholder={text.phonePh} className={inputClass} disabled={submitting} />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>{text.address}</label>
            <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)}
              placeholder={text.addressPh} className={inputClass} disabled={submitting} />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>{text.taxNumber}</label>
            <input type="text" value={form.taxNumber} onChange={(e) => update("taxNumber", e.target.value)}
              placeholder={text.taxNumberPh} className={inputClass} disabled={submitting} />
          </div>
        </div>

        <hr className={isDark ? "border-white/10" : "border-[#e3d8ff]"} />

        <h3 className="text-lg font-semibold">{text.ownerTitle}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className={labelClass}>{text.ownerName} *</label>
            <input type="text" required value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)}
              placeholder={text.ownerNamePh} className={inputClass} disabled={submitting} />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>{text.ownerSurname} *</label>
            <input type="text" required value={form.ownerSurname} onChange={(e) => update("ownerSurname", e.target.value)}
              placeholder={text.ownerSurnamePh} className={inputClass} disabled={submitting} />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>{text.ownerEmail} *</label>
            <input type="email" required value={form.ownerEmail} onChange={(e) => update("ownerEmail", e.target.value)}
              placeholder={text.ownerEmailPh} className={inputClass} disabled={submitting} />
          </div>
          <div />
          <div className="space-y-1">
            <label className={labelClass}>{text.ownerPassword} *</label>
            <input type="password" required value={form.ownerPassword} onChange={(e) => update("ownerPassword", e.target.value)}
              placeholder={text.ownerPasswordPh} className={inputClass} disabled={submitting} />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>{text.ownerConfirmPassword} *</label>
            <input type="password" required value={form.ownerConfirmPassword} onChange={(e) => update("ownerConfirmPassword", e.target.value)}
              placeholder={text.ownerConfirmPasswordPh} className={inputClass} disabled={submitting} />
          </div>
        </div>

        <Button type="submit" className="w-full rounded-2xl text-base font-semibold" disabled={submitting}>
          {submitting ? text.submitting : text.submit}
        </Button>

        <p className={`text-center text-sm ${mutedText}`}>{text.disclaimer}</p>
      </section>
    </form>
  );
}
