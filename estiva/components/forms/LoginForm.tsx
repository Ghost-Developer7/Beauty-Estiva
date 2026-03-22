"use client";

import { useState, FormEvent } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    try {
      await login({ emailOrUsername: email, password });
    } catch (err: unknown) {
      const message =
        (err instanceof Error ? err.message : null) ?? text.errorGeneric;
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={`space-y-6 ${formTextClass}`} onSubmit={handleSubmit}>
      <Input
        label={text.emailLabel}
        name="email"
        type="email"
        placeholder={text.emailPlaceholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isSubmitting}
      />

      <Input
        label={text.passwordLabel}
        name="password"
        type="password"
        placeholder={text.passwordPlaceholder}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={isSubmitting}
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
