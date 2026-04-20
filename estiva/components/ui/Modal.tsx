"use client";

import { useEffect, useRef, ReactNode } from "react";
import { createPortal } from "react-dom";
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

  if (!open || typeof document === "undefined") return null;

  const resolvedMaxWidth =
    maxWidth === "max-w-lg" ? "32rem" :
    maxWidth === "max-w-xl" ? "36rem" :
    maxWidth === "max-w-2xl" ? "42rem" :
    "32rem";

  return createPortal(
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        overflowY: "auto",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        padding: "1rem",
      }}
    >
      <div
        style={{
          minHeight: "calc(100vh - 2rem)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: resolvedMaxWidth,
            maxHeight: "calc(100vh - 2rem)",
            overflowY: "auto",
            borderRadius: "1rem",
            border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb",
            background: isDark ? "#1a1a2e" : "#fff",
            padding: "1.25rem",
            boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
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
          <div>{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}
