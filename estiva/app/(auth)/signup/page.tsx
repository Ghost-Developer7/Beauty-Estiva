"use client";

import Link from "next/link";
import SignUpForm from "@/components/forms/SignUpForm";
import LanguageToggle from "@/components/ui/LanguageToggle";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

const navLinks = {
  en: [
    { label: "ABOUT", href: "/#features" },
    { label: "MEMBERSHIP", href: "/#pricing" },
    { label: "CONTACT", href: "/#contact" },
  ],
  tr: [
    { label: "HAKKIMIZDA", href: "/#features" },
    { label: "ÜYELİK", href: "/#pricing" },
    { label: "İLETİŞİM", href: "/#contact" },
  ],
};

const highlights = {
  en: [
    "Smart appointment scheduling and calendar management.",
    "Staff management with role-based access control.",
    "Real-time analytics and sales reporting dashboard.",
  ],
  tr: [
    "Akıllı randevu planlama ve takvim yönetimi.",
    "Rol tabanlı erişim kontrolü ile personel yönetimi.",
    "Gerçek zamanlı analitik ve satış raporlama paneli.",
  ],
};

const stats = {
  en: [
    { label: "SUITES", value: "24" },
    { label: "MEMBERS", value: "1.2k" },
    { label: "AVG. RATING", value: "4.9" },
  ],
  tr: [
    { label: "SÜİTLER", value: "24" },
    { label: "ÜYELER", value: "1.2k" },
    { label: "ORT. PUAN", value: "4.9" },
  ],
};

const heroCopy = {
  en: {
    badge: "BEAUTY CENTER",
    title: "Elevate your beauty center to the digital age.",
    subtitle:
      "Register now to manage appointments, staff, and analytics — all from a single elegant dashboard.",
  },
  tr: {
    badge: "GÜZELLİK MERKEZİ",
    title: "Güzellik merkezinizi dijital çağa taşıyın.",
    subtitle:
      "Randevularınızı, ekibinizi ve analizlerinizi tek bir şık panelden yönetmek için hemen kaydolun.",
  },
};

const formCopy = {
  en: {
    badge: "MEMBERSHIP REQUEST",
    title: "Sign up",
    subtitle: "Share a few details and we'll reach out quickly.",
    alreadyHave: "Already a member?",
    signIn: "Sign in",
  },
  tr: {
    badge: "ÜYELİK BAŞVURUSU",
    title: "Üye ol",
    subtitle: "Kısa bilgileri paylaşın; hızlıca size dönüş yapalım.",
    alreadyHave: "Zaten üye misin?",
    signIn: "Giriş yap",
  },
};

export default function SignupPage() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const nav = navLinks[language];
  const hero = heroCopy[language];
  const highlightList = highlights[language];
  const statList = stats[language];
  const form = formCopy[language];

  const baseBg = isDark ? "bg-[#0b0614]" : "bg-[#eae6f3]";
  const baseText = isDark ? "text-white" : "text-[#1f1233]";
  const subtleText = isDark ? "text-white/70" : "text-[#6a5c8c]";
  const cardBorder = isDark ? "border-white/10" : "border-[#d5cce6]";
  const cardBg = isDark ? "bg-white/5" : "bg-[#f0ecf7]";
  const pillBorder = isDark ? "border-white/15" : "border-[#cbc2de]";
  const pillBg = isDark ? "bg-white/10" : "bg-[#ede9f5]";

  return (
    <div className={`relative min-h-screen overflow-hidden ${baseBg} ${baseText}`}>
      {isDark && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.1),_transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(0,206,201,0.25),transparent_50%),_radial-gradient(circle_at_85%_10%,rgba(253,121,168,0.25),transparent_55%)] opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0b0614] via-[#130628] to-[#200c3c] opacity-95" />
        </div>
      )}

      <div className="relative flex min-h-screen flex-col">
        <header
          className={`flex w-full flex-wrap items-center justify-between gap-4 border-b px-4 py-6 sm:px-8 lg:px-16 ${isDark ? "border-white/10" : "border-[#e2d9ff]"
            }`}
        >
          <Link href="/" className="text-lg font-semibold tracking-[0.5em]">ESTIVA</Link>
          <nav
            className={`hidden gap-8 text-xs tracking-[0.3em] ${isDark ? "text-white/70" : "text-[#65558c]"
              } md:flex`}
          >
            {nav.map((link) => (
              <Link key={link.label} href={link.href} className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-[#3b2268]"}`}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl grid flex-1 items-start content-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
          <section className="space-y-10">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.3em] ${pillBorder} ${pillBg} ${isDark ? "text-white/80" : "text-[#5c478d]"
                }`}
            >
              {hero.badge}
            </div>
            <div className="space-y-5">
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                {hero.title}
              </h1>
              <p className={`text-lg ${subtleText}`}>{hero.subtitle}</p>
            </div>
            <div className={`space-y-4 text-sm ${subtleText}`}>
              {highlightList.map((item) => (
                <div key={item} className="flex items-center gap-4">
                  <span
                    className={`h-px flex-1 ${isDark ? "bg-white/20" : "bg-[#dacfff]"
                      }`}
                  />
                  <p className="flex-[2]">{item}</p>
                </div>
              ))}
            </div>

            <div
              className={`rounded-3xl ${cardBorder} ${cardBg} p-6 text-sm tracking-[0.35em] ${subtleText} shadow-[0_25px_80px_rgba(6,5,18,0.35)]`}
            >
              <div className="grid gap-4 sm:grid-cols-3">
                {statList.map((stat) => (
                  <div key={stat.label}>
                    <p className={`text-xs ${subtleText}`}>{stat.label}</p>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section
            className={`w-full max-w-xl justify-self-center rounded-[32px] border ${cardBorder} ${cardBg} p-5 shadow-[0_30px_90px_rgba(6,5,18,0.3)] backdrop-blur-xl sm:p-10 lg:justify-self-end lg:p-12`}
          >
            <div className="mb-6 space-y-2 text-center">
              <p className={`text-xs font-semibold tracking-[0.4em] ${subtleText}`}>
                {form.badge}
              </p>
              <h2 className="text-3xl font-semibold">{form.title}</h2>
              <p className={`text-sm ${subtleText}`}>{form.subtitle}</p>
            </div>

            <SignUpForm />

            <p className={`mt-6 text-center text-xs ${subtleText}`}>
              {form.alreadyHave}{" "}
              <Link
                href="/login"
                className="font-semibold text-[var(--color-pico-8-pink)] hover:underline"
              >
                {form.signIn}
              </Link>
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}

