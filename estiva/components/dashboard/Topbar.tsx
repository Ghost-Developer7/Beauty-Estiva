"use client";

import { IconChevronDown } from "@/components/dashboard/icons";
import { useState, useRef, useEffect } from "react";
import LanguageToggle from "@/components/ui/LanguageToggle";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import ProfileScreen from "@/components/dashboard/screens/ProfileScreen";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const copy = {
  en: {
    search: "Search clients, rituals, or invoices...",
    profile: "Profile",
    logout: "Sign out",
  },
  tr: {
    search: "Müşteri, ritüel veya fatura ara...",
    profile: "Profil Bilgileri",
    logout: "Çıkış yap",
  },
};

export default function Topbar() {
  const [search, setSearch] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const { user, logout } = useAuth();
  const text = copy[language];

  const displayName = user ? `${user.name} ${user.surname}` : "—";
  const displayRole = user?.roles?.includes("Owner")
    ? "Owner"
    : user?.roles?.includes("Admin")
      ? "Admin"
      : "Staff";

  const avatarUrl = user?.profilePicturePath
    ? `${API_BASE}${user.profilePicturePath}`
    : null;

  // Close menu on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <header className="flex flex-col gap-4 border-b border-white/10 bg-white/5 px-6 py-4 text-white backdrop-blur">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-1 items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={text.search}
              className="w-full bg-transparent text-white placeholder:text-white/40 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3 text-white/70">
            <LanguageToggle />
            <ThemeToggle />

            {/* User profile dropdown */}
            <div className="relative" ref={menuRef}>
              <div
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-1.5 pr-4 transition-all hover:bg-white/10 hover:border-white/20 cursor-pointer group"
              >
                <div className="relative">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profil"
                      className="h-10 w-10 rounded-full object-cover shadow-lg shadow-pink-500/20"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#ffd1dc] to-[#f3a4ff] shadow-lg shadow-pink-500/20 text-sm font-bold text-[#2e174e]">
                      {user ? `${user.name.charAt(0)}${user.surname.charAt(0)}` : "?"}
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#130628] bg-emerald-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white group-hover:text-pink-100 transition-colors leading-tight">
                    {displayName}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium leading-tight">
                    {displayRole}
                  </span>
                </div>
                <div className="ml-1 text-white/20 group-hover:text-white/50 transition-colors">
                  <IconChevronDown />
                </div>
              </div>

              {/* Dropdown menu */}
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/10 bg-[#1a1a2e] p-1 shadow-xl z-50">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowProfile(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    {text.profile}
                  </button>
                  <div className="mx-2 my-0.5 h-px bg-white/5" />
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    {text.logout}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <ProfileScreen
        open={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </>
  );
}
