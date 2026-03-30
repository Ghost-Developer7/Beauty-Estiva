"use client";

import { IconChevronDown } from "@/components/dashboard/icons";
import { useState, useRef, useEffect } from "react";
import LanguageToggle from "@/components/ui/LanguageToggle";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import ProfileScreen from "@/components/dashboard/screens/ProfileScreen";
import NotificationBell from "@/components/dashboard/NotificationBell";
import GlobalSearch from "@/components/dashboard/GlobalSearch";
import { tenantService } from "@/services/tenantService";
import type { TenantInfo } from "@/services/tenantService";

const API_BASE = (() => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5232/api";
  return apiUrl.replace(/\/api\/?$/, "");
})();

const copy = {
  en: {
    profile: "Profile",
    logout: "Sign out",
  },
  tr: {
    profile: "Profil Bilgileri",
    logout: "Çıkış yap",
  },
};

interface TopbarProps {
  onMenuToggle?: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const text = copy[language];

  // Fetch tenant info
  useEffect(() => {
    tenantService.getTenantInfo().then((res) => {
      if (res.data.success && res.data.data) {
        setTenantInfo(res.data.data);
      }
    }).catch(() => { /* tenant info is non-critical, safe to ignore */ });
  }, []);

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
      <header className="relative z-50 flex flex-col gap-4 border-b border-white/10 bg-white/5 px-3 sm:px-6 py-3 sm:py-4 text-white backdrop-blur">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Hamburger button - mobile only */}
          <button
            type="button"
            onClick={onMenuToggle}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition md:hidden shrink-0"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Store Name */}
          {tenantInfo?.companyName && (
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#ffd1dc] to-[#f3a4ff] flex items-center justify-center text-xs font-bold text-[#2e174e]">
                {tenantInfo.companyName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-white/90 hidden sm:block">
                {tenantInfo.companyName}
              </span>
            </div>
          )}

          {/* Global Search - hidden on mobile, shown via toggle */}
          <div className="hidden sm:block flex-1">
            <GlobalSearch />
          </div>

          {/* Mobile search toggle */}
          <button
            type="button"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="flex sm:hidden h-10 w-10 items-center justify-center rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition shrink-0 ml-auto"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </button>

          <div className="flex items-center gap-2 sm:gap-3 text-white/70">
            <NotificationBell />
            <div className="hidden sm:block"><LanguageToggle /></div>
            <div className="hidden sm:block"><ThemeToggle /></div>

            {/* User profile dropdown */}
            <div className="relative" ref={menuRef}>
              <div
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 sm:gap-3 rounded-2xl border border-white/10 bg-white/5 p-1 sm:p-1.5 sm:pr-4 transition-all hover:bg-white/10 hover:border-white/20 cursor-pointer group"
              >
                <div className="relative">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profil"
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover shadow-lg shadow-pink-500/20"
                    />
                  ) : (
                    <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#ffd1dc] to-[#f3a4ff] shadow-lg shadow-pink-500/20 text-xs sm:text-sm font-bold text-[#2e174e]">
                      {user ? `${user.name.charAt(0)}${user.surname.charAt(0)}` : "?"}
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full border-2 border-[#130628] bg-emerald-500" />
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-sm font-semibold text-white group-hover:text-pink-100 transition-colors leading-tight">
                    {displayName}
                  </span>
                  <span className="text-[10px] tracking-[0.2em] text-white/40 font-medium leading-tight">
                    {displayRole.toLocaleUpperCase('en')}
                  </span>
                </div>
                <div className="hidden sm:block ml-1 text-white/20 group-hover:text-white/50 transition-colors">
                  <IconChevronDown />
                </div>
              </div>

              {/* Dropdown menu */}
              {showMenu && (
                <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl border p-1 shadow-xl z-50 ${
                  isDark
                    ? "border-white/10 bg-[#1a1a2e]"
                    : "border-gray-200 bg-white"
                }`}>
                  {/* Show language/theme toggles in dropdown on mobile */}
                  <div className="flex items-center gap-2 px-3 py-2 sm:hidden">
                    <LanguageToggle />
                    <ThemeToggle />
                  </div>
                  <div className={`mx-2 my-0.5 h-px sm:hidden ${isDark ? "bg-white/5" : "bg-gray-200"}`} />
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowProfile(true);
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition ${
                      isDark
                        ? "text-white/70 hover:bg-white/10 hover:text-white"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    {text.profile}
                  </button>
                  <div className={`mx-2 my-0.5 h-px ${isDark ? "bg-white/5" : "bg-gray-200"}`} />
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      logout();
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition ${
                      isDark
                        ? "text-white/70 hover:bg-white/10 hover:text-white"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
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

        {/* Mobile search bar - expandable */}
        {showMobileSearch && (
          <div className="flex sm:hidden">
            <GlobalSearch />
          </div>
        )}
      </header>

      {/* Profile Modal */}
      <ProfileScreen
        open={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </>
  );
}
