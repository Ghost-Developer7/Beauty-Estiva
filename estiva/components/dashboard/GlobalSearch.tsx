"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { customerService } from "@/services/customerService";
import { staffService, type StaffMember } from "@/services/staffService";
import { appointmentService } from "@/services/appointmentService";
import { treatmentService } from "@/services/treatmentService";
import { productService } from "@/services/productService";
import type {
  CustomerListItem,
  AppointmentListItem,
  TreatmentListItem,
  ProductListItem,
} from "@/types/api";

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

type ResultCategory = "customer" | "staff" | "appointment" | "treatment" | "product";

interface SearchResult {
  id: number;
  category: ResultCategory;
  title: string;
  subtitle: string;
  href: string;
  icon: string;
}

/* ═══════════════════════════════════════════
   COPY
   ═══════════════════════════════════════════ */

const copy = {
  en: {
    placeholder: "Search customers, staff, appointments...",
    customers: "Customers",
    staff: "Staff",
    appointments: "Appointments",
    treatments: "Treatments",
    products: "Products",
    noResults: "No results found",
    typeToSearch: "Type at least 2 characters to search...",
    searching: "Searching...",
    shortcut: "Ctrl+K",
  },
  tr: {
    placeholder: "Müşteri, personel, randevu ara...",
    customers: "Müşteriler",
    staff: "Personel",
    appointments: "Randevular",
    treatments: "Hizmetler",
    products: "Ürünler",
    noResults: "Sonuç bulunamadı",
    typeToSearch: "Aramak için en az 2 karakter yazın...",
    searching: "Aranıyor...",
    shortcut: "Ctrl+K",
  },
};

