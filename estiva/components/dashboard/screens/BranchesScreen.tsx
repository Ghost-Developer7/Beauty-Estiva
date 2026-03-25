"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { branchService } from "@/services/branchService";
import { staffService } from "@/services/staffService";
import type {
  BranchListItem,
  BranchDetail,
  BranchCreate,
  BranchUpdate,
  BranchLimit,
} from "@/types/api";
import type { StaffMember } from "@/services/staffService";
import toast from "react-hot-toast";

/* ================================================================
   CONSTANTS
   ================================================================ */

const DAYS_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAYS_TR = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

const ROLE_LABELS: Record<string, { en: string; tr: string; bg: string }> = {
  SuperAdmin: { en: "SuperAdmin", tr: "Süper Yönetici", bg: "bg-red-500/15 text-red-400 border-red-500/20" },
  Owner:  { en: "Owner",  tr: "Sahip",    bg: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  Admin:  { en: "Admin",  tr: "Yönetici", bg: "bg-violet-500/15 text-violet-400 border-violet-500/20" },
  Staff:  { en: "Staff",  tr: "Personel", bg: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
};

interface WorkingHour {
  day: number;
  open: string;
  close: string;
  isClosed: boolean;
}

const DEFAULT_WORKING_HOURS: WorkingHour[] = Array.from({ length: 7 }, (_, i) => ({
  day: i,
  open: "09:00",
  close: "18:00",
  isClosed: i >= 6, // Sunday closed by default
}));

const copy = {
  en: {
    title: "Branches",
    subtitle: "Manage your business branches",
    newBranch: "New Branch",
    search: "Search branches...",
    loading: "Loading...",
    noData: "No branches yet.",
    noDataSub: "Create your first branch to get started.",
    noResult: "No branches match your search.",
    // Card
    mainBranch: "Main Branch",
    staffCount: "Staff",
    active: "Active",
    inactive: "Inactive",
    edit: "Edit",
    deactivate: "Deactivate",
    // Modal
    createTitle: "Create Branch",
    editTitle: "Edit Branch",
    detailTitle: "Branch Details",
    name: "Branch Name",
    namePlaceholder: "e.g. Main Branch",
    address: "Address",
    phone: "Phone",
    email: "Email",
    workingHours: "Working Hours",
    isMainBranch: "Main Branch",
    isActive: "Active",
    save: "Save",
    cancel: "Cancel",
    creating: "Creating...",
    saving: "Saving...",
    open: "Open",
    close: "Close",
    closed: "Closed",
    // Staff
    assignedStaff: "Assigned Staff",
    assignStaff: "Assign Staff",
    removeStaff: "Remove",
    selectStaff: "Select staff to assign...",
    noStaffAssigned: "No staff assigned to this branch.",
    assign: "Assign",
    // Limit
    branchUsage: "Branch Usage",
    branchesUsed: "branches used",
    unlimited: "Unlimited",
    upgradeMessage: "Upgrade your plan to add more branches.",
    limitReached: "Branch limit reached",
    // Confirm
    confirmDeactivate: "Are you sure you want to deactivate this branch?",
    confirmRemoveStaff: "Remove this staff from the branch?",
    // Success
    createSuccess: "Branch created successfully",
    updateSuccess: "Branch updated successfully",
    deactivateSuccess: "Branch deactivated successfully",
    assignSuccess: "Staff assigned successfully",
    removeStaffSuccess: "Staff removed from branch",
    // Errors
    cannotDeactivateMain: "Cannot deactivate the main branch. Please assign another branch as main first.",
    total: "total",
  },
  tr: {
    title: "Şubeler",
    subtitle: "İşletme şubelerinizi yönetin",
    newBranch: "Yeni Şube",
    search: "Şube ara...",
    loading: "Yükleniyor...",
    noData: "Henüz şube yok.",
    noDataSub: "Başlamak için ilk şubenizi oluşturun.",
    noResult: "Aramanızla eşleşen şube yok.",
    mainBranch: "Ana Şube",
    staffCount: "Personel",
    active: "Aktif",
    inactive: "Pasif",
    edit: "Düzenle",
    deactivate: "Pasife Al",
    createTitle: "Şube Oluştur",
    editTitle: "Şube Düzenle",
    detailTitle: "Şube Detayı",
    name: "Şube Adı",
    namePlaceholder: "örn. Merkez Şube",
    address: "Adres",
    phone: "Telefon",
    email: "E-posta",
    workingHours: "Çalışma Saatleri",
    isMainBranch: "Ana Şube",
    isActive: "Aktif",
    save: "Kaydet",
    cancel: "İptal",
    creating: "Oluşturuluyor...",
    saving: "Kaydediliyor...",
    open: "Açılış",
    close: "Kapanış",
    closed: "Kapalı",
    assignedStaff: "Atanan Personel",
    assignStaff: "Personel Ata",
    removeStaff: "Çıkar",
    selectStaff: "Atanacak personeli seçin...",
    noStaffAssigned: "Bu şubeye henüz personel atanmadı.",
    assign: "Ata",
    branchUsage: "Şube Kullanımı",
    branchesUsed: "şube kullanılıyor",
    unlimited: "Limitsiz",
    upgradeMessage: "Daha fazla şube eklemek için paketinizi yükseltin.",
    limitReached: "Şube limitine ulaşıldı",
    confirmDeactivate: "Bu şubeyi pasife almak istediğinizden emin misiniz?",
    confirmRemoveStaff: "Bu personeli şubeden çıkarmak istiyor musunuz?",
    createSuccess: "Şube başarıyla oluşturuldu",
    updateSuccess: "Şube başarıyla güncellendi",
    deactivateSuccess: "Şube başarıyla pasife alındı",
    assignSuccess: "Personel başarıyla atandı",
    removeStaffSuccess: "Personel şubeden çıkarıldı",
    cannotDeactivateMain: "Ana şube pasife alınamaz. Öncelikle başka bir şubeyi ana şube olarak atayın.",
    total: "toplam",
  },
};

/* ================================================================
   HELPERS
   ================================================================ */

const formatDate = (d: string | null) => {
  if (!d) return "--";
  return new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
};

function getRoleBg(role: string) {
  return ROLE_LABELS[role]?.bg || "bg-white/10 text-white/60 border-white/10";
}

function getRoleDisplay(role: string, language: "en" | "tr") {
  const r = ROLE_LABELS[role];
  return r ? (language === "tr" ? r.tr : r.en) : role;
}

/* ================================================================
   MINI COMPONENTS
   ================================================================ */

function LocationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white/10">
      <path d="M3 21h18" />
      <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
      <path d="M9 7h1M9 11h1M9 15h1M14 7h1M14 11h1M14 15h1" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */

export default function BranchesScreen() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = copy[language];
  const days = language === "tr" ? DAYS_TR : DAYS_EN;

  const currentUserRoles = user?.roles ?? [];
  const canManage = currentUserRoles.includes("Owner") || currentUserRoles.includes("Admin");

  // State
  const [branches, setBranches] = useState<BranchListItem[]>([]);
  const [limit, setLimit] = useState<BranchLimit | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchDetail | null>(null);
  const [editBranch, setEditBranch] = useState<BranchListItem | null>(null);

  // Form
  const [formName, setFormName] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formIsMain, setFormIsMain] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formWorkingHours, setFormWorkingHours] = useState<WorkingHour[]>(DEFAULT_WORKING_HOURS);
  const [formSaving, setFormSaving] = useState(false);

  // Staff assignment
  const [allStaff, setAllStaff] = useState<StaffMember[]>([]);
  const [staffToAssign, setStaffToAssign] = useState<number | "">("");
  const [assignLoading, setAssignLoading] = useState(false);

  /* ── FETCH ── */

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    try {
      const [branchRes, limitRes] = await Promise.all([
        branchService.list(),
        canManage ? branchService.getLimit() : Promise.resolve(null),
      ]);
      if (branchRes.data.success && branchRes.data.data) setBranches(branchRes.data.data);
      if (limitRes && limitRes.data.success && limitRes.data.data) setLimit(limitRes.data.data);
    } catch {
      toast.error(language === "tr" ? "Şubeler yüklenemedi" : "Failed to load branches");
    } finally {
      setLoading(false);
    }
  }, [language, canManage]);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await staffService.list();
      if (res.data.success && res.data.data) setAllStaff(res.data.data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchBranches(); }, [fetchBranches]);
  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  /* ── FILTERED ── */

  const filtered = branches.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return b.name.toLowerCase().includes(q) ||
      b.address?.toLowerCase().includes(q) ||
      b.phone?.includes(q);
  });

  const activeCount = branches.filter(b => b.isActive).length;

  /* ── ACTIONS ── */

  const resetForm = () => {
    setFormName("");
    setFormAddress("");
    setFormPhone("");
    setFormEmail("");
    setFormIsMain(false);
    setFormIsActive(true);
    setFormWorkingHours(DEFAULT_WORKING_HOURS);
  };

  const openCreate = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEdit = (b: BranchListItem) => {
    setEditBranch(b);
    setFormName(b.name);
    setFormAddress(b.address || "");
    setFormPhone(b.phone || "");
    setFormEmail(b.email || "");
    setFormIsMain(b.isMainBranch);
    setFormIsActive(b.isActive);
    // Load working hours from detail
    branchService.getById(b.id).then(res => {
      if (res.data.success && res.data.data) {
        const wh = res.data.data.workingHoursJson;
        if (wh) {
          try { setFormWorkingHours(JSON.parse(wh)); } catch { setFormWorkingHours(DEFAULT_WORKING_HOURS); }
        } else {
          setFormWorkingHours(DEFAULT_WORKING_HOURS);
        }
      }
    });
    setShowEditModal(true);
  };

  const openDetail = async (b: BranchListItem) => {
    try {
      const res = await branchService.getById(b.id);
      if (res.data.success && res.data.data) {
        setSelectedBranch(res.data.data);
        setShowDetailModal(true);
      }
    } catch {
      toast.error(language === "tr" ? "Şube detayı yüklenemedi" : "Failed to load branch detail");
    }
  };

  const handleCreate = async () => {
    if (!formName.trim()) return;
    setFormSaving(true);
    try {
      const data: BranchCreate = {
        name: formName,
        address: formAddress || undefined,
        phone: formPhone || undefined,
        email: formEmail || undefined,
        workingHoursJson: JSON.stringify(formWorkingHours),
        isMainBranch: formIsMain,
      };
      const res = await branchService.create(data);
      if (res.data.success) {
        toast.success(t.createSuccess);
        setShowCreateModal(false);
        fetchBranches();
      }
    } catch (err: any) {
      const code = err?.response?.data?.error?.errorCode;
      if (code === "BRANCH_LIMIT_REACHED") {
        toast.error(t.limitReached);
      } else {
        toast.error(err?.response?.data?.error?.message || (language === "tr" ? "Şube oluşturulamadı" : "Failed to create branch"));
      }
    } finally {
      setFormSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editBranch || !formName.trim()) return;
    setFormSaving(true);
    try {
      const data: BranchUpdate = {
        name: formName,
        address: formAddress || undefined,
        phone: formPhone || undefined,
        email: formEmail || undefined,
        workingHoursJson: JSON.stringify(formWorkingHours),
        isMainBranch: formIsMain,
        isActive: formIsActive,
      };
      const res = await branchService.update(editBranch.id, data);
      if (res.data.success) {
        toast.success(t.updateSuccess);
        setShowEditModal(false);
        fetchBranches();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || (language === "tr" ? "Şube güncellenemedi" : "Failed to update branch"));
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeactivate = async (b: BranchListItem) => {
    if (b.isMainBranch) {
      toast.error(t.cannotDeactivateMain);
      return;
    }
    if (!confirm(t.confirmDeactivate)) return;
    try {
      const res = await branchService.deactivate(b.id);
      if (res.data.success) {
        toast.success(t.deactivateSuccess);
        fetchBranches();
      }
    } catch (err: any) {
      const code = err?.response?.data?.error?.errorCode;
      if (code === "CANNOT_DEACTIVATE_MAIN_BRANCH") {
        toast.error(t.cannotDeactivateMain);
      } else {
        toast.error(err?.response?.data?.error?.message || (language === "tr" ? "Şube silinemedi" : "Failed to deactivate branch"));
      }
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedBranch || staffToAssign === "") return;
    setAssignLoading(true);
    try {
      const res = await branchService.assignStaff(selectedBranch.id, staffToAssign as number);
      if (res.data.success) {
        toast.success(t.assignSuccess);
        setStaffToAssign("");
        // Refresh detail
        const detailRes = await branchService.getById(selectedBranch.id);
        if (detailRes.data.success && detailRes.data.data) setSelectedBranch(detailRes.data.data);
        fetchBranches();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || (language === "tr" ? "Personel atanamadı" : "Failed to assign staff"));
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRemoveStaff = async (staffId: number) => {
    if (!selectedBranch) return;
    if (!confirm(t.confirmRemoveStaff)) return;
    try {
      const res = await branchService.removeStaff(selectedBranch.id, staffId);
      if (res.data.success) {
        toast.success(t.removeStaffSuccess);
        const detailRes = await branchService.getById(selectedBranch.id);
        if (detailRes.data.success && detailRes.data.data) setSelectedBranch(detailRes.data.data);
        fetchBranches();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || (language === "tr" ? "Personel çıkarılmadı" : "Failed to remove staff"));
    }
  };

  // Staff not assigned to this branch
  const unassignedStaff = allStaff.filter(s => {
    if (!selectedBranch) return true;
    return !selectedBranch.staff.some(bs => bs.id === s.id) && s.isActive;
  });

  /* ================================================================
     RENDER
     ================================================================ */

  return (
    <div className="space-y-5 text-white">

      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="mt-0.5 text-sm text-white/40">{t.subtitle}</p>
        </div>
        {canManage && (
          <button
            onClick={openCreate}
            disabled={limit !== null && !limit.canAdd}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            {t.newBranch}
          </button>
        )}
      </div>

      {/* ── LIMIT BAR ── */}
      {canManage && limit && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">{t.branchUsage}</span>
            <span className="text-sm font-bold text-white">
              {limit.maxCount === -1
                ? `${limit.currentCount} (${t.unlimited})`
                : `${limit.currentCount}/${limit.maxCount}`
              }
              <span className="ml-1 text-white/40 font-normal text-xs">{t.branchesUsed}</span>
            </span>
          </div>
          {limit.maxCount > 0 && (
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  limit.currentCount >= limit.maxCount
                    ? "bg-gradient-to-r from-red-500 to-orange-500"
                    : "bg-gradient-to-r from-violet-500 to-purple-500"
                }`}
                style={{ width: `${Math.min((limit.currentCount / limit.maxCount) * 100, 100)}%` }}
              />
            </div>
          )}
          {!limit.canAdd && (
            <p className="mt-2 text-xs text-amber-400">{t.upgradeMessage}</p>
          )}
        </div>
      )}

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
          <p className="text-[11px] text-white/40">{t.title}</p>
          <p className="mt-1 text-xl font-bold text-violet-400">{branches.length}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
          <p className="text-[11px] text-white/40">{t.active}</p>
          <p className="mt-1 text-xl font-bold text-emerald-400">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
          <p className="text-[11px] text-white/40">{t.staffCount}</p>
          <p className="mt-1 text-xl font-bold text-blue-400">{branches.reduce((s, b) => s + b.staffCount, 0)}</p>
        </div>
      </div>

      {/* ── SEARCH ── */}
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

      {/* ── BRANCH CARDS ── */}
      {loading ? (
        <div className="flex items-center justify-center gap-3 p-12 text-white/40">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
          {t.loading}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 p-12 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <BuildingIcon />
          <p className="text-sm font-medium text-white/40">{search ? t.noResult : t.noData}</p>
          {!search && <p className="text-xs text-white/25">{t.noDataSub}</p>}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <div
              key={b.id}
              onClick={() => openDetail(b)}
              className={`group relative cursor-pointer rounded-2xl border bg-white/[0.02] p-5 transition-all duration-200 hover:bg-white/[0.04] hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${
                b.isMainBranch
                  ? "border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.08)]"
                  : "border-white/[0.06]"
              } ${!b.isActive ? "opacity-50" : ""}`}
            >
              {/* Main Branch Gradient Border Effect */}
              {b.isMainBranch && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-pink-500/10 pointer-events-none" />
              )}

              <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      b.isMainBranch
                        ? "bg-gradient-to-br from-violet-500/30 to-purple-500/30"
                        : "bg-white/[0.06]"
                    }`}>
                      <LocationIcon />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{b.name}</h3>
                      {b.isMainBranch && (
                        <span className="inline-flex items-center rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold text-violet-400 border border-violet-500/20">
                          {t.mainBranch}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    b.isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${b.isActive ? "bg-emerald-400" : "bg-red-400"}`} />
                    {b.isActive ? t.active : t.inactive}
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-1.5 mb-4">
                  {b.address && (
                    <div className="flex items-start gap-2 text-xs text-white/40">
                      <LocationIcon />
                      <span className="truncate">{b.address}</span>
                    </div>
                  )}
                  {b.phone && (
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <PhoneIcon />
                      <span>{b.phone}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-xs text-white/40">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="8" r="3" /><path d="M13 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><path d="M17.5 8a2.5 2.5 0 010 5" /><path d="M21 21v-2a2.5 2.5 0 00-2-2.45" /></svg>
                    <span>{b.staffCount} {t.staffCount}</span>
                  </div>
                  {canManage && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(b); }}
                        className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-white/60 hover:bg-white/10 hover:text-white transition"
                      >
                        {t.edit}
                      </button>
                      {!b.isMainBranch && b.isActive && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeactivate(b); }}
                          className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-red-400/60 hover:bg-red-500/10 hover:text-red-400 transition"
                        >
                          {t.deactivate}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════
         CREATE/EDIT MODAL
         ════════════════════════════════════════ */}
      {(showCreateModal || showEditModal) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
        >
          <div
            className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#1a1a2e] p-6 shadow-2xl custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {showCreateModal ? t.createTitle : t.editTitle}
              </h2>
              <button
                onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">{t.name}</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">{t.address}</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition"
                />
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">{t.phone}</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">{t.email}</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsMain}
                    onChange={(e) => setFormIsMain(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500/30"
                  />
                  <span className="text-sm text-white/70">{t.isMainBranch}</span>
                </label>
                {showEditModal && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/30"
                    />
                    <span className="text-sm text-white/70">{t.isActive}</span>
                  </label>
                )}
              </div>

              {/* Working Hours */}
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">{t.workingHours}</label>
                <div className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  {formWorkingHours.map((wh, idx) => (
                    <div key={wh.day} className="flex items-center gap-2">
                      <span className="w-20 text-xs text-white/50 shrink-0">{days[idx]}</span>
                      <label className="flex items-center gap-1 shrink-0">
                        <input
                          type="checkbox"
                          checked={!wh.isClosed}
                          onChange={(e) => {
                            const updated = [...formWorkingHours];
                            updated[idx] = { ...wh, isClosed: !e.target.checked };
                            setFormWorkingHours(updated);
                          }}
                          className="h-3.5 w-3.5 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-0"
                        />
                      </label>
                      {wh.isClosed ? (
                        <span className="text-xs text-red-400/60">{t.closed}</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="time"
                            value={wh.open}
                            onChange={(e) => {
                              const updated = [...formWorkingHours];
                              updated[idx] = { ...wh, open: e.target.value };
                              setFormWorkingHours(updated);
                            }}
                            className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-xs text-white focus:outline-none focus:border-white/20"
                          />
                          <span className="text-white/30 text-xs">-</span>
                          <input
                            type="time"
                            value={wh.close}
                            onChange={(e) => {
                              const updated = [...formWorkingHours];
                              updated[idx] = { ...wh, close: e.target.value };
                              setFormWorkingHours(updated);
                            }}
                            className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-xs text-white focus:outline-none focus:border-white/20"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                  className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 text-sm font-semibold text-white/60 transition hover:bg-white/[0.06] hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={showCreateModal ? handleCreate : handleUpdate}
                  disabled={formSaving || !formName.trim()}
                  className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {formSaving
                    ? (showCreateModal ? t.creating : t.saving)
                    : t.save
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
         DETAIL MODAL
         ════════════════════════════════════════ */}
      {showDetailModal && selectedBranch && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#1a1a2e] p-6 shadow-2xl custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  selectedBranch.isMainBranch
                    ? "bg-gradient-to-br from-violet-500/30 to-purple-500/30"
                    : "bg-white/[0.06]"
                }`}>
                  <LocationIcon />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{selectedBranch.name}</h2>
                  {selectedBranch.isMainBranch && (
                    <span className="inline-flex items-center rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold text-violet-400 border border-violet-500/20">
                      {t.mainBranch}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{t.address}</p>
                <p className="text-sm text-white">{selectedBranch.address || "--"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{t.phone}</p>
                <p className="text-sm text-white">{selectedBranch.phone || "--"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{t.email}</p>
                <p className="text-sm text-white">{selectedBranch.email || "--"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{t.staffCount}</p>
                <p className="text-sm font-bold text-blue-400">{selectedBranch.staffCount}</p>
              </div>
            </div>

            {/* Working Hours */}
            {selectedBranch.workingHoursJson && (() => {
              try {
                const wh: WorkingHour[] = JSON.parse(selectedBranch.workingHoursJson);
                return (
                  <div className="mb-6">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2">{t.workingHours}</p>
                    <div className="space-y-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                      {wh.map((h, idx) => (
                        <div key={h.day} className="flex items-center justify-between text-xs">
                          <span className="text-white/50">{days[idx]}</span>
                          {h.isClosed ? (
                            <span className="text-red-400/60">{t.closed}</span>
                          ) : (
                            <span className="text-white/70">{h.open} - {h.close}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              } catch { return null; }
            })()}

            {/* Assigned Staff */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-3">{t.assignedStaff}</p>

              {selectedBranch.staff.length === 0 ? (
                <p className="text-xs text-white/30 py-4 text-center">{t.noStaffAssigned}</p>
              ) : (
                <div className="space-y-2 mb-4">
                  {selectedBranch.staff.map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/30 to-purple-500/30 text-[10px] font-bold text-white">
                          {s.name.charAt(0)}{s.surname.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{s.name} {s.surname}</p>
                          <div className="flex gap-1 mt-0.5">
                            {s.roles.map((r) => (
                              <span key={r} className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${getRoleBg(r)}`}>
                                {getRoleDisplay(r, language)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      {canManage && (
                        <button
                          onClick={() => handleRemoveStaff(s.id)}
                          className="rounded-lg px-2 py-1 text-[11px] font-semibold text-red-400/60 hover:bg-red-500/10 hover:text-red-400 transition"
                        >
                          {t.removeStaff}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Assign Staff */}
              {canManage && unassignedStaff.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <select
                    value={staffToAssign}
                    onChange={(e) => setStaffToAssign(e.target.value ? parseInt(e.target.value) : "")}
                    className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition"
                  >
                    <option value="" className="bg-[#1a1a2e] text-white/50">{t.selectStaff}</option>
                    {unassignedStaff.map((s) => (
                      <option key={s.id} value={s.id} className="bg-[#1a1a2e] text-white">
                        {s.name} {s.surname}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignStaff}
                    disabled={staffToAssign === "" || assignLoading}
                    className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {assignLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      t.assign
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
