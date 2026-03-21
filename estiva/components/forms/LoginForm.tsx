"use client";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

const copy = {
  en: {
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "********",
    submit: "Sign in",
  },
  tr: {
    emailLabel: "E-posta",
    emailPlaceholder: "sen@example.com",
    passwordLabel: "Şifre",
    passwordPlaceholder: "********",
    submit: "Giriş yap",
  },
};

export default function LoginForm() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const text = copy[language];
  const formTextClass = theme === "dark" ? "text-white" : "text-[#1d1233]";

  return (
    <form className={`space-y-6 ${formTextClass}`}>
      <Input
        label={text.emailLabel}
        name="email"
        type="email"
        placeholder={text.emailPlaceholder}
      />

      <Input
        label={text.passwordLabel}
        name="password"
        type="password"
        placeholder={text.passwordPlaceholder}
      />

      <Button
        type="submit"
        className="rounded-2xl text-base font-semibold"
      >
        {text.submit}
      </Button>
    </form>
  );
}
