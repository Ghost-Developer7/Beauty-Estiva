"use client";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

type FieldConfig = {
  name: string;
  type?: string;
  fullWidth?: boolean;
  labels: { en: string; tr: string };
  placeholders: { en: string; tr: string };
};

const companyFields: FieldConfig[] = [
  {
    name: "businessName",
    labels: { en: "Brand / trade name", tr: "Marka / ticari ad" },
    placeholders: { en: "Glow Atelier", tr: "Glow Atelier" },
  },
  {
    name: "legalName",
    labels: { en: "Legal entity", tr: "Tuzel unvan" },
    placeholders: { en: "Glow Atelier AS", tr: "Glow Atelier AS" },
  },
  {
    name: "branchCount",
    type: "number",
    labels: { en: "Branch count", tr: "Sube sayisi" },
    placeholders: { en: "3", tr: "3" },
  },
  {
    name: "city",
    labels: { en: "Headquarters city", tr: "Merkez sehir" },
    placeholders: { en: "Istanbul", tr: "Istanbul" },
  },
  {
    name: "taxNumber",
    labels: { en: "Tax / VAT number", tr: "Vergi / VKN" },
    placeholders: { en: "1234567890", tr: "1234567890" },
  },
  {
    name: "website",
    labels: { en: "Website", tr: "Web sitesi" },
    placeholders: { en: "estiva.studio", tr: "estiva.studio" },
  },
];

const servicePackages = {
  en: [
    "Laser & skincare",
    "Body shaping",
    "Hair services",
    "Medical aesthetics",
    "Makeup & brow bar",
    "Spa & wellness",
  ],
  tr: [
    "Lazer & cilt bakimi",
    "Vucut sekillendirme",
    "Sac hizmetleri",
    "Medikal estetik",
    "Makyaj & kas bar",
    "Spa & wellness",
  ],
};

const copy = {
  en: {
    companyBadge: "Company membership",
    companyTitle: "Tell us about your beauty collective",
    servicesPrompt: "What services does the company offer?",
    notesLabel: "Anything else we should know?",
    notesPlaceholder:
      "Branches opening soon, franchising status, existing software, etc.",
    submit: "Request a tailored demo",
    disclaimer:
      "Once approved, you'll be able to add staff users from your dashboard.",
  },
  tr: {
    companyBadge: "Sirket uyeligi",
    companyTitle: "Guzellik kolektifini kisaca anlat",
    servicesPrompt: "Sirket hangi hizmetleri sunuyor?",
    notesLabel: "Baska notun var mi?",
    notesPlaceholder: "Yeni subeler, franchise, mevcut yazilim vb.",
    submit: "Size ozel demo iste",
    disclaimer: "Onaylaninca panelden calisan ekleyebileceksin.",
  },
};

export default function SignUpForm() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const text = copy[language];

  const baseText = isDark ? "text-white" : "text-[#1d1233]";
  const mutedText = isDark ? "text-white/60" : "text-[#6a5c8c]";
  const eyebrowText = isDark ? "text-white/40" : "text-[#9a88c2]";
  const labelText = isDark ? "text-white/80" : "text-[#47376d]";
  const cardBorder = isDark ? "border-white/10" : "border-[#e3d8ff]";
  const cardBg = isDark ? "bg-white/5" : "bg-white";
  const optionBorder = isDark ? "border-white/10" : "border-[#dacfff]";
  const optionBg = isDark ? "bg-white/5" : "bg-[#f8f5ff]";

  const checkboxClass = isDark
    ? "mt-1 h-4 w-4 rounded border-white/25 bg-transparent accent-white"
    : "mt-1 h-4 w-4 rounded border-[#b59cf2] bg-white accent-[#3b2268]";

  const textareaClass = isDark
    ? "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/50 shadow-sm transition focus:border-white/40 focus:bg-white/10 focus:ring-2 focus:ring-white/30"
    : "w-full rounded-2xl border border-[#d9cef4] bg-white px-4 py-3 text-[#1d1233] placeholder:text-[#73619d] shadow-sm transition focus:border-[#a18ddc] focus:bg-white focus:ring-2 focus:ring-[#b79df1]/60";

  return (
    <form className={`space-y-6 ${baseText}`}>
      <section
        className={`space-y-6 rounded-3xl border p-8 shadow-[0_25px_60px_rgba(3,2,9,0.6)] ${cardBorder} ${cardBg}`}
      >
        <div>
          <p className={`text-sm uppercase tracking-[0.2em] ${eyebrowText}`}>
            {text.companyBadge}
          </p>
          <h2 className="text-2xl font-semibold">{text.companyTitle}</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {companyFields.map((field) => (
            <div
              key={field.name}
              className={
                field.fullWidth ? "md:col-span-2 xl:col-span-3" : undefined
              }
            >
              <Input
                label={field.labels[language]}
                name={field.name}
                type={field.type}
                placeholder={field.placeholders[language]}
              />
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <label className={`block text-sm font-medium ${labelText}`}>
            {text.servicesPrompt}
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            {servicePackages[language].map((service) => (
              <label
                key={service}
                className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${optionBorder} ${optionBg} ${labelText}`}
              >
                <input
                  type="checkbox"
                  name="services"
                  value={service}
                  className={checkboxClass}
                />
                <span>{service}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-medium ${labelText}`}>
            {text.notesLabel}
          </label>
          <textarea
            name="notes"
            rows={4}
            placeholder={text.notesPlaceholder}
            className={textareaClass}
          ></textarea>
        </div>

        <Button
          type="submit"
          className="w-full rounded-2xl text-base font-semibold"
        >
          {text.submit}
        </Button>

        <p className={`text-center text-sm ${mutedText}`}>{text.disclaimer}</p>
      </section>
    </form>
  );
}
