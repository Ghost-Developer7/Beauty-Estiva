"use client";

import Link from "next/link";
import LoginForm from "@/components/forms/LoginForm";
import LanguageToggle from "@/components/ui/LanguageToggle";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

const heroCopy = {
  en: {
    badge: "WELCOME BACK",
    title: "Your salon awaits.",
    subtitle:
      "Pick up right where you left off \u2014 appointments, analytics, and your entire team in one elegant console.",
    highlights: [
      "Real-time dashboard at your fingertips.",
      "Seamless appointment management.",
      "Powerful insights, beautifully presented.",
    ],
    stat1: { label: "SALONS", value: "500+" },
    stat2: { label: "APPOINTMENTS", value: "2M+" },
    stat3: { label: "SATISFACTION", value: "99%" },
  },
  tr: {
    badge: "TEKRAR HO\u015E GELD\u0130N\u0130Z",
    title: "Salonunuz sizi bekliyor.",
    subtitle:
      "Kald\u0131\u011F\u0131n\u0131z yerden devam edin \u2014 randevular, analizler ve t\u00FCm ekibiniz tek bir zarif konsolda.",
    highlights: [
      "Ger\u00E7ek zamanl\u0131 pano parmaklar\u0131n\u0131z\u0131n ucunda.",
      "Kusursuz randevu y\u00F6netimi.",
      "G\u00FC\u00E7l\u00FC i\u00E7g\u00F6r\u00FCler, zarif sunumla.",
    ],
    stat1: { label: "SALON", value: "500+" },
    stat2: { label: "RANDEVU", value: "2M+" },
    stat3: { label: "MEMNUN\u0130YET", value: "99%" },
  },
};

const formCopy = {
  en: {
    badge: "MEMBER ACCESS",
    title: "Sign in",
    subtitle: "Enter your credentials to access the management panel.",
    needCredentials: "Don\u2019t have an account yet?",
    requestInvite: "Create one now",
    signupButton: "Register your beauty center",
  },
  tr: {
    badge: "\u00DCYE G\u0130R\u0130\u015E\u0130",
    title: "Giri\u015F yap",
    subtitle: "Y\u00F6netim paneline eri\u015Fmek i\u00E7in bilgilerinizi girin.",
    needCredentials: "Hen\u00FCz hesab\u0131n\u0131z yok mu?",
    requestInvite: "Hemen olu\u015Fturun",
    signupButton: "G\u00FCzellik merkezinizi kay\u0131t edin",
  },
};

const footerCopy = {
  en: {
    aboutTitle: "ABOUT",
    aboutText:
      "Estiva is the modern management platform trusted by hundreds of premium beauty centers worldwide.",
    contactTitle: "CONTACT",
    visitTitle: "ADDRESS",
    visitSubtitle: "Levent Mah. Canan Sok. No:12",
    socialTitle: "SOCIAL",
  },
  tr: {
    aboutTitle: "HAKKIMIZDA",
    aboutText:
      "Estiva, d\u00FCnya genelinde y\u00FCzlerce prestijli g\u00FCzellik merkezi taraf\u0131ndan tercih edilen modern y\u00F6netim platformudur.",
    contactTitle: "\u0130LET\u0130\u015E\u0130M",
    visitTitle: "ADRES",
    visitSubtitle: "Levent Mah. Canan Sok. No:12",
    socialTitle: "SOSYAL",
  },
};

