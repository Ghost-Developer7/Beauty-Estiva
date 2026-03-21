"use client";

import { createContext, useContext, useState, useMemo, ReactNode } from "react";

type Language = "en" | "tr";

type LanguageContextValue = {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

type ProviderProps = {
  initialLanguage?: Language;
  children: ReactNode;
};

export function LanguageProvider({
  initialLanguage = "en",
  children,
}: ProviderProps) {
  const [language, setLanguage] = useState<Language>(initialLanguage);

  const value = useMemo(
    () => ({
      language,
      toggleLanguage: () =>
        setLanguage((prev) => (prev === "en" ? "tr" : "en")),
      setLanguage,
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
