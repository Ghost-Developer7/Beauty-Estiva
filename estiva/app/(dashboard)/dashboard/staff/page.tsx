"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { staffService, type StaffMember } from "@/services/staffService";
import Pagination from "@/components/ui/Pagination";
import toast from "react-hot-toast";

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const ROLE_LABELS: Record<string, { en: string; tr: string; color: string; bg: string }> = {
  SuperAdmin: { en: "SuperAdmin", tr: "Süper Yönetici", color: "#ef4444", bg: "bg-red-500/15 text-red-400 border-red-500/20" },
  Owner:  { en: "Owner",  tr: "Sahip",    color: "#f59e0b", bg: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  Admin:  { en: "Admin",  tr: "Yönetici", color: "#8b5cf6", bg: "bg-violet-500/15 text-violet-400 border-violet-500/20" },
  Staff:  { en: "Staff",  tr: "Personel", color: "#3b82f6", bg: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
};

const AVATAR_COLORS = [
  "from-pink-500/40 to-rose-500/40",
  "from-violet-500/40 to-purple-500/40",
  "from-blue-500/40 to-indigo-500/40",
  "from-emerald-500/40 to-teal-500/40",
  "from-amber-500/40 to-orange-500/40",
  "from-cyan-500/40 to-sky-500/40",
  "from-fuchsia-500/40 to-pink-500/40",
  "from-lime-500/40 to-green-500/40",
];

const copy = {
  en: {
    title: "Staff",
    total: "total",
    search: "Search staff...",
    loading: "Loading...",
    noData: "No staff members yet.",
    noDataSub: "Invite your team to get started.",
    noResult: "No staff match your search.",
    // Stats
    totalStaff: "Total Staff",
    activeStaff: "Active",
    owners: "Owners",
    admins: "Admins",
    // Status
    active: "Active",
    inactive: "Inactive",
    approved: "Approved",
    pending: "Pending",
    // Detail
    detailTitle: "Staff Profile",
    email: "Email",
    phone: "Phone",
    roles: "Roles",
    status: "Status",
    registered: "Registered",
    birthDate: "Birth Date",
    commission: "Commission Rate",
    // List
    staffMember: "Staff Member",
    contact: "Contact",
    rolesCol: "Roles",
    statusCol: "Status",
    changeRole: "Change Role",
    roleChangeSuccess: "Role updated successfully",
    roleChangeConfirm: "Are you sure you want to change this role?",
    selectRole: "Select new role",
    save: "Save",
    cannotChangeOwnRole: "You cannot change your own role",
  },
  tr: {
    title: "Personel",
    total: "toplam",
    search: "Personel ara...",
    loading: "Yükleniyor...",
    noData: "Henüz personel yok.",
    noDataSub: "Ekibinizi davet ederek başlayın.",
    noResult: "Aramanızla eşleşen personel yok.",
    totalStaff: "Toplam Personel",
    activeStaff: "Aktif",
    owners: "Sahip",
    admins: "Yönetici",
    active: "Aktif",
    inactive: "Pasif",
    approved: "Onaylı",
    pending: "Beklemede",
    detailTitle: "Personel Profili",
    email: "E-posta",
    phone: "Telefon",
    roles: "Roller",
    status: "Durum",
    registered: "Kayıt Tarihi",
    birthDate: "Doğum Tarihi",
    commission: "Komisyon Oranı",
    staffMember: "Personel",
    contact: "İletişim",
    rolesCol: "Roller",
    statusCol: "Durum",
    changeRole: "Rol Değiştir",
    roleChangeSuccess: "Rol başarıyla güncellendi",
    roleChangeConfirm: "Bu rolü değiştirmek istediğinizden emin misiniz?",
    selectRole: "Yeni rol seçin",
    save: "Kaydet",
    cannotChangeOwnRole: "Kendi rolünüzü değiştiremezsiniz",
  },
};

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

const formatDate = (d: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
};

const getAvatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];
const getInitials = (name: string, surname: string) => `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();

function getRoleDisplay(role: string, language: "en" | "tr") {
  const r = ROLE_LABELS[role];
  return r ? (language === "tr" ? r.tr : r.en) : role;
}

function getRoleBg(role: string) {
  return ROLE_LABELS[role]?.bg || "bg-white/10 text-white/60 border-white/10";
}

/* ═══════════════════════════════════════════
   MINI COMPONENTS
   ═══════════════════════════════════════════ */

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
      <p className="text-[11px] text-white/40">{label}</p>
      <p className="mt-1 text-xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function StaffPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = copy[language];

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* ─── Pagination ─── */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [roleChanging, setRoleChanging] = useState(false);
  const [selectedNewRole, setSelectedNewRole] = useState("");

  // Rol yönetimi yetkileri
  const currentUserRoles = user?.roles ?? [];
  const isSuperAdmin = currentUserRoles.includes("SuperAdmin");
  const isOwner = currentUserRoles.includes("Owner");
  const canManageRoles = isSuperAdmin || isOwner;

  const getAssignableRoles = () => {
    if (isSuperAdmin) return ["SuperAdmin", "Owner", "Admin", "Staff"];
    if (isOwner) return ["Owner", "Admin", "Staff"];
    return [];
  };

  const handleRoleChange = async (staffId: number) => {
    if (!selectedNewRole) return;

    // Kendi rolünü değiştirme kontrolü
    if (user?.id && parseInt(user.id) === staffId) {
      toast.error(t.cannotChangeOwnRole);
      return;
    }

    if (!confirm(t.roleChangeConfirm)) return;

    setRoleChanging(true);
    try {
      const res = await staffService.changeRole(staffId, selectedNewRole);
      if (res.data.success) {
        toast.success(t.roleChangeSuccess);
        setSelectedNewRole("");
        fetchStaff();
        setShowDetail(false);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || (language === "tr" ? "Rol değiştirilemedi" : "Failed to change role");
      toast.error(msg);
    } finally {
      setRoleChanging(false);
    }
  };

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await staffService.listPaginated({ pageNumber: page, pageSize });
      if (res.data.success && res.data.data) {
        const pg = res.data.data;
        setStaff(pg.items);
        setTotalCount(pg.totalCount);
        setTotalPages(pg.totalPages);
      }
    } catch {
      try {
        const res = await staffService.list();
        if (res.data.success && res.data.data) {
          setStaff(res.data.data);
          setTotalCount(res.data.data.length);
          setTotalPages(1);
        }
      } catch {
        toast.error(language === "tr" ? "Personel listesi yüklenemedi" : "Failed to load staff");
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, language]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  /* ═══ FILTERED & STATS ═══ */

  const filtered = staff.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${s.name} ${s.surname}`.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.phone?.includes(q);
  });

  const activeCount = staff.filter(s => s.isActive).length;
  const ownerCount = staff.filter(s => s.roles.includes("Owner")).length;
  const adminCount = staff.filter(s => s.roles.includes("Admin")).length;

  /* ═══ ACTIONS ═══ */

  const openDetail = (s: StaffMember) => {
    setSelectedStaff(s);
    setShowDetail(true);
  };

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="space-y-5 text-white">

      {/* ─── HEADER ─── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="mt-0.5 text-sm text-white/40">{staff.length} {t.total}</p>
        </div>
      </div>

      {/* ─── STATS ─── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={t.totalStaff} value={staff.length} color="#a78bfa" />
        <StatCard label={t.activeStaff} value={activeCount} color="#22c55e" />
        <StatCard label={t.owners} value={ownerCount} color="#f59e0b" />
        <StatCard label={t.admins} value={adminCount} color="#8b5cf6" />
      </div>

      {/* ─── SEARCH ─── */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.search}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition"
        />
      </div>

      {/* ─── STAFF LIST ─── */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        {loading ? (
          <div className="flex items-center justify-center gap-3 p-12 text-white/40">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
            {t.loading}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-12">
            <svg className="text-white/20" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
            <p className="text-sm font-medium text-white/40">{search ? t.noResult : t.noData}</p>
            {!search && <p className="text-xs text-white/25">{t.noDataSub}</p>}
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="hidden md:grid grid-cols-[1fr_1fr_0.7fr_0.5fr] gap-4 border-b border-white/[0.06] bg-white/[0.03] px-5 py-2.5 text-[10px] font-semibold tracking-wider text-white/30">
              <span>{t.staffMember}</span>
              <span>{t.contact}</span>
              <span>{t.rolesCol}</span>
              <span>{t.statusCol}</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/[0.04]">
              {filtered.map((s) => (
                <div
                  key={s.id}
                  onClick={() => openDetail(s)}
                  className="group grid grid-cols-1 md:grid-cols-[1fr_1fr_0.7fr_0.5fr] gap-2 md:gap-4 items-center px-5 py-3.5 transition-all duration-150 hover:bg-white/[0.04] cursor-pointer"
                >
                  {/* Staff member */}
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarColor(s.id)} text-xs font-bold text-white shadow-sm`}>
                      {getInitials(s.name, s.surname)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{s.name} {s.surname}</p>
                      <p className="text-[11px] text-white/30 md:hidden">{s.email}</p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="hidden md:block min-w-0">
                    <p className="text-xs text-white/60 truncate">{s.email}</p>
                    <p className="text-[11px] text-white/30">{s.phone || "—"}</p>
                  </div>

                  {/* Roles */}
                  <div className="flex flex-wrap gap-1">
                    {s.roles.map((r) => (
                      <span key={r} className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getRoleBg(r)}`}>
                        {getRoleDisplay(r, language)}
                      </span>
                    ))}
                  </div>

                  {/* Status */}
                  <div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      s.isActive
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-red-500/15 text-red-400"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${s.isActive ? "bg-emerald-400" : "bg-red-400"}`} />
                      {s.isActive ? t.active : t.inactive}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              pageNumber={page}
              pageSize={pageSize}
              totalCount={totalCount}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            />
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════════
         DETAIL MODAL
         ═══════════════════════════════════════════ */}
      {showDetail && selectedStaff && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowDetail(false)}
        >
          <div
            className="w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-[#1a1a2e] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{t.detailTitle}</h2>
              <button onClick={() => setShowDetail(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {(() => {
              const s = selectedStaff;
              return (
                <div className="space-y-5">
                  {/* Profile header */}
                  <div className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarColor(s.id)} text-lg font-bold text-white shadow-lg`}>
                      {getInitials(s.name, s.surname)}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{s.name} {s.surname}</p>
                      <div className="mt-1 flex gap-1">
                        {s.roles.map((r) => (
                          <span key={r} className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getRoleBg(r)}`}>
                            {getRoleDisplay(r, language)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold tracking-wider text-white/30">{t.email}</p>
                      <p className="text-sm text-white truncate">{s.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold tracking-wider text-white/30">{t.phone}</p>
                      <p className="text-sm text-white">{s.phone || "—"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold tracking-wider text-white/30">{t.status}</p>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${s.isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${s.isActive ? "bg-emerald-400" : "bg-red-400"}`} />
                          {s.isActive ? t.active : t.inactive}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.isApproved ? "bg-blue-500/15 text-blue-400" : "bg-amber-500/15 text-amber-400"}`}>
                          {s.isApproved ? t.approved : t.pending}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold tracking-wider text-white/30">{t.registered}</p>
                      <p className="text-sm text-white">{formatDate(s.cDate)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold tracking-wider text-white/30">{t.birthDate}</p>
                      <p className="text-sm text-white">{formatDate(s.birthDate)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold tracking-wider text-white/30">{t.commission}</p>
                      <p className="text-sm font-bold text-emerald-400">%{s.defaultCommissionRate ?? 0}</p>
                    </div>
                  </div>

                  {/* ── Rol Değiştirme ── */}
                  {canManageRoles && user?.id && parseInt(user.id) !== s.id && (
                    <div className="mt-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 space-y-3">
                      <p className="text-xs font-semibold text-white/50 tracking-wider">{t.changeRole}</p>
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedNewRole}
                          onChange={(e) => setSelectedNewRole(e.target.value)}
                          className="flex-1 rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition"
                        >
                          <option value="" className="bg-[#1a1a2e] text-white/50">{t.selectRole}</option>
                          {getAssignableRoles()
                            .filter((r) => !(s.roles.length === 1 && s.roles[0] === r))
                            .map((r) => (
                              <option key={r} value={r} className="bg-[#1a1a2e] text-white">
                                {getRoleDisplay(r, language)}
                              </option>
                            ))}
                        </select>
                        <button
                          onClick={() => handleRoleChange(s.id)}
                          disabled={!selectedNewRole || roleChanging}
                          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {roleChanging ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          ) : (
                            t.save
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