export default function LoginPage() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const hero = heroCopy[language];
  const form = formCopy[language];
  const footer = footerCopy[language];

  const baseBg = isDark ? "bg-[#0b0614]" : "bg-[#eae6f3]";
  const baseText = isDark ? "text-white" : "text-[#1f1233]";
  const subtleText = isDark ? "text-white/60" : "text-[#6a5c8c]";
  const cardBorder = isDark ? "border-white/10" : "border-[#d5cce6]";
  const cardBg = isDark ? "bg-white/[0.04]" : "bg-[#f0ecf7]";
  const pillBorder = isDark ? "border-white/15" : "border-[#cbc2de]";
  const pillBg = isDark ? "bg-white/[0.06]" : "bg-[#ede9f5]";

  return (
    <div className={`relative min-h-screen overflow-hidden ${baseBg} ${baseText}`}>
      {/* Background gradients */}
      {isDark && (
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(108,92,231,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(253,121,168,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0b0614] via-[#130628] to-[#200c3c] opacity-90" />
        </div>
      )}

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header
          className={`flex w-full items-center justify-between border-b px-4 py-5 sm:px-8 lg:px-16 ${
            isDark ? "border-white/[0.06]" : "border-[#e2d9ff]"
          }`}
        >
          <Link href="/" className="text-lg font-bold tracking-[0.5em] transition hover:opacity-80">
            ESTIVA
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </header>

        {/* Main content */}
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-8 pt-6 sm:px-6 lg:px-8">
          <main className="grid flex-1 items-center gap-8 py-6 lg:grid-cols-2 lg:gap-12 lg:py-12">
            {/* Left: Hero */}
            <section className="space-y-8 text-center lg:text-left">
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-semibold tracking-[0.3em] backdrop-blur ${pillBorder} ${pillBg} ${
                  isDark ? "text-white/70" : "text-[#5c478d]"
                }`}
              >
                <span className="inline-block h-2 w-2 rounded-full bg-gradient-to-r from-[#6c5ce7] to-[#fd79a8] animate-pulse" />
                {hero.badge}
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
                  {hero.title}
                </h1>
                <p className={`max-w-lg text-base sm:text-lg ${subtleText} mx-auto lg:mx-0`}>
                  {hero.subtitle}
                </p>
              </div>

              {/* Highlights */}
              <div className={`space-y-3 text-sm ${subtleText}`}>
                {hero.highlights.map((item) => (
                  <div key={item} className="flex items-center gap-3 justify-center lg:justify-start">
                    <svg className="h-4 w-4 flex-shrink-0 text-[#6c5ce7]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Stats - hidden on mobile, visible on lg */}
              <div
                className={`hidden rounded-2xl border p-5 text-sm tracking-wide shadow-lg lg:block ${cardBorder} ${cardBg} ${subtleText}`}
              >
                <div className="grid grid-cols-3 gap-4">
                  {[hero.stat1, hero.stat2, hero.stat3].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="text-2xl font-bold bg-gradient-to-r from-[#6c5ce7] to-[#fd79a8] bg-clip-text text-transparent">
                        {stat.value}
                      </p>
                      <p className={`mt-0.5 text-[10px] tracking-[0.25em] ${subtleText}`}>{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Right: Login form */}
            <section
              className={`w-full max-w-md justify-self-center rounded-[28px] border p-6 shadow-xl backdrop-blur-xl sm:p-10 lg:justify-self-end lg:max-w-lg lg:p-12 ${cardBorder} ${cardBg} ${
                isDark ? "shadow-black/20" : "shadow-purple-100/40"
              }`}
            >
              <div className="mb-8 space-y-2 text-center">
                <p className={`text-xs font-semibold tracking-[0.4em] ${subtleText}`}>
                  {form.badge}
                </p>
                <h2 className="text-2xl font-bold sm:text-3xl">{form.title}</h2>
                <p className={`text-sm ${subtleText}`}>{form.subtitle}</p>
              </div>

              <LoginForm />

              <p className={`mt-6 text-center text-xs ${subtleText}`}>
                {form.needCredentials}{" "}
                <Link href="/signup" className="font-semibold text-[#fd79a8] hover:underline">
                  {form.requestInvite}
                </Link>
              </p>
              <Link
                href="/signup"
                className={`mt-4 flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  isDark
                    ? "border-white/20 bg-white/[0.04] text-white hover:border-white/40 hover:bg-white/[0.08]"
                    : "border-[#cbc2de] bg-[#e8e4f1] text-[#2e174e] hover:border-[#b5aac8] hover:bg-[#e2ddef]"
                }`}
              >
                {form.signupButton}
                <span aria-hidden="true" className="text-base">&rarr;</span>
              </Link>
            </section>
          </main>

          {/* Footer */}
          <footer
            className={`grid gap-6 border-t py-8 text-sm sm:grid-cols-2 lg:grid-cols-4 ${subtleText} ${
              isDark ? "border-white/[0.04]" : "border-[#e3d8ff]"
            }`}
          >
            <div>
              <p className={`text-[10px] tracking-[0.3em] ${isDark ? "text-white/30" : "text-[#9a88c2]"}`}>
                {footer.aboutTitle}
              </p>
              <p className="mt-2 text-xs leading-relaxed">{footer.aboutText}</p>
            </div>
            <div>
              <p className={`text-[10px] tracking-[0.3em] ${isDark ? "text-white/30" : "text-[#9a88c2]"}`}>
                {footer.contactTitle}
              </p>
              <p className="mt-2 text-xs">info@estiva.studio</p>
              <p className="text-xs">+90 (212) 555 04 78</p>
            </div>
            <div>
              <p className={`text-[10px] tracking-[0.3em] ${isDark ? "text-white/30" : "text-[#9a88c2]"}`}>
                {footer.visitTitle}
              </p>
              <p className="mt-2 text-xs">{footer.visitSubtitle}</p>
              <p className="text-xs">Be\u015Fikta\u015F/\u0130stanbul</p>
            </div>
            <div>
              <p className={`text-[10px] tracking-[0.3em] ${isDark ? "text-white/30" : "text-[#9a88c2]"}`}>
                {footer.socialTitle}
              </p>
              <p className="mt-2 text-xs">Instagram / X / LinkedIn</p>
              <p className="text-xs">&copy; {new Date().getFullYear()} Estiva</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
