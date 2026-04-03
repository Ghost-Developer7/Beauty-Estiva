"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { profileService } from "@/services/profileService";
import { LocaleDateInput } from "@/components/ui/LocaleDateInput";
import toast from "react-hot-toast";
import type { ProfileData } from "@/types/api";

const copy = {
  en: {
    title: "Profile Information",
    personalInfo: "Personal Information",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    phone: "Phone",
    birthDate: "Birth Date",
    upload: "Upload",
    change: "Change",
    remove: "Remove",
    save: "Save Changes",
    saving: "Saving...",
    changePassword: "Change Password",
    currentPassword: "Current Password",
    currentPasswordPh: "Your current password",
    newPassword: "New Password",
    newPasswordPh: "At least 8 characters",
    confirmPassword: "Confirm New Password",
    confirmPasswordPh: "Enter new password again",
    changingPassword: "Changing...",
    changePasswordBtn: "Change Password",
    // Toast messages
    profileLoadError: "Could not load profile information.",
    nameRequired: "First name and last name are required.",
    profileUpdated: "Profile information updated.",
    profileUpdateError: "Could not update profile.",
    passwordFieldsRequired: "All password fields are required.",
    passwordMismatch: "New passwords do not match.",
    passwordMinLength: "Password must be at least 8 characters.",
    passwordChanged: "Password changed successfully.",
    passwordChangeError: "Could not change password. Check your current password.",
    fileTooLarge: "File size must be 5MB or less.",
    pictureUpdated: "Profile picture updated.",
    pictureUploadError: "Could not upload picture.",
    pictureRemoved: "Profile picture removed.",
    pictureRemoveError: "Could not remove picture.",
  },
  tr: {
    title: "Profil Bilgileri",
    personalInfo: "Kişisel Bilgiler",
    firstName: "Ad",
    lastName: "Soyad",
    email: "E-posta",
    phone: "Telefon",
    birthDate: "Doğum Tarihi",
    upload: "Yükle",
    change: "Değiştir",
    remove: "Kaldır",
    save: "Değişiklikleri Kaydet",
    saving: "Kaydediliyor...",
    changePassword: "Şifre Değiştir",
    currentPassword: "Mevcut Şifre",
    currentPasswordPh: "Mevcut şifreniz",
    newPassword: "Yeni Şifre",
    newPasswordPh: "En az 8 karakter",
    confirmPassword: "Yeni Şifre Tekrar",
    confirmPasswordPh: "Yeni şifrenizi tekrar girin",
    changingPassword: "Değiştiriliyor...",
    changePasswordBtn: "Şifreyi Değiştir",
    // Toast messages
    profileLoadError: "Profil bilgileri yüklenemedi.",
    nameRequired: "Ad ve soyad alanları zorunludur.",
    profileUpdated: "Profil bilgileri güncellendi.",
    profileUpdateError: "Profil güncellenemedi.",
    passwordFieldsRequired: "Tüm şifre alanları zorunludur.",
    passwordMismatch: "Yeni şifreler eşleşmiyor.",
    passwordMinLength: "Şifre en az 8 karakter olmalıdır.",
    passwordChanged: "Şifre başarıyla değiştirildi.",
    passwordChangeError: "Şifre değiştirilemedi. Mevcut şifrenizi kontrol edin.",
    fileTooLarge: "Dosya boyutu en fazla 5MB olabilir.",
    pictureUpdated: "Profil fotoğrafı güncellendi.",
    pictureUploadError: "Fotoğraf yüklenemedi.",
    pictureRemoved: "Profil fotoğrafı kaldırıldı.",
    pictureRemoveError: "Fotoğraf kaldırılamadı.",
  },
};

const API_BASE = (() => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
  return apiUrl.replace(/\/api\/?$/, "");
})();

interface ProfileScreenProps {
  open: boolean;
  onClose: () => void;
}

