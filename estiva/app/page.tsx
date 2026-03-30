"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import LanguageToggle from "@/components/ui/LanguageToggle";
import ThemeToggle from "@/components/ui/ThemeToggle";
import type { SubscriptionPlan } from "@/types/api";

/* ─────────────────────── i18n copy ─────────────────────── */
const copy = {
  en: {
    nav: {
      features: "Features",
      pricing: "Pricing",
      testimonials: "Testimonials",
      contact: "Contact",
      login: "Sign in",
      signup: "Start Free",
    },
    hero: {
      badge: "THE FUTURE OF SALON MANAGEMENT",
      title1: "Transform Your",
      titleHighlight: "Beauty Center",
      title2: "Into a Digital Powerhouse",
      subtitle:
        "Estiva brings together appointment scheduling, staff management, customer tracking and financial analytics in one elegant platform. Trusted by hundreds of beauty centers.",
      cta: "Start Free Trial",
      ctaSecondary: "Explore Features",
      stat1Label: "Active Salons",
      stat1Value: "500+",
      stat2Label: "Appointments/Month",
      stat2Value: "50K+",
      stat3Label: "Customer Satisfaction",
      stat3Value: "99%",
    },
    features: {
      badge: "POWERFUL FEATURES",
      title: "Everything You Need to Run Your Salon",
      subtitle:
        "From appointment booking to financial reports, Estiva covers every aspect of salon management with elegance and precision.",
      items: [
        {
          icon: "calendar",
          title: "Smart Appointment System",
          desc: "Drag-and-drop calendar, automated reminders, online booking — never miss an appointment again.",
        },
        {
          icon: "users",
          title: "Staff Management",
          desc: "Track schedules, performance, commissions and attendance. Empower your team with their own digital workspace.",
        },
        {
          icon: "chart",
          title: "Financial Analytics",
          desc: "Real-time revenue dashboards, expense tracking, sales reports and profit analysis at your fingertips.",
        },
        {
          icon: "package",
          title: "Package & Product Sales",
          desc: "Create treatment packages, track sessions, manage product inventory and boost your retail revenue.",
        },
        {
          icon: "customers",
          title: "Customer Relations",
          desc: "Detailed customer profiles, visit history, preferences and automated birthday greetings.",
        },
        {
          icon: "shield",
          title: "Multi-Branch & Security",
          desc: "Manage multiple locations from one dashboard. Role-based access, encrypted data, KVKK compliant.",
        },
      ],
    },
    pricing: {
      badge: "PRICING PLANS",
      title: "Choose the Perfect Plan for Your Salon",
      subtitle:
        "Start with a free trial. No credit card required. Upgrade anytime as your business grows.",
      monthly: "Monthly",
      yearly: "Yearly",
      yearlyDiscount: "Save up to 20%",
      perMonth: "/mo",
      perYear: "/yr",
      staff: "staff",
      branches: "branch",
      features: "Features",
      sms: "SMS Integration",
      whatsapp: "WhatsApp Integration",
      social: "Social Media Integration",
      ai: "AI Features",
      unlimited: "Unlimited",
      selectPlan: "Get Started",
      popular: "MOST POPULAR",
      loadingPlans: "Loading plans...",
      errorPlans: "Plans could not be loaded",
    },
    testimonials: {
      badge: "TESTIMONIALS",
      title: "Loved by Beauty Professionals",
      subtitle: "See what salon owners say about Estiva.",
      items: [
        {
          name: "Aylin Demir",
          role: "Owner, Glow Beauty Studio",
          text: "Estiva completely transformed how we manage our salon. Appointments are seamless, staff is happier, and our revenue grew 40% in 6 months.",
          rating: 5,
        },
        {
          name: "Merve Yilmaz",
          role: "Manager, Luxe Hair & Spa",
          text: "The financial analytics alone are worth the investment. We can now see exactly where our money goes and make smarter decisions.",
          rating: 5,
        },
        {
          name: "Selin Kaya",
          role: "Founder, Belle Wellness",
          text: "Switching to Estiva was the best decision we made. Our customers love the online booking and we love the automated reminders.",
          rating: 5,
        },
      ],
    },
    stats: {
      items: [
        { value: 500, suffix: "+", label: "Beauty Centers" },
        { value: 15000, suffix: "+", label: "Happy Customers" },
        { value: 2, suffix: "M+", label: "Appointments Booked" },
        { value: 99, suffix: "%", label: "Uptime" },
      ],
    },
    cta: {
      title: "Ready to Elevate Your Salon?",
      subtitle:
        "Join hundreds of beauty centers already using Estiva. Start your free 14-day trial today — no credit card required.",
      button: "Start Free Trial",
      buttonSecondary: "Contact Sales",
    },
    contact: {
      badge: "CONTACT US",
      title: "Let's Talk About Your Needs",
      subtitle: "Have questions? We'd love to hear from you.",
      nameLabel: "Full Name",
      namePlaceholder: "Your full name",
      emailLabel: "Email",
      emailPlaceholder: "you@example.com",
      phoneLabel: "Phone",
      phonePlaceholder: "+90 5XX XXX XX XX",
      messageLabel: "Message",
      messagePlaceholder: "Tell us about your salon...",
      send: "Send Message",
      info: {
        address: "Levent Mah. Canan Sok. No:12, Besiktas/Istanbul",
        phone: "+90 (212) 555 04 78",
        email: "info@estiva.studio",
        hours: "Mon - Fri: 09:00 - 18:00",
      },
    },
    footer: {
      desc: "The modern salon management platform for beauty centers that care about elegance, precision, and growth.",
      product: "Product",
      productLinks: ["Features", "Pricing", "Integrations", "Updates"],
      company: "Company",
      companyLinks: ["About", "Blog", "Careers", "Press"],
      support: "Support",
      supportLinks: ["Help Center", "Documentation", "Status", "Contact"],
      legal: "Legal",
      legalLinks: ["Privacy", "Terms", "KVKK"],
      copyright: "Estiva. All rights reserved.",
    },
  },
  tr: {
    nav: {
      features: "\u00D6zellikler",
      pricing: "Paketler",
      testimonials: "Referanslar",
      contact: "\u0130leti\u015Fim",
      login: "Giri\u015F Yap",
      signup: "\u00DCcretsiz Ba\u015Fla",
    },
    hero: {
      badge: "SALON Y\u00D6NET\u0130M\u0130N\u0130N GELECE\u011E\u0130",
      title1: "G\u00FCzellik Merkezinizi",
      titleHighlight: "Dijital G\u00FCce",
      title2: "D\u00F6n\u00FC\u015Ft\u00FCr\u00FCn",
      subtitle:
        "Estiva randevu planlama, personel y\u00F6netimi, m\u00FC\u015Fteri takibi ve finansal analiti\u011Fi tek bir zarif platformda birle\u015Ftiriyor. Y\u00FCzlerce g\u00FCzellik merkezi taraf\u0131ndan tercih ediliyor.",
      cta: "\u00DCcretsiz Deneyin",
      ctaSecondary: "\u00D6zellikleri Ke\u015Ffedin",
      stat1Label: "Aktif Salon",
      stat1Value: "500+",
      stat2Label: "Ayl\u0131k Randevu",
      stat2Value: "50K+",
      stat3Label: "M\u00FC\u015Fteri Memnuniyeti",
      stat3Value: "99%",
    },
    features: {
      badge: "G\u00DC\u00C7L\u00DC \u00D6ZELL\u0130KLER",
      title: "Salonunuzu Y\u00F6netmek \u0130\u00E7in \u0130htiyac\u0131n\u0131z Olan Her \u015Eey",
      subtitle:
        "Randevu y\u00F6netiminden finansal raporlara, Estiva salon y\u00F6netiminin her alan\u0131n\u0131 zarafet ve hassasiyetle kapsar.",
      items: [
        {
          icon: "calendar",
          title: "Ak\u0131ll\u0131 Randevu Sistemi",
          desc: "S\u00FCr\u00FCkle-b\u0131rak takvim, otomatik hat\u0131rlatmalar, online rezervasyon \u2014 bir daha hi\u00E7bir randevuyu ka\u00E7\u0131rmay\u0131n.",
        },
        {
          icon: "users",
          title: "Personel Y\u00F6netimi",
          desc: "\u00C7al\u0131\u015Fma takvimlerini, performans\u0131, komisyonlar\u0131 ve devams\u0131zl\u0131\u011F\u0131 takip edin. Ekibinize kendi dijital alanlar\u0131n\u0131 verin.",
        },
        {
          icon: "chart",
          title: "Finansal Analitik",
          desc: "Ger\u00E7ek zamanl\u0131 gelir panelleri, gider takibi, sat\u0131\u015F raporlar\u0131 ve k\u00E2r analizi parmaklar\u0131n\u0131z\u0131n ucunda.",
        },
        {
          icon: "package",
          title: "Paket & \u00DCr\u00FCn Sat\u0131\u015Flar\u0131",
          desc: "Bak\u0131m paketleri olu\u015Fturun, seanslar\u0131 takip edin, \u00FCr\u00FCn stoku y\u00F6netin ve perakende gelirinizi art\u0131r\u0131n.",
        },
        {
          icon: "customers",
          title: "M\u00FC\u015Fteri \u0130li\u015Fkileri",
          desc: "Detayl\u0131 m\u00FC\u015Fteri profilleri, ziyaret ge\u00E7mi\u015Fi, tercihler ve otomatik do\u011Fum g\u00FCn\u00FC kutlamalar\u0131.",
        },
        {
          icon: "shield",
          title: "\u00C7oklu \u015Eube & G\u00FCvenlik",
          desc: "Birden fazla \u015Fubeyi tek panelden y\u00F6netin. Rol tabanl\u0131 eri\u015Fim, \u015Fifrelenmi\u015F veri, KVKK uyumlu.",
        },
      ],
    },
    pricing: {
      badge: "F\u0130YATLANDIRMA",
      title: "Salonunuz \u0130\u00E7in M\u00FCkemmel Plan\u0131 Se\u00E7in",
      subtitle:
        "\u00DCcretsiz deneme ile ba\u015Flay\u0131n. Kredi kart\u0131 gerekmez. \u0130\u015Fletmeniz b\u00FCy\u00FCd\u00FCk\u00E7e istedi\u011Finiz zaman y\u00FCkseltin.",
      monthly: "Ayl\u0131k",
      yearly: "Y\u0131ll\u0131k",
      yearlyDiscount: "%20'ye kadar tasarruf",
      perMonth: "/ay",
      perYear: "/y\u0131l",
      staff: "personel",
      branches: "\u015Fube",
      features: "\u00D6zellikler",
      sms: "SMS Entegrasyonu",
      whatsapp: "WhatsApp Entegrasyonu",
      social: "Sosyal Medya Entegrasyonu",
      ai: "Yapay Zek\u00E2 \u00D6zellikleri",
      unlimited: "S\u0131n\u0131rs\u0131z",
      selectPlan: "Hemen Ba\u015Fla",
      popular: "EN POP\u00DCLER",
      loadingPlans: "Planlar y\u00FCkleniyor...",
      errorPlans: "Planlar y\u00FCklenemedi",
    },
    testimonials: {
      badge: "REFERANSLAR",
      title: "G\u00FCzellik Profesyonelleri Taraf\u0131ndan Seviliyor",
      subtitle: "Salon sahiplerinin Estiva hakk\u0131nda s\u00F6ylediklerine bak\u0131n.",
      items: [
        {
          name: "Aylin Demir",
          role: "Kurucu, Glow Beauty Studio",
          text: "Estiva salonumuzu y\u00F6netme \u015Feklimizi tamamen d\u00F6n\u00FC\u015Ft\u00FCrd\u00FC. Randevular kusursuz, personel daha mutlu ve gelirimiz 6 ayda %40 artt\u0131.",
          rating: 5,
        },
        {
          name: "Merve Y\u0131lmaz",
          role: "M\u00FCd\u00FCr, Luxe Hair & Spa",
          text: "Sadece finansal analitik bile yat\u0131r\u0131ma de\u011Fer. Art\u0131k param\u0131z\u0131n nereye gitti\u011Fini g\u00F6rerek daha ak\u0131ll\u0131 kararlar alabiliyoruz.",
          rating: 5,
        },
        {
          name: "Selin Kaya",
          role: "Kurucu, Belle Wellness",
          text: "Estiva'ya ge\u00E7mek ald\u0131\u011F\u0131m\u0131z en iyi karard\u0131. M\u00FC\u015Fterilerimiz online rezervasyonu, biz de otomatik hat\u0131rlat\u0131c\u0131lar\u0131 \u00E7ok seviyoruz.",
          rating: 5,
        },
      ],
    },
    stats: {
      items: [
        { value: 500, suffix: "+", label: "G\u00FCzellik Merkezi" },
        { value: 15000, suffix: "+", label: "Mutlu M\u00FC\u015Fteri" },
        { value: 2, suffix: "M+", label: "Olu\u015Fturulan Randevu" },
        { value: 99, suffix: "%", label: "\u00C7al\u0131\u015Fma S\u00FCresi" },
      ],
    },
    cta: {
      title: "Salonunuzu Y\u00FCkseltmeye Haz\u0131r M\u0131s\u0131n\u0131z?",
      subtitle:
        "Estiva'y\u0131 kullanan y\u00FCzlerce g\u00FCzellik merkezine kat\u0131l\u0131n. 14 g\u00FCnl\u00FCk \u00FCcretsiz denemenizi bug\u00FCn ba\u015Flat\u0131n \u2014 kredi kart\u0131 gerekmez.",
      button: "\u00DCcretsiz Deneyin",
      buttonSecondary: "Sat\u0131\u015Fla \u0130leti\u015Fime Ge\u00E7in",
    },
    contact: {
      badge: "\u0130LET\u0130\u015E\u0130M",
      title: "\u0130htiya\u00E7lar\u0131n\u0131z Hakk\u0131nda Konu\u015Fal\u0131m",
      subtitle: "Sorular\u0131n\u0131z m\u0131 var? Sizden haber almak isteriz.",
      nameLabel: "Ad Soyad",
      namePlaceholder: "Ad\u0131n\u0131z ve soyad\u0131n\u0131z",
      emailLabel: "E-posta",
      emailPlaceholder: "siz@ornek.com",
      phoneLabel: "Telefon",
      phonePlaceholder: "+90 5XX XXX XX XX",
      messageLabel: "Mesaj",
      messagePlaceholder: "Salonunuz hakk\u0131nda bilgi verin...",
      send: "Mesaj G\u00F6nder",
      info: {
        address: "Levent Mah. Canan Sok. No:12, Be\u015Fikta\u015F/\u0130stanbul",
        phone: "+90 (212) 555 04 78",
        email: "info@estiva.studio",
        hours: "Pzt - Cum: 09:00 - 18:00",
      },
    },
    footer: {
      desc: "Zarafet, hassasiyet ve b\u00FCy\u00FCmeyi \u00F6nemseyen g\u00FCzellik merkezleri i\u00E7in modern salon y\u00F6netim platformu.",
      product: "\u00DCr\u00FCn",
      productLinks: ["\u00D6zellikler", "Fiyatland\u0131rma", "Entegrasyonlar", "G\u00FCncellemeler"],
      company: "\u015Eirket",
      companyLinks: ["Hakk\u0131m\u0131zda", "Blog", "Kariyer", "Bas\u0131n"],
      support: "Destek",
      supportLinks: ["Yard\u0131m Merkezi", "Dok\u00FCmantasyon", "Durum", "\u0130leti\u015Fim"],
      legal: "Yasal",
      legalLinks: ["Gizlilik", "Ko\u015Fullar", "KVKK"],
      copyright: "Estiva. T\u00FCm haklar\u0131 sakl\u0131d\u0131r.",
    },
  },
};

