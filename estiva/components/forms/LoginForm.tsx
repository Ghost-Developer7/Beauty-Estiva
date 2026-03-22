"use client";

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
  const text = copy[language];
  const formTextClass = theme === "dark" ? "text-white" : "text-[#1d1233]";

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

      <Input
        label={text.passwordLabel}
        type="password"
        placeholder={text.passwordPlaceholder}
        disabled={isSubmitting}
        error={errors.password ? getValidationMessage(errors.password.message!, language) : undefined}
        {...register("password")}
      />

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
