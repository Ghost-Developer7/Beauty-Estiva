"use client";

import { useState, useRef, useEffect, useCallback, ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@/contexts/ThemeContext";

interface TooltipProps {
  content: string;
  children: ReactNode;
  /** Preferred placement. Falls back if there isn't enough space. */
  placement?: Placement;
  /** Width of the tooltip bubble in px (default 176) */
  width?: number;
}

/** Gap between the anchor element and the tooltip bubble */
const GAP = 8;

type Placement = "top" | "bottom" | "left" | "right";

function getPosition(
  rect: DOMRect,
  tip: { width: number; height: number },
  placement: Placement,
) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const placements: Record<Placement, { top: number; left: number }> = {
    top: {
      top: rect.top + window.scrollY - tip.height - GAP,
      left: rect.left + window.scrollX + rect.width / 2 - tip.width / 2,
    },
    bottom: {
      top: rect.bottom + window.scrollY + GAP,
      left: rect.left + window.scrollX + rect.width / 2 - tip.width / 2,
    },
    left: {
      top: rect.top + window.scrollY + rect.height / 2 - tip.height / 2,
      left: rect.left + window.scrollX - tip.width - GAP,
    },
    right: {
      top: rect.top + window.scrollY + rect.height / 2 - tip.height / 2,
      left: rect.right + window.scrollX + GAP,
    },
  };

  // Prefer requested placement, fall back to top, then bottom
  const order: Placement[] = [placement, "top", "bottom", "right", "left"];
  for (const p of order) {
    const pos = placements[p];
    if (
      pos.top >= window.scrollY &&
      pos.top + tip.height <= vh + window.scrollY &&
      pos.left >= 0 &&
      pos.left + tip.width <= vw
    ) {
      return { ...pos, placement: p };
    }
  }
  // Last resort: clamp to viewport
  const pos = placements[placement];
  return {
    top: Math.min(Math.max(pos.top, window.scrollY + 4), vh + window.scrollY - tip.height - 4),
    left: Math.min(Math.max(pos.left, 4), vw - tip.width - 4),
    placement,
  };
}

const ARROW_SIZE = 5;

function arrowStyle(placement: Placement | string, isDark: boolean) {
  const color = isDark ? "#1a1a2e" : "#ffffff";

  const shared = `position:absolute;width:0;height:0;border:${ARROW_SIZE}px solid transparent;`;

  switch (placement) {
    case "top":
      return `${shared}border-top-color:${color};top:100%;left:50%;transform:translateX(-50%) translateY(-1px);`;
    case "bottom":
      return `${shared}border-bottom-color:${color};bottom:100%;left:50%;transform:translateX(-50%) translateY(1px);`;
    case "left":
      return `${shared}border-left-color:${color};left:100%;top:50%;transform:translateY(-50%) translateX(-1px);`;
    case "right":
      return `${shared}border-right-color:${color};right:100%;top:50%;transform:translateY(-50%) translateX(1px);`;
    default:
      return "";
  }
}

export default function Tooltip({
  content,
  children,
  placement = "top",
  width = 176,
}: TooltipProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; placement: Placement }>({ top: 0, left: 0, placement: placement ?? "top" });
  const anchorRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  const update = useCallback(() => {
    if (!anchorRef.current || !tipRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const tipRect = tipRef.current.getBoundingClientRect();
    const computed = getPosition(rect, { width: tipRect.width || width, height: tipRect.height || 40 }, placement);
    setPos(computed);
  }, [placement, width]);

  useEffect(() => {
    if (visible) {
      // Use rAF so the tipRef has rendered before we measure
      requestAnimationFrame(update);
    }
  }, [visible, update]);

  useEffect(() => {
    if (!visible) return;
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [visible, update]);

  const tipEl = visible && typeof document !== "undefined"
    ? createPortal(
        <div
          ref={tipRef}
          role="tooltip"
          style={{
            position: "absolute",
            top: pos.top,
            left: pos.left,
            width,
            zIndex: 9999,
            pointerEvents: "none",
          }}
          className={`rounded-lg border px-3 py-2 text-[11px] leading-relaxed shadow-xl ${
            isDark
              ? "border-white/10 bg-[#1a1a2e] text-white/80"
              : "border-gray-200 bg-white text-gray-600"
          }`}
        >
          {content}
          {/* Arrow */}
          <span
            style={Object.fromEntries(
              arrowStyle(pos.placement, isDark)
                .split(";")
                .filter(Boolean)
                .map((s) => {
                  const [k, ...v] = s.split(":");
                  return [k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v.join(":").trim()];
                }),
            ) as React.CSSProperties}
          />
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <span
        ref={anchorRef}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="inline-flex"
      >
        {children}
      </span>
      {tipEl}
    </>
  );
}

/* ─── Convenience wrapper: the ? info button ─────────────────────────── */

interface InfoTooltipProps {
  content: string;
  placement?: Placement;
  /** Size of the circle in px (default 14) */
  size?: number;
}

export function InfoTooltip({ content, placement = "top", size = 14 }: InfoTooltipProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Tooltip content={content} placement={placement}>
      <button
        type="button"
        tabIndex={0}
        aria-label="Info"
        style={{ width: size, height: size }}
        className={`flex items-center justify-center rounded-full transition ${
          isDark
            ? "bg-white/10 text-white/30 hover:bg-white/20 hover:text-white/60"
            : "bg-gray-200 text-gray-400 hover:bg-gray-300 hover:text-gray-600"
        }`}
      >
        <svg
          width={Math.round(size * 0.57)}
          height={Math.round(size * 0.57)}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </button>
    </Tooltip>
  );
}
