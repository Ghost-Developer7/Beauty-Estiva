"use client";

import { useEffect, useRef, ReactNode } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto overscroll-contain bg-black/60 backdrop-blur-sm py-6 px-4"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) {
          (overlayRef.current as HTMLDivElement & { _closeIntent?: boolean })._closeIntent = true;
        }
      }}
      onClick={(e) => {
        const el = overlayRef.current as HTMLDivElement & { _closeIntent?: boolean } | null;
        if (e.target === overlayRef.current && el?._closeIntent) {
          el._closeIntent = false;
          onClose();
        }
      }}
    >
      <div
        className={`w-full ${maxWidth} rounded-2xl border p-5 shadow-2xl flex flex-col ${
          isDark
            ? "border-white/10 bg-[#1a1a2e]"
            : "border-gray-200 bg-white shadow-xl"
        }`}
        style={{ maxHeight: "calc(100vh - 3rem)" }}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between shrink-0">
          <h2 className={`text-base sm:text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h2>
          <button
            onClick={onClose}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
              isDark
                ? "text-white/50 hover:bg-white/10 hover:text-white"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {/* Scrollable content */}
        <div className={`flex-1 min-h-0 overflow-y-auto pr-1 ${
          isDark
            ? "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-white/20"
            : "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-gray-400"
        }`}>{children}</div>
      </div>
    </div>
  );
}
