"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { staffService, type StaffMember } from "@/services/staffService";
import toast from "react-hot-toast";

const copy = {
  en: {
    title: "Staff",
    headers: ["Name", "Email", "Phone", "Roles", "Status", "Registered"],
    loading: "Loading...",
    noData: "No staff members found.",
    active: "Active",
    inactive: "Inactive",
    recordCount: "Total staff",
  },
  tr: {
    title: "Personel",
    headers: ["Ad Soyad", "E-posta", "Telefon", "Roller", "Durum", "Kayıt Tarihi"],
    loading: "Yükleniyor...",
    noData: "Personel bulunamadı.",
    active: "Aktif",
    inactive: "Pasif",
    recordCount: "Toplam personel",
  },
};

export default function StaffPage() {
  const { language } = useLanguage();
  const text = copy[language];
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await staffService.list();
      if (res.data.success && res.data.data) {
        setStaff(res.data.data);
      }
    } catch {
      toast.error(language === "tr" ? "Personel listesi yüklenemedi" : "Failed to load staff");
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  if (loading) {
    return <div className="p-8 text-center text-white/60">{text.loading}</div>;
  }

  return (
    <div className="space-y-6 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">{text.title}</h1>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs font-medium uppercase tracking-wider text-white/40">
              {text.headers.map((h, i) => (
                <th key={i} className="px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {staff.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-white/40">{text.noData}</td>
              </tr>
            ) : (
              staff.map((s) => (
                <tr key={s.id} className="hover:bg-white/5 transition">
                  <td className="px-5 py-3 font-medium">{s.name} {s.surname}</td>
                  <td className="px-5 py-3 text-white/70">{s.email}</td>
                  <td className="px-5 py-3 text-white/70">{s.phone || "—"}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      {s.roles.map((r) => (
                        <span key={r} className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/80">{r}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      s.isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${s.isActive ? "bg-emerald-400" : "bg-red-400"}`} />
                      {s.isActive ? text.active : text.inactive}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-white/50 text-xs">
                    {s.cDate ? new Date(s.cDate).toLocaleDateString(language === "tr" ? "tr-TR" : "en-US") : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {staff.length > 0 && (
        <p className="text-xs text-white/30">{text.recordCount}: {staff.length}</p>
      )}
    </div>
  );
}
