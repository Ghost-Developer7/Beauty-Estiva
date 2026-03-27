"use client";

import { useState, useRef, useEffect } from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

const copy = {
  en: {
    title: "Notifications",
    markAllRead: "Mark all as read",
    empty: "No notifications yet",
    loadMore: "Load more",
    justNow: "Just now",
    minutesAgo: (n: number) => `${n}m ago`,
    hoursAgo: (n: number) => `${n}h ago`,
    daysAgo: (n: number) => `${n}d ago`,
    delete: "Delete",
  },
  tr: {
    title: "Bildirimler",
    markAllRead: "Tümünü okundu işaretle",
    empty: "Henüz bildirim yok",
    loadMore: "Daha fazla yükle",
    justNow: "Az önce",
    minutesAgo: (n: number) => `${n} dk önce`,
    hoursAgo: (n: number) => `${n} sa önce`,
    daysAgo: (n: number) => `${n} gün önce`,
    delete: "Sil",
  },
};

function timeAgo(dateStr: string | undefined, lang: "en" | "tr") {
  if (!dateStr) return copy[lang].justNow;
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return copy[lang].justNow;
  if (minutes < 60) return copy[lang].minutesAgo(minutes);
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return copy[lang].hoursAgo(hours);
  const days = Math.floor(hours / 24);
  return copy[lang].daysAgo(days);
}

const typeColors: Record<string, string> = {
  info: "bg-blue-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const text = copy[language];

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
    currentPage,
    totalPages,
  } = useNotifications();

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNotificationClick = async (n: typeof notifications[0]) => {
    if (!n.isRead) {
      await markAsRead(n.id);
    }
    if (n.actionUrl && typeof window !== "undefined") {
      window.location.href = n.actionUrl;
      setOpen(false);
    }
  };

  return (
    <div className="relative z-[9999]" ref={ref}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-lg">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          className={`absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border shadow-2xl z-[9999] max-h-[70vh] flex flex-col ${
            isDark
              ? "border-white/10 bg-[#1a1a2e]"
              : "border-gray-200 bg-white"
          }`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between px-4 py-3 border-b ${
              isDark ? "border-white/10" : "border-gray-100"
            }`}
          >
            <h3
              className={`text-sm font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {text.title}
              {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400">
                  {unreadCount}
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-blue-400 hover:text-blue-300 transition"
              >
                {text.markAllRead}
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div
                className={`flex items-center justify-center py-12 text-sm ${
                  isDark ? "text-white/40" : "text-gray-400"
                }`}
              >
                {text.empty}
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`group relative flex gap-3 px-4 py-3 transition cursor-pointer ${
                      !n.isRead
                        ? isDark
                          ? "bg-white/[0.03]"
                          : "bg-blue-50/50"
                        : ""
                    } ${
                      isDark
                        ? "hover:bg-white/[0.06]"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleNotificationClick(n)}
                  >
                    {/* Type indicator */}
                    <div className="mt-1 shrink-0">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          !n.isRead
                            ? typeColors[n.type] || typeColors.info
                            : isDark
                            ? "bg-white/20"
                            : "bg-gray-300"
                        }`}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-snug ${
                          !n.isRead
                            ? isDark
                              ? "font-medium text-white"
                              : "font-medium text-gray-900"
                            : isDark
                            ? "text-white/60"
                            : "text-gray-500"
                        }`}
                      >
                        {n.title}
                      </p>
                      <p
                        className={`mt-0.5 text-xs leading-relaxed ${
                          isDark ? "text-white/40" : "text-gray-400"
                        }`}
                      >
                        {n.message}
                      </p>
                      <p
                        className={`mt-1 text-[10px] ${
                          isDark ? "text-white/30" : "text-gray-300"
                        }`}
                      >
                        {timeAgo(n.cDate, language)}
                      </p>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n.id);
                      }}
                      className={`shrink-0 opacity-0 group-hover:opacity-100 transition text-xs px-1.5 py-0.5 rounded ${
                        isDark
                          ? "text-white/30 hover:text-red-400 hover:bg-red-500/10"
                          : "text-gray-300 hover:text-red-500 hover:bg-red-50"
                      }`}
                      title={text.delete}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Load More */}
          {currentPage < totalPages && (
            <div
              className={`border-t px-4 py-2 text-center ${
                isDark ? "border-white/10" : "border-gray-100"
              }`}
            >
              <button
                onClick={() => fetchNotifications(currentPage + 1)}
                className="text-xs text-blue-400 hover:text-blue-300 transition"
              >
                {text.loadMore}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