const CATEGORY_CONFIG: Record<ResultCategory, { icon: string; color: string }> = {
  customer:    { icon: "👤", color: "#ec4899" },
  staff:       { icon: "💼", color: "#8b5cf6" },
  appointment: { icon: "📅", color: "#3b82f6" },
  treatment:   { icon: "💆", color: "#10b981" },
  product:     { icon: "📦", color: "#f59e0b" },
};

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const router = useRouter();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = copy[language];

  /* ─── Ctrl+K shortcut ─── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  /* ─── Click outside ─── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ─── Search logic ─── */
  const performSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const lower = q.toLowerCase();

    try {
      const [customersRes, staffRes, appointmentsRes, treatmentsRes, productsRes] = await Promise.allSettled([
        customerService.list(q),
        staffService.list(),
        appointmentService.list(),
        treatmentService.list(),
        productService.list(),
      ]);

      const items: SearchResult[] = [];

      // Customers - backend supports search param
      if (customersRes.status === "fulfilled") {
        const data = customersRes.value.data?.data;
        const list = Array.isArray(data) ? data : [];
        list.slice(0, 5).forEach((c: CustomerListItem) => {
          items.push({
            id: c.id,
            category: "customer",
            title: c.fullName || `${c.name} ${c.surname}`,
            subtitle: [c.phone, c.email].filter(Boolean).join(" · "),
            href: "/dashboard/customers",
            icon: CATEGORY_CONFIG.customer.icon,
          });
        });
      }

      // Staff - client-side filter
      if (staffRes.status === "fulfilled") {
        const data = staffRes.value.data?.data;
        const list = Array.isArray(data) ? data : [];
        list
          .filter((s: StaffMember) =>
            `${s.name} ${s.surname}`.toLowerCase().includes(lower) ||
            (s.email && s.email.toLowerCase().includes(lower)) ||
            (s.phone && s.phone.includes(q))
          )
          .slice(0, 5)
          .forEach((s: StaffMember) => {
            items.push({
              id: s.id,
              category: "staff",
              title: `${s.name} ${s.surname}`,
              subtitle: [s.email, s.phone].filter(Boolean).join(" · "),
              href: "/dashboard/staff",
              icon: CATEGORY_CONFIG.staff.icon,
            });
          });
      }

      // Appointments - client-side filter
      if (appointmentsRes.status === "fulfilled") {
        const data = appointmentsRes.value.data?.data;
        const list = Array.isArray(data) ? data : [];
        list
          .filter((a: AppointmentListItem) =>
            a.customerFullName.toLowerCase().includes(lower) ||
            a.treatmentName.toLowerCase().includes(lower) ||
            a.staffFullName.toLowerCase().includes(lower) ||
            `#${a.id}`.includes(q)
          )
          .slice(0, 5)
          .forEach((a: AppointmentListItem) => {
            const date = new Date(a.startTime).toLocaleDateString(language === "tr" ? "tr-TR" : "en-US", {
              day: "2-digit", month: "short", year: "numeric",
            });
            const time = new Date(a.startTime).toLocaleTimeString(language === "tr" ? "tr-TR" : "en-US", {
              hour: "2-digit", minute: "2-digit",
            });
            items.push({
              id: a.id,
              category: "appointment",
              title: `${a.customerFullName} — ${a.treatmentName}`,
              subtitle: `${a.staffFullName} · ${date} ${time}`,
              href: "/dashboard/appointments",
              icon: CATEGORY_CONFIG.appointment.icon,
            });
          });
      }

      // Treatments - client-side filter
      if (treatmentsRes.status === "fulfilled") {
        const data = treatmentsRes.value.data?.data;
        const list = Array.isArray(data) ? data : [];
        list
          .filter((tr: TreatmentListItem) =>
            tr.name.toLowerCase().includes(lower) ||
            (tr.description && tr.description.toLowerCase().includes(lower))
          )
          .slice(0, 5)
          .forEach((tr: TreatmentListItem) => {
            items.push({
              id: tr.id,
              category: "treatment",
              title: tr.name,
              subtitle: `${tr.durationMinutes} ${language === "tr" ? "dk" : "min"} · ₺${(tr.price ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`,
              href: "/dashboard/treatments",
              icon: CATEGORY_CONFIG.treatment.icon,
            });
          });
      }

      // Products - client-side filter
      if (productsRes.status === "fulfilled") {
        const data = productsRes.value.data?.data;
        const list = Array.isArray(data) ? data : [];
        list
          .filter((p: ProductListItem) =>
            p.name.toLowerCase().includes(lower) ||
            (p.description && p.description.toLowerCase().includes(lower)) ||
            (p.barcode && p.barcode.toLowerCase().includes(lower))
          )
          .slice(0, 5)
          .forEach((p: ProductListItem) => {
            items.push({
              id: p.id,
              category: "product",
              title: p.name,
              subtitle: `₺${p.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} · ${language === "tr" ? "Stok" : "Stock"}: ${p.stockQuantity}`,
              href: "/dashboard/products",
              icon: CATEGORY_CONFIG.product.icon,
            });
          });
      }

      setResults(items);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [language]);

  /* ─── Debounced input ─── */
  const handleChange = (val: string) => {
    setQuery(val);
    setActiveIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    debounceRef.current = setTimeout(() => performSearch(val), 300);
  };

  /* ─── Navigate to result ─── */
  const navigateTo = (result: SearchResult) => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
    router.push(result.href);
  };

  /* ─── Keyboard navigation ─── */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      navigateTo(results[activeIndex]);
    }
  };

  /* ─── Group results by category ─── */
  const grouped = results.reduce<Record<ResultCategory, SearchResult[]>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {} as Record<ResultCategory, SearchResult[]>);

  const categoryLabels: Record<ResultCategory, string> = {
    customer: t.customers,
    staff: t.staff,
    appointment: t.appointments,
    treatment: t.treatments,
    product: t.products,
  };

  const categoryOrder: ResultCategory[] = ["customer", "staff", "appointment", "treatment", "product"];

  /* ─── Flat index for keyboard nav ─── */
  let flatIndex = -1;

  return (
    <div ref={containerRef} className="relative flex-1">
      {/* Search Input */}
      <div className={`flex items-center rounded-full border px-4 py-2 text-sm transition-all ${
        isDark
          ? isOpen ? "border-white/25 bg-white/10 ring-1 ring-white/10" : "border-white/15 bg-white/5"
          : isOpen ? "border-gray-300 bg-gray-50 ring-1 ring-gray-200" : "border-gray-200 bg-gray-50"
      }`}>
        <svg className={`mr-2 shrink-0 ${isDark ? "text-white/40" : "text-gray-400"}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={t.placeholder}
          className={`w-full bg-transparent focus:outline-none ${
            isDark ? "text-white placeholder:text-white/40" : "text-gray-900 placeholder:text-gray-400"
          }`}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setActiveIndex(-1); }}
            className={`ml-2 shrink-0 ${isDark ? "text-white/40 hover:text-white" : "text-gray-400 hover:text-gray-600"}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        {!query && (
          <kbd className={`ml-2 hidden sm:inline-flex shrink-0 items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${
            isDark ? "border-white/10 text-white/30" : "border-gray-200 text-gray-400"
          }`}>
            {t.shortcut}
          </kbd>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (query.length >= 2 || isSearching) && (
        <div className={`absolute left-0 right-0 top-full z-[100] mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border shadow-2xl ${
          isDark
            ? "border-white/10 bg-[#1a1025]/95 backdrop-blur-xl"
            : "border-gray-200 bg-white/95 backdrop-blur-xl"
        }`}>
          {isSearching && results.length === 0 && (
            <div className={`flex items-center gap-3 px-5 py-4 ${isDark ? "text-white/50" : "text-gray-400"}`}>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {t.searching}
            </div>
          )}

          {!isSearching && query.length >= 2 && results.length === 0 && (
            <div className={`px-5 py-8 text-center ${isDark ? "text-white/40" : "text-gray-400"}`}>
              <div className="text-2xl mb-2">🔍</div>
              <p className="text-sm">{t.noResults}</p>
            </div>
          )}

          {categoryOrder.map((cat) => {
            const items = grouped[cat];
            if (!items || items.length === 0) return null;
            const config = CATEGORY_CONFIG[cat];

            return (
              <div key={cat}>
                <div className={`sticky top-0 flex items-center gap-2 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider ${
                  isDark ? "bg-[#1a1025]/95 text-white/30" : "bg-white/95 text-gray-400"
                }`}>
                  <span>{config.icon}</span>
                  <span>{categoryLabels[cat]}</span>
                  <span className={`ml-auto text-[10px] ${isDark ? "text-white/20" : "text-gray-300"}`}>{items.length}</span>
                </div>
                {items.map((item) => {
                  flatIndex++;
                  const idx = flatIndex;
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={`${item.category}-${item.id}`}
                      onClick={() => navigateTo(item)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                        isActive
                          ? isDark ? "bg-white/10" : "bg-gray-100"
                          : isDark ? "hover:bg-white/5" : "hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm"
                        style={{ backgroundColor: `${config.color}15`, color: config.color }}
                      >
                        {item.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm font-medium ${isDark ? "text-white/90" : "text-gray-900"}`}>
                          {highlightMatch(item.title, query, isDark)}
                        </p>
                        <p className={`truncate text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>
                          {item.subtitle}
                        </p>
                      </div>
                      <svg className={`shrink-0 ${isDark ? "text-white/20" : "text-gray-300"}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            );
          })}

          {results.length > 0 && (
            <div className={`flex items-center justify-between px-5 py-2.5 text-[10px] border-t ${
              isDark ? "border-white/5 text-white/20" : "border-gray-100 text-gray-300"
            }`}>
              <span>↑↓ {language === "tr" ? "gezin" : "navigate"}</span>
              <span>↵ {language === "tr" ? "aç" : "open"}</span>
              <span>esc {language === "tr" ? "kapat" : "close"}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Highlight matched text ─── */
function highlightMatch(text: string, query: string, isDark: boolean) {
  if (!query || query.length < 2) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className={`font-bold ${isDark ? "text-pink-300" : "text-pink-600"}`}>
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}
