"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { tenantService } from "@/services/tenantService";
import { signUpSchema, SignUpFormData, getValidationMessage } from "@/lib/validations";
import toast from "react-hot-toast";

const copy = {
  en: {
    companyBadge: "BUSINESS REGISTRATION",
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
    companyBadge: "İŞLETME KAYDI",
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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const baseText = isDark ? "text-white" : "text-[#1d1233]";
  const eyebrowText = isDark ? "text-white/40" : "text-[#9a88c2]";
  const cardBorder = isDark ? "border-white/10" : "border-[#e3d8ff]";
  const cardBg = isDark ? "bg-white/5" : "bg-white";
  const mutedText = isDark ? "text-white/60" : "text-[#6a5c8c]";
  const inputClass = isDark
    ? "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
    : "w-full rounded-xl border border-[#d9cef4] bg-white px-3 py-2.5 text-sm text-[#1d1233] placeholder:text-[#73619d] focus:border-[#a18ddc] focus:outline-none";
  const labelClass = isDark ? "text-xs font-medium text-white/60" : "text-xs font-medium text-[#47376d]";
  const errorInputClass = "border-red-500 focus:border-red-500";

  const err = (field: keyof SignUpFormData) =>
    errors[field] ? getValidationMessage(errors[field]!.message!, language) : undefined;

  const fieldClass = (field: keyof SignUpFormData) =>
    `${inputClass} ${errors[field] ? errorInputClass : ""}`;

  const onSubmit = async (data: SignUpFormData) => {
    try {
      const res = await tenantService.register({
        companyName: data.companyName,
        phone: data.phone,
        address: data.address || "",
        taxNumber: data.taxNumber || "",
        taxOffice: data.taxOffice || "",
        email: data.ownerEmail,
        password: data.ownerPassword,
        confirmPassword: data.ownerConfirmPassword,
        name: data.ownerName,
        surname: data.ownerSurname,
      });
      if (res.data.success) {
        toast.success(text.successMessage);
        router.push("/login");
      } else {
        toast.error(res.data.error?.message || (language === "tr" ? "Kayıt başarısız" : "Registration failed"));
      }
    } catch {
      toast.error(language === "tr" ? "Kayıt başarısız" : "Registration failed");
    }
  };

  return (
    <form className={`space-y-6 ${baseText}`} onSubmit={handleSubmit(onSubmit)}>
      <section className={`space-y-6 rounded-3xl border p-8 shadow-[0_25px_60px_rgba(3,2,9,0.6)] ${cardBorder} ${cardBg}`}>
        <div>
          <p className={`text-sm tracking-[0.2em] ${eyebrowText}`}>{text.companyBadge}</p>
          <h2 className="text-2xl font-semibold">{text.companyTitle}</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className={labelClass}>{text.companyName} *</label>
            <input type="text" placeholder={text.companyNamePh} className={fieldClass("companyName")}
              disabled={isSubmitting} {...register("companyName")} />
            {err("companyName") && <p className="text-xs text-red-500">{err("companyName")}</p>}
          </div>
          <div className="space-y-1">
            <label className={labelClass}>{text.phone} *</label>
            <input type="tel" placeholder={text.phonePh} className={fieldClass("phone")}
              disabled={isSubmitting} {...register("phone")} />
            {err("phone") && <p className="text-xs text-red-500">{err("phone")}</p>}
          </div>
          <div className="space-y-1">
            <label className={labelClass}>{text.address}</label>
            <input type="text" placeholder={text.addressPh} className={fieldClass("address")}
              disabled={isSubmitting} {...register("address")} />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>{text.taxNumber}</label>
            <input type="text" placeholder={text.taxNumberPh} className={fieldClass("taxNumber")}
              disabled={isSubmitting} {...register("taxNumber")} />
          </div>
        </div>

        <hr className={isDark ? "border-white/10" : "border-[#e3d8ff]"} />

        <h3 className="text-lg font-semibold">{text.ownerTitle}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className={labelClass}>{text.ownerName} *</label>
            <input type="text" placeholder={text.ownerNamePh} className={fieldClass("ownerName")}
              disabled={isSubmitting} {...register("ownerName")} />
            {err("ownerName") && <p className="text-xs text-red-500">{err("ownerName")}</p>}
          </div>
          <div className="space-y-1">
            <label className={labelClass}>{text.ownerSurname} *</label>
            <input type="text" placeholder={text.ownerSurnamePh} className={fieldClass("ownerSurname")}
              disabled={isSubmitting} {...register("ownerSurname")} />
            {err("ownerSurname") && <p className="text-xs text-red-500">{err("ownerSurname")}</p>}
          </div>
          <div className="space-y-1">
            <label className={labelClass}>{text.ownerEmail} *</label>
            <input type="email" placeholder={text.ownerEmailPh} className={fieldClass("ownerEmail")}
              disabled={isSubmitting} {...register("ownerEmail")} />
            {err("ownerEmail") && <p className="text-xs text-red-500">{err("ownerEmail")}</p>}
          </div>
          <div />
          <div className="space-y-1">
            <label className={labelClass}>{text.ownerPassword} *</label>
            <input type="password" placeholder={text.ownerPasswordPh} className={fieldClass("ownerPassword")}
              disabled={isSubmitting} {...register("ownerPassword")} />
            {err("ownerPassword") && <p className="text-xs text-red-500">{err("ownerPassword")}</p>}
          </div>
          <div className="space-y-1">
            <label className={labelClass}>{text.ownerConfirmPassword} *</label>
            <input type="password" placeholder={text.ownerConfirmPasswordPh} className={fieldClass("ownerConfirmPassword")}
              disabled={isSubmitting} {...register("ownerConfirmPassword")} />
            {err("ownerConfirmPassword") && <p className="text-xs text-red-500">{err("ownerConfirmPassword")}</p>}
          </div>
        </div>

        <Button type="submit" className="w-full rounded-2xl text-base font-semibold" disabled={isSubmitting}>
          {isSubmitting ? text.submitting : text.submit}
        </Button>

        <p className={`text-center text-sm ${mutedText}`}>{text.disclaimer}</p>
      </section>
    </form>
  );
}
