"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { staffService, type StaffMember } from "@/services/staffService";
import Pagination from "@/components/ui/Pagination";
import toast from "react-hot-toast";
import SharedStatCard from "@/components/ui/StatCard";

const API_BASE = (() => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
  return apiUrl.replace(/\/api\/?$/, "");
})();

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
    manageRoles: "Manage Roles",
    roleChangeSuccess: "Role updated successfully",
    roleChangeConfirm: "Are you sure you want to change this role?",
    roleToggleConfirm: "Are you sure you want to toggle this role?",
    selectRole: "Select new role",
    save: "Save",
    cannotChangeOwnRole: "You cannot change your own role",
    addRole: "Add",
    removeRole: "Remove",
    mustHaveOneRole: "User must have at least one role",
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
    manageRoles: "Rol Yönetimi",
    roleChangeSuccess: "Rol başarıyla güncellendi",
    roleChangeConfirm: "Bu rolü değiştirmek istediğinizden emin misiniz?",
    roleToggleConfirm: "Bu rol değişikliğini onaylıyor musunuz?",
    selectRole: "Yeni rol seçin",
    save: "Kaydet",
    cannotChangeOwnRole: "Kendi rolünüzü değiştiremezsiniz",
    addRole: "Ekle",
    removeRole: "Kaldır",
    mustHaveOneRole: "Kullanıcının en az bir rolü olmalıdır",
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

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function StaffPage() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
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
  const [showRoleConfirm, setShowRoleConfirm] = useState(false);
  const [pendingRoleStaffId, setPendingRoleStaffId] = useState<number | null>(null);
  const [pendingToggleRole, setPendingToggleRole] = useState<string>("");
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  const [togglingRole, setTogglingRole] = useState<string | null>(null);

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

  const requestRoleChange = (staffId: number) => {
    if (!selectedNewRole) return;
    if (user?.id && parseInt(user.id) === staffId) {
      toast.error(t.cannotChangeOwnRole);
      return;
    }
    setPendingRoleStaffId(staffId);
    setShowRoleConfirm(true);
  };

  const confirmRoleChange = async () => {
    if (!pendingRoleStaffId || !selectedNewRole) return;
    setShowRoleConfirm(false);
    setRoleChanging(true);
    try {
      const res = await staffService.changeRole(pendingRoleStaffId, selectedNewRole);
      if (res.data.success) {
        toast.success(t.roleChangeSuccess);
        setSelectedNewRole("");
        fetchStaff();
        setShowDetail(false);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      const msg = axiosErr?.response?.data?.error?.message || (language === "tr" ? "Rol değiştirilemedi" : "Failed to change role");
      toast.error(msg);
    } finally {
      setRoleChanging(false);
      setPendingRoleStaffId(null);
    }
  };

  const requestToggleRole = (staffId: number, role: string, staffRoles: string[]) => {
    if (user?.id && parseInt(user.id) === staffId) {
      toast.error(t.cannotChangeOwnRole);
      return;
    }
    const hasRole = staffRoles.includes(role);
    if (hasRole && staffRoles.length <= 1) {
      toast.error(t.mustHaveOneRole);
      return;
    }
    setPendingRoleStaffId(staffId);
    setPendingToggleRole(role);
    setShowToggleConfirm(true);
  };

  const confirmToggleRole = async () => {
    if (!pendingRoleStaffId || !pendingToggleRole) return;
    setShowToggleConfirm(false);
    setTogglingRole(pendingToggleRole);
    try {
      const res = await staffService.toggleRole(pendingRoleStaffId, pendingToggleRole);
      if (res.data.success && res.data.data) {
        toast.success(t.roleChangeSuccess);
        setStaff(prev => prev.map(s => s.id === pendingRoleStaffId ? { ...s, roles: res.data.data!.roles } : s));
        if (selectedStaff?.id === pendingRoleStaffId) {
          setSelectedStaff(prev => prev ? { ...prev, roles: res.data.data!.roles } : prev);
        }
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      const msg = axiosErr?.response?.data?.error?.message || (language === "tr" ? "Rol değiştirilemedi" : "Failed to change role");
      toast.error(msg);
    } finally {
      setTogglingRole(null);
      setPendingRoleStaffId(null);
      setPendingToggleRole("");
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
        </div>
      </div>

      {/* ─── STATS ─── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SharedStatCard
          label={t.totalStaff}
          value={staff.length.toString()}
          valueColor="#a78bfa"
          gradient="bg-violet-500"
          iconColor="text-violet-400"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
        <SharedStatCard
          label={t.activeStaff}
          value={activeCount.toString()}
          valueColor="#22c55e"
          gradient="bg-emerald-500"
          iconColor="text-emerald-400"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
        />
        <SharedStatCard
          label={t.owners}
          value={ownerCount.toString()}
          valueColor="#f59e0b"
          gradient="bg-amber-500"
          iconColor="text-amber-400"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2.7 2h8.6a1 1 0 010 2H7.7a1 1 0 010-2z"/></svg>}
        />
        <SharedStatCard
          label={t.admins}
          value={adminCount.toString()}
          valueColor="#8b5cf6"
          gradient="bg-purple-500"
          iconColor="text-purple-400"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
        />
      </div>

      {/* ─── SEARCH ─── */}
      <div className="relative">
        <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
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
                    {s.profilePicturePath ? (
                      <img src={s.profilePicturePath.startsWith("http") ? s.profilePicturePath : `${API_BASE}${s.profilePicturePath}`} alt={`${s.name} ${s.surname}`} className="h-10 w-10 shrink-0 rounded-full object-cover shadow-sm" />
                    ) : (
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarColor(s.id)} text-xs font-bold text-white shadow-sm`}>
                        {getInitials(s.name, s.surname)}
                      </div>
                    )}
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
      {/* ═══ ROLE CONFIRM MODAL (eski tek-rol) ═══ */}
      {showRoleConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowRoleConfirm(false)}>
          <div className={`w-full max-w-sm mx-4 rounded-2xl border p-6 shadow-2xl ${isDark ? "border-white/10 bg-[#1a1a2e]" : "border-gray-200 bg-white"}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
              </div>
              <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{t.changeRole}</h3>
            </div>
            <p className={`text-sm mb-6 ${isDark ? "text-white/60" : "text-gray-500"}`}>{t.roleChangeConfirm}</p>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => setShowRoleConfirm(false)} className={`rounded-xl px-4 py-2.5 text-sm font-medium border transition ${isDark ? "text-white/60 border-white/10 hover:bg-white/5" : "text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
                {language === "tr" ? "İptal" : "Cancel"}
              </button>
              <button onClick={confirmRoleChange} className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition">
                {language === "tr" ? "Onayla" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ROLE TOGGLE CONFIRM MODAL ═══ */}
      {showToggleConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowToggleConfirm(false)}>
          <div className={`w-full max-w-sm mx-4 rounded-2xl border p-6 shadow-2xl ${isDark ? "border-white/10 bg-[#1a1a2e]" : "border-gray-200 bg-white"}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
              </div>
              <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{t.manageRoles}</h3>
            </div>
            <p className={`text-sm mb-6 ${isDark ? "text-white/60" : "text-gray-500"}`}>
              {pendingToggleRole && (
                <>
                  <span className="font-semibold" style={{ color: ROLE_LABELS[pendingToggleRole]?.color }}>
                    {getRoleDisplay(pendingToggleRole, language)}
                  </span>
                  {" "}
                  {language === "tr"
                    ? (staff.find(s => s.id === pendingRoleStaffId)?.roles.includes(pendingToggleRole) ? "rolü kaldırılacak." : "rolü eklenecek.")
                    : (staff.find(s => s.id === pendingRoleStaffId)?.roles.includes(pendingToggleRole) ? "role will be removed." : "role will be added.")}
                  {" "}{t.roleToggleConfirm}
                </>
              )}
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => setShowToggleConfirm(false)} className={`rounded-xl px-4 py-2.5 text-sm font-medium border transition ${isDark ? "text-white/60 border-white/10 hover:bg-white/5" : "text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
                {language === "tr" ? "İptal" : "Cancel"}
              </button>
              <button onClick={confirmToggleRole} className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition">
                {language === "tr" ? "Onayla" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetail && selectedStaff && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowDetail(false)}
        >
          <div
            className={`w-full max-w-md mx-4 rounded-2xl border p-6 shadow-2xl ${isDark ? "border-white/10 bg-[#1a1a2e]" : "border-gray-200 bg-white"}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{t.detailTitle}</h2>
              <button onClick={() => setShowDetail(false)} className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${isDark ? "text-white/50 hover:bg-white/10 hover:text-white" : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {(() => {
              const s = selectedStaff;
              return (
                <div className="space-y-5">
                  {/* Profile header */}
                  <div className="flex items-center gap-4">
                    {s.profilePicturePath ? (
                      <img src={s.profilePicturePath.startsWith("http") ? s.profilePicturePath : `${API_BASE}${s.profilePicturePath}`} alt={`${s.name} ${s.surname}`} className="h-14 w-14 shrink-0 rounded-full object-cover shadow-lg" />
                    ) : (
                      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarColor(s.id)} text-lg font-bold text-white shadow-lg`}>
                        {getInitials(s.name, s.surname)}
                      </div>
                    )}
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

                  {/* ── Rol Yönetimi (Çoklu Rol Toggle) ── */}
                  {canManageRoles && user?.id && parseInt(user.id) !== s.id && (
                    <div className={`mt-2 rounded-xl border p-4 space-y-3 ${isDark ? "border-white/[0.08] bg-white/[0.03]" : "border-gray-200 bg-gray-50"}`}>
                      <p className={`text-xs font-semibold tracking-wider ${isDark ? "text-white/50" : "text-gray-500"}`}>{t.manageRoles}</p>
                      <div className="flex flex-wrap gap-2">
                        {getAssignableRoles().map((role) => {
                          const hasRole = s.roles.includes(role);
                          const isToggling = togglingRole === role && pendingRoleStaffId === s.id;
                          const isLastRole = hasRole && s.roles.length <= 1;
                          const roleInfo = ROLE_LABELS[role];
                          return (
                            <button
                              key={role}
                              onClick={() => requestToggleRole(s.id, role, s.roles)}
                              disabled={isToggling || (isLastRole)}
                              className={`relative flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200 ${
                                hasRole
                                  ? isDark
                                    ? `border-[${roleInfo?.color}]/30 bg-[${roleInfo?.color}]/10 text-white`
                                    : `border-[${roleInfo?.color}]/30 bg-[${roleInfo?.color}]/10 text-gray-900`
                                  : isDark
                                    ? "border-white/[0.08] bg-white/[0.02] text-white/40 hover:border-white/20 hover:text-white/70"
                                    : "border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-600"
                              } ${isLastRole ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                              style={hasRole ? { borderColor: `${roleInfo?.color}40`, backgroundColor: `${roleInfo?.color}15` } : {}}
                            >
                              {isToggling ? (
                                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                              ) : (
                                <div
                                  className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
                                    hasRole ? "border-current" : isDark ? "border-white/20" : "border-gray-300"
                                  }`}
                                  style={hasRole ? { borderColor: roleInfo?.color, backgroundColor: roleInfo?.color } : {}}
                                >
                                  {hasRole && (
                                    <svg className="h-2 w-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                              )}
                              <span style={hasRole ? { color: roleInfo?.color } : {}}>{getRoleDisplay(role, language)}</span>
                            </button>
                          );
                        })}
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
