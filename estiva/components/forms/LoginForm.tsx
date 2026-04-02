"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { loginSchema, LoginFormData, getValidationMessage } from "@/lib/validations";
import toast from "react-hot-toast";

const copy = {
  en: {
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "********",
    submit: "Sign in",
    submitting: "Signing in...",
    errorGeneric: "Login failed. Please check your credentials.",
  },
  tr: {
    emailLabel: "E-posta",
    emailPlaceholder: "sen@example.com",
    passwordLabel: "Şifre",
    passwordPlaceholder: "********",
    submit: "Giriş yap",
    submitting: "Giriş yapılıyor...",
    errorGeneric: "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.",
  },
};

export default function LoginForm() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const text = copy[language];
  const isDark = theme === "dark";
  const formTextClass = isDark ? "text-white" : "text-[#1d1233]";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login({ emailOrUsername: data.email, password: data.password });
    } catch (err: unknown) {
      const message =
        (err instanceof Error ? err.message : null) ?? text.errorGeneric;
      toast.error(message);
    }
  };

  return (
    <form className={`space-y-6 ${formTextClass}`} onSubmit={handleSubmit(onSubmit)}>
      <Input
        label={text.emailLabel}
        type="email"
        placeholder={text.emailPlaceholder}
        disabled={isSubmitting}
        error={errors.email ? getValidationMessage(errors.email.message!, language) : undefined}
        {...register("email")}
      />

      <div className="relative">
        <Input
          label={text.passwordLabel}
          type={showPassword ? "text" : "password"}
          placeholder={text.passwordPlaceholder}
          disabled={isSubmitting}
          error={errors.password ? getValidationMessage(errors.password.message!, language) : undefined}
          {...register("password")}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={`absolute right-3 top-[38px] flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
            isDark ? "text-white/80 hover:text-white hover:bg-white/10" : "text-[#73619d] hover:text-[#1d1233] hover:bg-[#ede9f5]"
          }`}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>

      <Button
        type="submit"
        className="rounded-2xl text-base font-semibold"
        disabled={isSubmitting}
      >
        {isSubmitting ? text.submitting : text.submit}
      </Button>
    </form>
  );
}