export default function ProfileScreen({ open, onClose }: ProfileScreenProps) {
  const { user, updateUser } = useAuth();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const t = copy[language];
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const passwordSectionRef = useRef<HTMLDivElement>(null);

  // Form state
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await profileService.getProfile();
      const data = res.data.data;
      if (data) {
        setProfile(data);
        setName(data.name);
        setSurname(data.surname);
        setPhone(data.phone ?? "");
        setBirthDate(
          data.birthDate ? data.birthDate.substring(0, 10) : ""
        );
      }
    } catch {
      toast.error(t.profileLoadError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchProfile();
      setShowPasswordSection(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  }, [open, fetchProfile]);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleSave = async () => {
    if (!name.trim() || !surname.trim()) {
      toast.error(t.nameRequired);
      return;
    }
    try {
      setSaving(true);
      const res = await profileService.updateProfile({
        name: name.trim(),
        surname: surname.trim(),
        phone: phone.trim() || null,
        birthDate: birthDate || null,
      });
      if (res.data.success && res.data.data) {
        setProfile(res.data.data);
        updateUser({
          name: res.data.data.name,
          surname: res.data.data.surname,
          profilePicturePath: res.data.data.profilePicturePath,
        });
        toast.success(t.profileUpdated);
      }
    } catch {
      toast.error(t.profileUpdateError);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error(t.passwordFieldsRequired);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error(t.passwordMismatch);
      return;
    }
    if (newPassword.length < 8) {
      toast.error(t.passwordMinLength);
      return;
    }
    try {
      setChangingPassword(true);
      const res = await profileService.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      if (res.data.success) {
        toast.success(t.passwordChanged);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setShowPasswordSection(false);
      }
    } catch {
      toast.error(t.passwordChangeError);
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePictureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(t.fileTooLarge);
      return;
    }

    try {
      setUploadingPicture(true);
      const res = await profileService.uploadProfilePicture(file);
      if (res.data.success && res.data.data) {
        const newPath = res.data.data;
        setProfile((prev) =>
          prev ? { ...prev, profilePicturePath: newPath } : prev
        );
        updateUser({ profilePicturePath: newPath });
        toast.success(t.pictureUpdated);
      }
    } catch {
      toast.error(t.pictureUploadError);
    } finally {
      setUploadingPicture(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePicture = async () => {
    try {
      setUploadingPicture(true);
      const res = await profileService.removeProfilePicture();
      if (res.data.success) {
        setProfile((prev) =>
          prev ? { ...prev, profilePicturePath: null } : prev
        );
        updateUser({ profilePicturePath: null });
        toast.success(t.pictureRemoved);
      }
    } catch {
      toast.error(t.pictureRemoveError);
    } finally {
      setUploadingPicture(false);
    }
  };

  const getInitials = () => {
    if (profile) {
      return `${profile.name.charAt(0)}${profile.surname.charAt(0)}`.toUpperCase();
    }
    if (user) {
      return `${user.name.charAt(0)}${user.surname.charAt(0)}`.toUpperCase();
    }
    return "?";
  };

  const getAvatarUrl = () => {
    const path = profile?.profilePicturePath;
    if (!path) return null;
    return path.startsWith("http") ? path : `${API_BASE}${path}`;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative z-10 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto scroll-smooth rounded-2xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-[#0f0f1a]" : "bg-white"} shadow-2xl ${isDark ? "shadow-purple-900/20" : "shadow-gray-300/40"}`} style={{ scrollbarWidth: "none" }}>
        {/* Header */}
        <div className={`sticky top-0 z-20 flex items-center justify-between border-b ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-[#0f0f1a]/95" : "bg-white/95"} backdrop-blur px-6 py-4`}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              {t.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? "text-white/40" : "text-gray-400"} transition ${isDark ? "hover:bg-white/10 hover:text-white" : "hover:bg-gray-100 hover:text-gray-600"}`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-pink-500" />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                {getAvatarUrl() ? (
                  <img
                    src={getAvatarUrl()!}
                    alt="Profil"
                    className={`h-28 w-28 rounded-full object-cover border-4 ${isDark ? "border-white/10" : "border-gray-200"} shadow-lg shadow-purple-500/20`}
                  />
                ) : (
                  <div className={`flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#ffd1dc] to-[#f3a4ff] border-4 ${isDark ? "border-white/10" : "border-gray-200"} shadow-lg shadow-purple-500/20 text-2xl font-bold text-[#2e174e]`}>
                    {getInitials()}
                  </div>
                )}
                {uploadingPicture && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-pink-500" />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={handlePictureUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPicture}
                  className={`flex items-center gap-1.5 rounded-lg border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-1.5 text-xs font-medium ${isDark ? "text-white/70" : "text-gray-700"} transition ${isDark ? "hover:bg-white/10 hover:text-white" : "hover:bg-gray-100 hover:text-gray-900"} disabled:opacity-50`}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  {profile?.profilePicturePath ? t.change : t.upload}
                </button>
                {profile?.profilePicturePath && (
                  <button
                    onClick={handleRemovePicture}
                    disabled={uploadingPicture}
                    className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    {t.remove}
                  </button>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className={`h-px bg-gradient-to-r from-transparent ${isDark ? "via-white/10" : "via-gray-200"} to-transparent`} />

            {/* Profile Form */}
            <div className="space-y-4">
              <div className={`flex items-center gap-2 text-sm font-medium ${isDark ? "text-white/50" : "text-gray-500"}`}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {t.personalInfo}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Name */}
                <div>
                  <label className={`mb-1 block text-xs font-medium ${isDark ? "text-white/40" : "text-gray-400"}`}>
                    {t.firstName}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full rounded-lg border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} placeholder:text-gray-300 focus:border-pink-500/50 focus:outline-none focus:ring-1 focus:ring-pink-500/30 transition`}
                    placeholder={t.firstName}
                  />
                </div>

                {/* Surname */}
                <div>
                  <label className={`mb-1 block text-xs font-medium ${isDark ? "text-white/40" : "text-gray-400"}`}>
                    {t.lastName}
                  </label>
                  <input
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className={`w-full rounded-lg border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} placeholder:text-gray-300 focus:border-pink-500/50 focus:outline-none focus:ring-1 focus:ring-pink-500/30 transition`}
                    placeholder={t.lastName}
                  />
                </div>
              </div>

              {/* Email (readonly) */}
              <div>
                <label className={`mb-1 block text-xs font-medium ${isDark ? "text-white/40" : "text-gray-400"}`}>
                  <span className="flex items-center gap-1.5">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    {t.email}
                  </span>
                </label>
                <input
                  type="email"
                  value={profile?.email ?? ""}
                  disabled
                  className={`w-full rounded-lg border ${isDark ? "border-white/5" : "border-gray-100"} ${isDark ? "bg-white/[0.02]" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white/40" : "text-gray-400"} cursor-not-allowed`}
                />
              </div>

              {/* Phone */}
              <div>
                <label className={`mb-1 block text-xs font-medium ${isDark ? "text-white/40" : "text-gray-400"}`}>
                  <span className="flex items-center gap-1.5">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    {t.phone}
                  </span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full rounded-lg border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} placeholder:text-gray-300 focus:border-pink-500/50 focus:outline-none focus:ring-1 focus:ring-pink-500/30 transition`}
                  placeholder="0 (5XX) XXX XX XX"
                />
              </div>

              {/* Birth Date */}
              <div>
                <label className={`mb-1 block text-xs font-medium ${isDark ? "text-white/40" : "text-gray-400"}`}>
                  <span className="flex items-center gap-1.5">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {t.birthDate}
                  </span>
                </label>
                <LocaleDateInput
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className={`w-full rounded-lg border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} px-3 py-2 text-sm ${isDark ? "text-white" : "text-gray-900"} placeholder:text-gray-300 focus:border-pink-500/50 focus:outline-none focus:ring-1 focus:ring-pink-500/30 transition ${isDark ? "[color-scheme:dark]" : "[color-scheme:light]"}`}
                  isDark={isDark}
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:from-pink-600 hover:to-purple-700 hover:shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                )}
                {saving ? t.saving : t.save}
              </button>
            </div>

            {/* Divider */}
            <div className={`h-px bg-gradient-to-r from-transparent ${isDark ? "via-white/10" : "via-gray-200"} to-transparent`} />

            {/* Password Section */}
            <div>
              <button
                onClick={() => {
                  const next = !showPasswordSection;
                  setShowPasswordSection(next);
                  if (next) {
                    setTimeout(() => passwordSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 100);
                  }
                }}
                className={`flex w-full items-center justify-between rounded-xl border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/[0.02]" : "bg-gray-50"} px-4 py-3 text-sm font-medium ${isDark ? "text-white/60" : "text-gray-600"} transition ${isDark ? "hover:bg-white/5 hover:text-white/80" : "hover:bg-gray-100 hover:text-gray-800"}`}
              >
                <span className="flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="3"
                      y="11"
                      width="18"
                      height="11"
                      rx="2"
                      ry="2"
                    />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  {t.changePassword}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform ${showPasswordSection ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showPasswordSection && (() => {
                const inputCls = `w-full rounded-lg border ${isDark ? "border-white/10" : "border-gray-200"} ${isDark ? "bg-white/5" : "bg-gray-50"} pl-3 pr-10 py-2.5 text-sm ${isDark ? "text-white" : "text-gray-900"} ${isDark ? "placeholder:text-white/25" : "placeholder:text-gray-400"} focus:border-pink-500/50 focus:outline-none focus:ring-1 focus:ring-pink-500/30 transition`;
                const toggleBtnCls = `absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? "text-white/30 hover:text-white/60" : "text-gray-400 hover:text-gray-600"} transition`;

                // Password strength
                const getStrength = (pw: string) => {
                  if (!pw) return 0;
                  let s = 0;
                  if (pw.length >= 6) s++;
                  if (pw.length >= 10) s++;
                  if (/[A-Z]/.test(pw)) s++;
                  if (/[0-9]/.test(pw)) s++;
                  if (/[^A-Za-z0-9]/.test(pw)) s++;
                  return Math.min(s, 4);
                };
                const strength = getStrength(newPassword);
                const strengthLabels = language === "tr"
                  ? ["", "Zayıf", "Orta", "İyi", "Güçlü"]
                  : ["", "Weak", "Fair", "Good", "Strong"];
                const strengthColors = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];

                const EyeIcon = () => (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                );
                const EyeOffIcon = () => (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                  </svg>
                );

                const pwMatch = newPassword && confirmNewPassword && newPassword === confirmNewPassword;
                const pwMismatch = confirmNewPassword && newPassword !== confirmNewPassword;

                return (
                <div ref={passwordSectionRef} className={`mt-3 space-y-4 rounded-xl border ${isDark ? "border-white/5" : "border-gray-100"} ${isDark ? "bg-white/[0.02]" : "bg-gray-50/50"} p-4`}>
                  {/* Current Password */}
                  <div>
                    <label className={`mb-1.5 block text-xs font-medium ${isDark ? "text-white/40" : "text-gray-400"}`}>
                      {t.currentPassword}
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPw ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={inputCls}
                        placeholder={t.currentPasswordPh}
                      />
                      <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className={toggleBtnCls}>
                        {showCurrentPw ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className={`mb-1.5 block text-xs font-medium ${isDark ? "text-white/40" : "text-gray-400"}`}>
                      {t.newPassword}
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPw ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={inputCls}
                        placeholder={t.newPasswordPh}
                      />
                      <button type="button" onClick={() => setShowNewPw(!showNewPw)} className={toggleBtnCls}>
                        {showNewPw ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    {/* Strength meter */}
                    {newPassword && (
                      <div className="mt-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className="h-1 flex-1 rounded-full transition-all duration-300"
                              style={{
                                backgroundColor: strength >= level ? strengthColors[strength] : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                              }}
                            />
                          ))}
                        </div>
                        <p className="mt-1 text-[10px] font-medium" style={{ color: strengthColors[strength] }}>
                          {strengthLabels[strength]}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className={`mb-1.5 block text-xs font-medium ${isDark ? "text-white/40" : "text-gray-400"}`}>
                      {t.confirmPassword}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPw ? "text" : "password"}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className={`${inputCls} ${pwMatch ? "!border-green-500/50 !ring-green-500/20" : ""} ${pwMismatch ? "!border-red-500/50 !ring-red-500/20" : ""}`}
                        placeholder={t.confirmPasswordPh}
                      />
                      <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className={toggleBtnCls}>
                        {showConfirmPw ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    {pwMatch && (
                      <p className="mt-1 flex items-center gap-1 text-[10px] font-medium text-green-500">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                        {language === "tr" ? "Şifreler eşleşiyor" : "Passwords match"}
                      </p>
                    )}
                    {pwMismatch && (
                      <p className="mt-1 flex items-center gap-1 text-[10px] font-medium text-red-400">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        {language === "tr" ? "Şifreler eşleşmiyor" : "Passwords don't match"}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleChangePassword}
                    disabled={changingPassword || !currentPassword || !newPassword || !confirmNewPassword || !!pwMismatch}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:shadow-pink-500/30 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100"
                  >
                    {changingPassword ? (
                      <div className={`h-4 w-4 animate-spin rounded-full border-2 ${isDark ? "border-white/20 border-t-white" : "border-white/40 border-t-white"}`} />
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    )}
                    {changingPassword ? t.changingPassword : t.changePasswordBtn}
                  </button>
                </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