/* ─────────────────────── Feature Icons (inline SVG) ─────────────────────── */
function FeatureIcon({ type, className }: { type: string; className?: string }) {
  const c = className ?? "w-8 h-8";
  switch (type) {
    case "calendar":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <circle cx="12" cy="16" r="1" fill="currentColor" />
        </svg>
      );
    case "users":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "chart":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
          <line x1="2" y1="20" x2="22" y2="20" />
        </svg>
      );
    case "package":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
    case "customers":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case "shield":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      );
    default:
      return null;
  }
}

/* ─────────────────────── useInView hook ─────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

/* ─────────────────────── AnimatedCounter ─────────────────────── */
function AnimatedCounter({ target, suffix, duration = 2000 }: { target: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const { ref, isInView } = useInView(0.3);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = copy[language];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState(false);

  // Plan name translations
  const PLAN_NAME_MAP: Record<string, { en: string; tr: string }> = {
    "Başlangıç Paketi": { en: "Starter Package", tr: "Başlangıç Paketi" },
    "Altın Paket": { en: "Gold Package", tr: "Altın Paket" },
    "Platin Paket": { en: "Platinum Package", tr: "Platin Paket" },
    "Starter": { en: "Starter", tr: "Başlangıç" },
    "Gold": { en: "Gold", tr: "Altın" },
    "Platinum": { en: "Platinum", tr: "Platin" },
    "Professional": { en: "Professional", tr: "Profesyonel" },
    "Enterprise": { en: "Enterprise", tr: "Kurumsal" },
  };
  const getLocalizedPlanName = (name: string) => PLAN_NAME_MAP[name]?.[language] ?? name;

  // Scroll detection for navbar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5232/api";
        const res = await fetch(`${baseUrl}/subscription/plans`);
        const json = await res.json();
        const data: SubscriptionPlan[] = json.data ?? json;
        setPlans(data.filter((p) => p.isActive));
      } catch {
        setPlansError(true);
      } finally {
        setPlansLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // Smooth scroll
  const scrollTo = useCallback((id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  /* ── Theme classes ── */
  const bg = isDark ? "bg-[#0b0614]" : "bg-[#f8f5ff]";
  const text = isDark ? "text-white" : "text-[#1f1233]";
  const subtle = isDark ? "text-white/60" : "text-[#6a5c8c]";
  const cardBg = isDark ? "bg-white/[0.04]" : "bg-white";
  const cardBorder = isDark ? "border-white/[0.08]" : "border-[#e3d8ff]";
  const sectionAlt = isDark ? "bg-[#0f0920]" : "bg-[#f0ebff]";

  /* ── Animations helper ── */
  function Section({
    children,
    className = "",
    id,
  }: {
    children: React.ReactNode;
    className?: string;
    id?: string;
  }) {
    const { ref, isInView } = useInView(0.1);
    return (
      <section
        ref={ref}
        id={id}
        className={`transition-all duration-700 ${
          isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        } ${className}`}
      >
        {children}
      </section>
    );
  }

  return (
    <div className={`min-h-screen ${bg} ${text} overflow-x-hidden`}>
      {/* ═══ GRADIENT BACKGROUND ═══ */}
      {isDark && (
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(108,92,231,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(253,121,168,0.12),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(0,206,201,0.08),transparent_50%)]" />
        </div>
      )}

      {/* ═══ NAVBAR ═══ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? isDark
              ? "bg-[#0b0614]/90 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-white/[0.06]"
              : "bg-white/90 backdrop-blur-xl shadow-lg shadow-purple-100/40 border-b border-[#e3d8ff]"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button onClick={() => scrollTo("hero")} className="text-xl font-bold tracking-[0.4em]">
            ESTIVA
          </button>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            {(
              [
                ["features", t.nav.features],
                ["pricing", t.nav.pricing],
                ["testimonials", t.nav.testimonials],
                ["contact", t.nav.contact],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`text-sm font-medium transition-colors ${subtle} hover:${isDark ? "text-white" : "text-[#1f1233]"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <LanguageToggle />
            <ThemeToggle />
            <Link
              href="/login"
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                isDark
                  ? "border border-white/20 text-white hover:bg-white/10"
                  : "border border-[#d0c0f5] text-[#3b2268] hover:bg-[#efe9ff]"
              }`}
            >
              {t.nav.login}
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-gradient-to-r from-[#6c5ce7] to-[#fd79a8] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02]"
            >
              {t.nav.signup}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-3 md:hidden">
            <LanguageToggle />
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 ${subtle}`}
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div
            className={`md:hidden border-t ${
              isDark ? "bg-[#0b0614]/95 backdrop-blur-xl border-white/10" : "bg-white/95 backdrop-blur-xl border-[#e3d8ff]"
            }`}
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {(
                [
                  ["features", t.nav.features],
                  ["pricing", t.nav.pricing],
                  ["testimonials", t.nav.testimonials],
                  ["contact", t.nav.contact],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className={`rounded-lg px-4 py-3 text-left text-sm font-medium ${subtle} hover:${
                    isDark ? "bg-white/5" : "bg-[#efe9ff]"
                  }`}
                >
                  {label}
                </button>
              ))}
              <div className="mt-3 flex flex-col gap-2">
                <Link
                  href="/login"
                  className={`rounded-xl px-4 py-3 text-center text-sm font-semibold transition ${
                    isDark ? "border border-white/20 text-white" : "border border-[#d0c0f5] text-[#3b2268]"
                  }`}
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/signup"
                  className="rounded-xl bg-gradient-to-r from-[#6c5ce7] to-[#fd79a8] px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  {t.nav.signup}
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className="relative z-10">
        {/* ═══ HERO ═══ */}
        <section id="hero" className="relative px-4 pt-32 pb-20 sm:px-6 sm:pt-40 sm:pb-28 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-4xl text-center">
              {/* Badge */}
              <div
                className={`mx-auto mb-8 inline-flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-semibold tracking-[0.3em] animate-fade-in-down ${
                  isDark
                    ? "border-white/15 bg-white/[0.06] text-white/80"
                    : "border-[#dacfff] bg-white text-[#5c478d]"
                }`}
              >
                <span className="inline-block h-2 w-2 rounded-full bg-gradient-to-r from-[#6c5ce7] to-[#fd79a8] animate-pulse" />
                {t.hero.badge}
              </div>

              {/* Title */}
              <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in-up">
                {t.hero.title1}{" "}
                <span className="bg-gradient-to-r from-[#6c5ce7] via-[#fd79a8] to-[#00cec9] bg-clip-text text-transparent">
                  {t.hero.titleHighlight}
                </span>{" "}
                {t.hero.title2}
              </h1>

              {/* Subtitle */}
              <p
                className={`mx-auto mb-10 max-w-2xl text-base sm:text-lg ${subtle} animate-fade-in-up`}
                style={{ animationDelay: "0.2s" }}
              >
                {t.hero.subtitle}
              </p>

              {/* CTA buttons */}
              <div
                className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up"
                style={{ animationDelay: "0.4s" }}
              >
                <Link
                  href="/signup"
                  className="group relative rounded-2xl bg-gradient-to-r from-[#6c5ce7] to-[#fd79a8] px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-purple-500/30 transition-all hover:shadow-purple-500/40 hover:scale-[1.03]"
                >
                  <span className="relative z-10">{t.hero.cta}</span>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#fd79a8] to-[#6c5ce7] opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
                <button
                  onClick={() => scrollTo("features")}
                  className={`flex items-center gap-2 rounded-2xl border px-8 py-4 text-base font-semibold transition ${
                    isDark
                      ? "border-white/20 text-white hover:bg-white/5"
                      : "border-[#d0c0f5] text-[#3b2268] hover:bg-[#efe9ff]"
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                  {t.hero.ctaSecondary}
                </button>
              </div>
            </div>

            {/* Hero stats */}
            <div
              className={`mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-4 rounded-3xl border p-6 sm:p-8 backdrop-blur-sm animate-fade-in-up ${cardBorder} ${cardBg}`}
              style={{ animationDelay: "0.6s" }}
            >
              {[
                { label: t.hero.stat1Label, value: t.hero.stat1Value },
                { label: t.hero.stat2Label, value: t.hero.stat2Value },
                { label: t.hero.stat3Label, value: t.hero.stat3Value },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold sm:text-3xl bg-gradient-to-r from-[#6c5ce7] to-[#fd79a8] bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className={`mt-1 text-xs sm:text-sm ${subtle}`}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative floating elements */}
          {isDark && (
            <>
              <div className="absolute top-40 left-10 h-72 w-72 rounded-full bg-[#6c5ce7]/10 blur-[100px] animate-float" />
              <div className="absolute bottom-20 right-10 h-64 w-64 rounded-full bg-[#fd79a8]/10 blur-[100px] animate-float-delayed" />
            </>
          )}
        </section>

        {/* ═══ FEATURES ═══ */}
        <div className={sectionAlt}>
          <Section id="features" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="mx-auto max-w-3xl text-center">
                <div
                  className={`mx-auto mb-6 inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-semibold tracking-[0.3em] ${
                    isDark ? "border-white/15 bg-white/[0.06] text-white/70" : "border-[#dacfff] bg-white text-[#5c478d]"
                  }`}
                >
                  {t.features.badge}
                </div>
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">{t.features.title}</h2>
                <p className={`text-base sm:text-lg ${subtle}`}>{t.features.subtitle}</p>
              </div>

              <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {t.features.items.map((feat, i) => (
                  <div
                    key={feat.title}
                    className={`group rounded-2xl border p-6 sm:p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${cardBorder} ${cardBg} ${
                      isDark ? "hover:bg-white/[0.06] hover:border-white/15 hover:shadow-purple-500/10" : "hover:shadow-purple-100/50 hover:border-[#d0c0f5]"
                    }`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="mb-5 inline-flex rounded-xl bg-gradient-to-br from-[#6c5ce7]/20 to-[#fd79a8]/20 p-3 text-[#6c5ce7] transition-colors group-hover:from-[#6c5ce7]/30 group-hover:to-[#fd79a8]/30">
                      <FeatureIcon type={feat.icon} />
                    </div>
                    <h3 className="mb-3 text-lg font-semibold">{feat.title}</h3>
                    <p className={`text-sm leading-relaxed ${subtle}`}>{feat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>

        {/* ═══ STATS BANNER ═══ */}
        <Section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div
              className={`rounded-3xl border p-8 sm:p-12 ${
                isDark
                  ? "border-white/[0.08] bg-gradient-to-r from-[#6c5ce7]/10 via-[#fd79a8]/10 to-[#00cec9]/10"
                  : "border-[#e3d8ff] bg-gradient-to-r from-[#6c5ce7]/5 via-[#fd79a8]/5 to-[#00cec9]/5"
              }`}
            >
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                {t.stats.items.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-3xl font-bold sm:text-4xl lg:text-5xl bg-gradient-to-r from-[#6c5ce7] to-[#fd79a8] bg-clip-text text-transparent">
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className={`mt-2 text-sm ${subtle}`}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ═══ PRICING ═══ */}
        <div className={sectionAlt}>
          <Section id="pricing" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="mx-auto max-w-3xl text-center">
                <div
                  className={`mx-auto mb-6 inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-semibold tracking-[0.3em] ${
                    isDark ? "border-white/15 bg-white/[0.06] text-white/70" : "border-[#dacfff] bg-white text-[#5c478d]"
                  }`}
                >
                  {t.pricing.badge}
                </div>
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">{t.pricing.title}</h2>
                <p className={`text-base sm:text-lg ${subtle}`}>{t.pricing.subtitle}</p>

                {/* Monthly/Yearly toggle */}
                <div className="mt-8 flex items-center justify-center gap-4">
                  <span className={`text-sm font-medium ${!isYearly ? "" : subtle}`}>{t.pricing.monthly}</span>
                  <button
                    onClick={() => setIsYearly(!isYearly)}
                    className={`relative h-8 w-14 rounded-full transition-colors ${
                      isYearly ? "bg-gradient-to-r from-[#6c5ce7] to-[#fd79a8]" : isDark ? "bg-white/20" : "bg-[#d0c0f5]"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                        isYearly ? "translate-x-6" : ""
                      }`}
                    />
                  </button>
                  <span className={`text-sm font-medium ${isYearly ? "" : subtle}`}>
                    {t.pricing.yearly}
                    <span className="ml-2 rounded-full bg-gradient-to-r from-[#6c5ce7] to-[#fd79a8] px-2 py-0.5 text-xs text-white">
                      {t.pricing.yearlyDiscount}
                    </span>
                  </span>
                </div>
              </div>

              {/* Plans grid */}
              <div className="mt-12">
                {plansLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6c5ce7] border-t-transparent" />
                    <span className={`ml-3 ${subtle}`}>{t.pricing.loadingPlans}</span>
                  </div>
                ) : plansError || plans.length === 0 ? (
                  /* Fallback: show static pricing if API fails */
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      { name: "Starter", monthly: 299, yearly: 2870, staff: 3, branch: 1 },
                      { name: "Professional", monthly: 599, yearly: 5750, staff: 10, branch: 3, popular: true },
                      { name: "Enterprise", monthly: 999, yearly: 9590, staff: 50, branch: 10 },
                    ].map((plan) => (
                      <PricingCard
                        key={plan.name}
                        name={plan.name}
                        price={isYearly ? plan.yearly : plan.monthly}
                        period={isYearly ? t.pricing.perYear : t.pricing.perMonth}
                        staff={`${plan.staff} ${t.pricing.staff}`}
                        branches={`${plan.branch} ${t.pricing.branches}`}
                        features={[t.pricing.sms, t.pricing.whatsapp]}
                        popular={plan.popular}
                        popularLabel={t.pricing.popular}
                        cta={t.pricing.selectPlan}
                        isDark={isDark}
                        cardBg={cardBg}
                        cardBorder={cardBorder}
                        subtle={subtle}
                      />
                    ))}
                  </div>
                ) : (
                  <div className={`grid gap-6 ${plans.length === 1 ? "max-w-md mx-auto" : plans.length === 2 ? "sm:grid-cols-2 max-w-3xl mx-auto" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
                    {plans.map((plan, i) => (
                      <PricingCard
                        key={plan.id}
                        name={getLocalizedPlanName(plan.name)}
                        price={isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                        period={isYearly ? t.pricing.perYear : t.pricing.perMonth}
                        staff={plan.maxStaffCount <= 0 ? t.pricing.unlimited : `${plan.maxStaffCount} ${t.pricing.staff}`}
                        branches={plan.maxBranchCount <= 0 ? t.pricing.unlimited : `${plan.maxBranchCount} ${t.pricing.branches}`}
                        features={[
                          ...(plan.hasSmsIntegration ? [t.pricing.sms] : []),
                          ...(plan.hasWhatsappIntegration ? [t.pricing.whatsapp] : []),
                          ...(plan.hasSocialMediaIntegration ? [t.pricing.social] : []),
                          ...(plan.hasAiFeatures ? [t.pricing.ai] : []),
                        ]}
                        popular={i === 1 && plans.length >= 3}
                        popularLabel={t.pricing.popular}
                        cta={t.pricing.selectPlan}
                        isDark={isDark}
                        cardBg={cardBg}
                        cardBorder={cardBorder}
                        subtle={subtle}
                        description={plan.description}
                        extraFeatures={plan.features}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Section>
        </div>

        {/* ═══ TESTIMONIALS ═══ */}
        <Section id="testimonials" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <div
                className={`mx-auto mb-6 inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-semibold tracking-[0.3em] ${
                  isDark ? "border-white/15 bg-white/[0.06] text-white/70" : "border-[#dacfff] bg-white text-[#5c478d]"
                }`}
              >
                {t.testimonials.badge}
              </div>
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">{t.testimonials.title}</h2>
              <p className={`text-base sm:text-lg ${subtle}`}>{t.testimonials.subtitle}</p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {t.testimonials.items.map((item) => (
                <div
                  key={item.name}
                  className={`rounded-2xl border p-6 sm:p-8 transition-all duration-300 hover:scale-[1.02] ${cardBorder} ${cardBg} ${
                    isDark ? "hover:shadow-xl hover:shadow-purple-500/5" : "hover:shadow-lg hover:shadow-purple-100/50"
                  }`}
                >
                  {/* Stars */}
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <svg key={i} className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className={`mb-6 text-sm leading-relaxed ${subtle}`}>&ldquo;{item.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#fd79a8] text-sm font-bold text-white">
                      {item.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className={`text-xs ${subtle}`}>{item.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ═══ CTA BANNER ═══ */}
        <Section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#6c5ce7] via-[#8b5cf6] to-[#fd79a8] p-8 sm:p-16 text-center text-white">
              {/* Decorative circles */}
              <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
              <div className="relative z-10">
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl">{t.cta.title}</h2>
                <p className="mx-auto mb-8 max-w-xl text-white/80">{t.cta.subtitle}</p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    href="/signup"
                    className="rounded-2xl bg-white px-8 py-4 text-base font-semibold text-[#6c5ce7] shadow-xl transition hover:scale-[1.03] hover:shadow-2xl"
                  >
                    {t.cta.button}
                  </Link>
                  <button
                    onClick={() => scrollTo("contact")}
                    className="rounded-2xl border-2 border-white/40 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                  >
                    {t.cta.buttonSecondary}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ═══ CONTACT ═══ */}
        <div className={sectionAlt}>
          <Section id="contact" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="mx-auto max-w-3xl text-center">
                <div
                  className={`mx-auto mb-6 inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-semibold tracking-[0.3em] ${
                    isDark ? "border-white/15 bg-white/[0.06] text-white/70" : "border-[#dacfff] bg-white text-[#5c478d]"
                  }`}
                >
                  {t.contact.badge}
                </div>
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">{t.contact.title}</h2>
                <p className={`text-base sm:text-lg ${subtle}`}>{t.contact.subtitle}</p>
              </div>

              <div className="mt-12 grid gap-8 lg:grid-cols-2">
                {/* Contact form */}
                <div className={`rounded-2xl border p-6 sm:p-8 ${cardBorder} ${cardBg}`}>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                    }}
                    className="space-y-5"
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className={`block text-sm font-medium ${subtle}`}>{t.contact.nameLabel}</label>
                        <input
                          type="text"
                          placeholder={t.contact.namePlaceholder}
                          className={`w-full rounded-xl px-4 py-3 text-sm transition ${
                            isDark
                              ? "border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-2 focus:ring-white/10"
                              : "border-[#e3d8ff] bg-white text-[#1f1233] placeholder:text-[#9a88c2] focus:border-[#a18ddc] focus:ring-2 focus:ring-[#b79df1]/30"
                          }`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={`block text-sm font-medium ${subtle}`}>{t.contact.emailLabel}</label>
                        <input
                          type="email"
                          placeholder={t.contact.emailPlaceholder}
                          className={`w-full rounded-xl px-4 py-3 text-sm transition ${
                            isDark
                              ? "border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-2 focus:ring-white/10"
                              : "border-[#e3d8ff] bg-white text-[#1f1233] placeholder:text-[#9a88c2] focus:border-[#a18ddc] focus:ring-2 focus:ring-[#b79df1]/30"
                          }`}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={`block text-sm font-medium ${subtle}`}>{t.contact.phoneLabel}</label>
                      <input
                        type="tel"
                        placeholder={t.contact.phonePlaceholder}
                        className={`w-full rounded-xl px-4 py-3 text-sm transition ${
                          isDark
                            ? "border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-2 focus:ring-white/10"
                            : "border-[#e3d8ff] bg-white text-[#1f1233] placeholder:text-[#9a88c2] focus:border-[#a18ddc] focus:ring-2 focus:ring-[#b79df1]/30"
                        }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={`block text-sm font-medium ${subtle}`}>{t.contact.messageLabel}</label>
                      <textarea
                        rows={4}
                        placeholder={t.contact.messagePlaceholder}
                        className={`w-full rounded-xl px-4 py-3 text-sm transition resize-none ${
                          isDark
                            ? "border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-2 focus:ring-white/10"
                            : "border-[#e3d8ff] bg-white text-[#1f1233] placeholder:text-[#9a88c2] focus:border-[#a18ddc] focus:ring-2 focus:ring-[#b79df1]/30"
                        }`}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-gradient-to-r from-[#6c5ce7] to-[#fd79a8] py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:shadow-xl hover:scale-[1.01]"
                    >
                      {t.contact.send}
                    </button>
                  </form>
                </div>

                {/* Contact info */}
                <div className="space-y-6">
                  {[
                    {
                      icon: (
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      ),
                      title: language === "en" ? "Address" : "Adres",
                      value: t.contact.info.address,
                    },
                    {
                      icon: (
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      ),
                      title: language === "en" ? "Phone" : "Telefon",
                      value: t.contact.info.phone,
                    },
                    {
                      icon: (
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      ),
                      title: "E-posta",
                      value: t.contact.info.email,
                    },
                    {
                      icon: (
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      ),
                      title: language === "en" ? "Working Hours" : "Calisma Saatleri",
                      value: t.contact.info.hours,
                    },
                  ].map((info) => (
                    <div
                      key={info.title}
                      className={`flex items-start gap-4 rounded-2xl border p-5 transition ${cardBorder} ${cardBg} ${
                        isDark ? "hover:bg-white/[0.06]" : "hover:bg-[#efe9ff]"
                      }`}
                    >
                      <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-[#6c5ce7]/20 to-[#fd79a8]/20 p-3 text-[#6c5ce7]">
                        {info.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{info.title}</p>
                        <p className={`text-sm ${subtle}`}>{info.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* ═══ FOOTER ═══ */}
        <footer className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
              {/* Brand */}
              <div className="lg:col-span-2">
                <p className="text-xl font-bold tracking-[0.4em]">ESTIVA</p>
                <p className={`mt-3 max-w-sm text-sm leading-relaxed ${subtle}`}>{t.footer.desc}</p>
                <div className="mt-5 flex gap-3">
                  {["instagram", "twitter", "linkedin"].map((social) => (
                    <a
                      key={social}
                      href="#"
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${cardBorder} ${
                        isDark ? "hover:bg-white/10" : "hover:bg-[#efe9ff]"
                      }`}
                      aria-label={social}
                    >
                      {social === "instagram" && (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="2" width="20" height="20" rx="5" />
                          <circle cx="12" cy="12" r="5" />
                          <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
                        </svg>
                      )}
                      {social === "twitter" && (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      )}
                      {social === "linkedin" && (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                          <rect x="2" y="9" width="4" height="12" />
                          <circle cx="4" cy="4" r="2" />
                        </svg>
                      )}
                    </a>
                  ))}
                </div>
              </div>

              {/* Link columns */}
              {[
                { title: t.footer.product, links: t.footer.productLinks, sections: ["features", "pricing", null, null] },
                { title: t.footer.support, links: t.footer.supportLinks, sections: [null, null, null, "contact"] },
                { title: t.footer.legal, links: t.footer.legalLinks, sections: [null, null, null] },
              ].map((col) => (
                <div key={col.title}>
                  <p className="text-sm font-semibold">{col.title}</p>
                  <ul className={`mt-3 space-y-2 text-sm ${subtle}`}>
                    {col.links.map((link, i) => (
                      <li key={link}>
                        {col.sections[i] ? (
                          <button
                            onClick={() => scrollTo(col.sections[i]!)}
                            className={`transition ${isDark ? "hover:text-white" : "hover:text-[#1f1233]"}`}
                          >
                            {link}
                          </button>
                        ) : (
                          <a href="#" className={`transition ${isDark ? "hover:text-white" : "hover:text-[#1f1233]"}`}>
                            {link}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className={`mt-12 border-t pt-8 text-center text-sm ${subtle} ${isDark ? "border-white/[0.06]" : "border-[#e3d8ff]"}`}>
              &copy; {new Date().getFullYear()} {t.footer.copyright}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ─────────────────────── Pricing Card ─────────────────────── */
function PricingCard({
  name,
  price,
  period,
  staff,
  branches,
  features,
  popular,
  popularLabel,
  cta,
  isDark,
  cardBg,
  cardBorder,
  subtle,
  description,
  extraFeatures,
}: {
  name: string;
  price: number;
  period: string;
  staff: string;
  branches: string;
  features: string[];
  popular?: boolean;
  popularLabel: string;
  cta: string;
  isDark: boolean;
  cardBg: string;
  cardBorder: string;
  subtle: string;
  description?: string | null;
  extraFeatures?: string | null;
}) {
  const parsedFeatures: string[] = [];
  if (extraFeatures) {
    try {
      const arr = JSON.parse(extraFeatures);
      if (Array.isArray(arr)) parsedFeatures.push(...arr);
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className={`relative rounded-2xl border p-6 sm:p-8 transition-all duration-300 hover:scale-[1.02] ${
        popular
          ? "border-[#6c5ce7] bg-gradient-to-b from-[#6c5ce7]/10 to-transparent shadow-xl shadow-purple-500/10"
          : `${cardBorder} ${cardBg}`
      } ${isDark ? "hover:shadow-xl hover:shadow-purple-500/5" : "hover:shadow-lg hover:shadow-purple-100/50"}`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#6c5ce7] to-[#fd79a8] px-4 py-1 text-xs font-bold text-white">
          {popularLabel}
        </div>
      )}
      <h3 className="text-xl font-bold">{name}</h3>
      {description && <p className={`mt-1 text-sm ${subtle}`}>{description}</p>}
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold">
          {price > 0 ? `${Math.round(price).toLocaleString("tr-TR")}` : "0"}
        </span>
        <span className={`text-lg ${subtle}`}>₺{period}</span>
      </div>

      <div className={`my-6 h-px ${isDark ? "bg-white/10" : "bg-[#e3d8ff]"}`} />

      <ul className="space-y-3">
        <li className="flex items-center gap-3 text-sm">
          <svg className="h-5 w-5 flex-shrink-0 text-[#6c5ce7]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {staff}
        </li>
        <li className="flex items-center gap-3 text-sm">
          <svg className="h-5 w-5 flex-shrink-0 text-[#6c5ce7]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {branches}
        </li>
        {features.map((feat) => (
          <li key={feat} className="flex items-center gap-3 text-sm">
            <svg className="h-5 w-5 flex-shrink-0 text-[#6c5ce7]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {feat}
          </li>
        ))}
        {parsedFeatures.map((feat) => (
          <li key={feat} className="flex items-center gap-3 text-sm">
            <svg className="h-5 w-5 flex-shrink-0 text-[#6c5ce7]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {feat}
          </li>
        ))}
      </ul>

      <Link
        href="/signup"
        className={`mt-8 block rounded-xl py-3.5 text-center text-sm font-semibold transition ${
          popular
            ? "bg-gradient-to-r from-[#6c5ce7] to-[#fd79a8] text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:scale-[1.02]"
            : isDark
              ? "border border-white/20 text-white hover:bg-white/10"
              : "border border-[#d0c0f5] text-[#3b2268] hover:bg-[#efe9ff]"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
