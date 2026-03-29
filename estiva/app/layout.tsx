import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Estiva \u2014 G\u00FCzellik Merkezi Y\u00F6netim Platformu | Salon Management Software",
  description:
    "Estiva, g\u00FCzellik merkezleri ve kuaf\u00F6r salonlar\u0131 i\u00E7in randevu y\u00F6netimi, personel takibi, finansal analitik ve m\u00FC\u015Fteri ili\u015Fkileri sunan profesyonel SaaS platformudur. \u00DCcretsiz deneyin!",
  keywords: [
    "salon y\u00F6netim yaz\u0131l\u0131m\u0131",
    "g\u00FCzellik merkezi yaz\u0131l\u0131m\u0131",
    "randevu sistemi",
    "kuaf\u00F6r yaz\u0131l\u0131m\u0131",
    "salon management software",
    "beauty salon software",
    "appointment scheduling",
    "estiva",
  ],
  authors: [{ name: "Estiva" }],
  openGraph: {
    title: "Estiva \u2014 G\u00FCzellik Merkezi Y\u00F6netim Platformu",
    description:
      "Randevu planlama, personel y\u00F6netimi, m\u00FC\u015Fteri takibi ve finansal analitik \u2014 tek platformda.",
    type: "website",
    locale: "tr_TR",
    alternateLocale: "en_US",
    siteName: "Estiva",
  },
  twitter: {
    card: "summary_large_image",
    title: "Estiva \u2014 G\u00FCzellik Merkezi Y\u00F6netim Platformu",
    description:
      "Salonunuzu dijital g\u00FCce d\u00F6n\u00FC\u015Ft\u00FCr\u00FCn. Randevu, personel, m\u00FC\u015Fteri ve finans y\u00F6netimi tek platformda.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    languages: {
      "tr-TR": "/",
      "en-US": "/",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#1a1a2e",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.1)",
                  },
                }}
              />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
