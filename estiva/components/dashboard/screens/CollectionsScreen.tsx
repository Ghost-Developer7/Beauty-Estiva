"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { debtService } from "@/services/debtService";
import type { CollectionListItem } from "@/types/api";
import Pagination from "@/components/ui/Pagination";
import toast from "react-hot-toast";

const copy = {
  en: {
    title: "Collections",
    placeholder: "Search by customer name...",
    loading: "Loading...",
    noData: "No collections found.",
    cols: ["Customer", "Description", "Type", "Amount", "Payment Method", "Payment Date", "Source", "Notes"],
    totalCollected: "Total Collected",
    thisMonth: "This Month",
    filter: "Filter",
    startDate: "Start Date",
    endDate: "End Date",
    allMethods: "All Methods",
    error: "Failed to load collections.",
    types: { Receivable: "Receivable", Debt: "Debt" },
    methods: { Cash: "Cash", Card: "Card", BankTransfer: "Bank Transfer", Other: "Other" },
    methodFilters: { Cash: "Cash", Card: "Card", BankTransfer: "Bank Transfer", Other: "Other" },
  },
  tr: {
    title: "Tahsilatlar",
    placeholder: "Müşteri adına göre ara...",
    loading: "Yükleniyor...",
    noData: "Tahsilat bulunamadı.",
    cols: ["Müşteri", "Açıklama", "Tür", "Tutar", "Ödeme Yöntemi", "Ödeme Tarihi", "Kaynak", "Notlar"],
    totalCollected: "Toplam Tahsilat",
    thisMonth: "Bu Ay",
    filter: "Filtrele",
    startDate: "Başlangıç",
    endDate: "Bitiş",
    allMethods: "Tüm Yöntemler",
    error: "Tahsilatlar yüklenemedi.",
    types: { Receivable: "Alacak", Debt: "Borç" },
    methods: { Cash: "Nakit", Card: "Kart", BankTransfer: "Havale/EFT", Other: "Diğer" },
    methodFilters: { Cash: "Nakit", Card: "Kart", BankTransfer: "Havale/EFT", Other: "Diğer" },
  },
};

export default function CollectionsScreen() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = copy[language];

  // Data
  const [collections, setCollections] = useState<CollectionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [methodFilter, setMethodFilter] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Summary
  const [totalCollected, setTotalCollected] = useState(0);

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await debtService.getCollections({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: search || undefined,
        paymentMethod: methodFilter || undefined,
        page,
        pageSize,
      });
      const data = res.data.data;
      if (data) {
        setCollections(data.items);
        setTotalCount(data.totalCount);
        setTotalPages(data.totalPages);
        // Calculate total from current page items (summary for visible items)
        setTotalCollected(data.items.reduce((sum, c) => sum + c.amount, 0));
      }
    } catch {
      toast.error(t.error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, startDate, endDate, methodFilter, t.error]);

  useEffect(() => { fetchCollections(); }, [fetchCollections]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(language === "tr" ? "tr-TR" : "en-US", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(amount);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString(language === "tr" ? "tr-TR" : "en-US");
  };

  const getDisplayName = (item: CollectionListItem) =>
    item.customerName || item.personName || "-";

  return (
    <div className={`space-y-6 ${isDark ? "text-white" : "text-gray-900"} h-full flex flex-col`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{t.title}</h1>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} p-4`}>
          <div className={`text-xs ${isDark ? "text-white/50" : "text-gray-500"} mb-1`}>{t.totalCollected}</div>
          <div className="text-xl font-bold text-green-400">{formatCurrency(totalCollected)}</div>
          <div className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-300"} mt-1`}>{totalCount} {language === "tr" ? "kayit" : "records"}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={`rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} p-4 flex flex-wrap items-center gap-3`}>
        <input
          type="text"
          placeholder={t.placeholder}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className={`w-full md:w-56 rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-4 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder-white/30" : "placeholder-gray-400"} focus:outline-none focus:border-white/20`}
        />
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className={`rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none focus:border-white/20 [color-scheme:dark]`}
            placeholder={t.startDate}
          />
          <span className={`${isDark ? "text-white/30" : "text-gray-300"} text-xs`}>-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className={`rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none focus:border-white/20 [color-scheme:dark]`}
            placeholder={t.endDate}
          />
        </div>
        <select
          value={methodFilter}
          onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}
          className={`rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} focus:outline-none focus:border-white/20`}
        >
          <option value="" className="bg-[#1a1a1a]">{t.allMethods}</option>
          {Object.entries(t.methodFilters).map(([val, label]) => (
            <option key={val} value={val} className="bg-[#1a1a1a]">{label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className={`flex-1 rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} overflow-hidden flex flex-col`}>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs">
            <thead className={`${isDark ? "bg-white/5" : "bg-gray-50"} text-xs font-semibold ${isDark ? "text-white/60" : "text-gray-600"}`}>
              <tr>
                {t.cols.map((col, i) => (
                  <th key={i} className="px-4 py-3 whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-gray-100"}`}>
              {loading ? (
                <tr>
                  <td colSpan={8} className={`px-4 py-8 text-center ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.loading}</td>
                </tr>
              ) : collections.length === 0 ? (
                <tr>
                  <td colSpan={8} className={`px-4 py-8 text-center ${isDark ? "text-white/40" : "text-gray-400"}`}>{t.noData}</td>
                </tr>
              ) : (
                collections.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.03] transition">
                    <td className="px-4 py-3 whitespace-nowrap font-medium">{getDisplayName(item)}</td>
                    <td className={`px-4 py-3 whitespace-nowrap ${isDark ? "text-white/60" : "text-gray-600"} max-w-[200px] truncate`}>
                      {item.debtDescription || "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                        item.debtType === "Receivable"
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                      }`}>
                        {t.types[item.debtType as keyof typeof t.types] || item.debtType}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-green-400">{formatCurrency(item.amount)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full ${isDark ? "bg-white/5" : "bg-gray-50"} border ${isDark ? "border-white/10" : "border-gray-200"} px-2 py-0.5 text-[10px] font-medium ${isDark ? "text-white/60" : "text-gray-600"}`}>
                        {t.methods[item.paymentMethod as keyof typeof t.methods] || item.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(item.paymentDate)}</td>
                    <td className={`px-4 py-3 whitespace-nowrap ${isDark ? "text-white/50" : "text-gray-500"}`}>{item.source || "-"}</td>
                    <td className={`px-4 py-3 whitespace-nowrap ${isDark ? "text-white/40" : "text-gray-400"} max-w-[150px] truncate`}>{item.notes || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          pageNumber={page}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        />
      </div>
    </div>
  );
}
