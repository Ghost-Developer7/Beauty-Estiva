import { z } from "zod";

// ── Login ──
export const loginSchema = z.object({
  email: z.string().min(1, "required").email("invalidEmail"),
  password: z.string().min(1, "required"),
});
export type LoginFormData = z.infer<typeof loginSchema>;

// ── Sign-Up (Owner Registration) ──
export const signUpSchema = z
  .object({
    companyName: z.string().min(1, "required"),
    phone: z
      .string()
      .min(1, "required")
      .regex(/^\+?[0-9\s]{10,15}$/, "invalidPhone"),
    address: z.string().optional(),
    taxNumber: z.string().optional(),
    taxOffice: z.string().optional(),
    ownerName: z.string().min(1, "required"),
    ownerSurname: z.string().min(1, "required"),
    ownerEmail: z.string().min(1, "required").email("invalidEmail"),
    ownerPassword: z
      .string()
      .min(8, "passwordMin")
      .regex(/[A-Z]/, "passwordUppercase")
      .regex(/[0-9]/, "passwordNumber")
      .regex(/[^A-Za-z0-9]/, "passwordSymbol"),
    ownerConfirmPassword: z.string().min(1, "required"),
  })
  .refine((d) => d.ownerPassword === d.ownerConfirmPassword, {
    message: "passwordMismatch",
    path: ["ownerConfirmPassword"],
  });
export type SignUpFormData = z.infer<typeof signUpSchema>;

// ── Customer ──
export const customerSchema = z.object({
  name: z.string().min(1, "required"),
  surname: z.string().min(1, "required"),
  phone: z.string().min(1, "required"),
  email: z.string().email("invalidEmail").or(z.literal("")).optional(),
  notes: z.string().optional(),
});
export type CustomerFormData = z.infer<typeof customerSchema>;

// ── Appointment ──
export const appointmentSchema = z.object({
  customerId: z.number().min(1, "required"),
  treatmentId: z.number().min(1, "required"),
  staffId: z.number().optional(),
  startTime: z.string().min(1, "required"),
  notes: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurrenceIntervalDays: z.number().optional(),
  totalSessions: z.number().optional(),
});
export type AppointmentFormData = z.infer<typeof appointmentSchema>;

// ── Treatment ──
export const treatmentSchema = z.object({
  name: z.string().min(1, "required"),
  description: z.string().optional(),
  durationMinutes: z.number().min(1, "minDuration"),
  price: z.number().min(0, "required"),
  color: z.string().optional(),
});
export type TreatmentFormData = z.infer<typeof treatmentSchema>;

// ── Expense ──
export const expenseSchema = z.object({
  categoryId: z.number().min(1, "required"),
  amount: z.number().min(0.01, "minAmount"),
  currencyId: z.number().optional(),
  description: z.string().optional(),
  expenseDate: z.string().min(1, "required"),
  receiptNumber: z.string().optional(),
  notes: z.string().optional(),
});
export type ExpenseFormData = z.infer<typeof expenseSchema>;

// ── Payment (Order) ──
export const paymentSchema = z.object({
  appointmentId: z.number().min(1, "required"),
  amount: z.number().min(0.01, "minAmount"),
  currencyId: z.number().optional(),
  paymentMethod: z.string().min(1, "required"),
  notes: z.string().optional(),
});
export type PaymentFormData = z.infer<typeof paymentSchema>;

// ── Validation error messages (i18n) ──
export const validationMessages: Record<string, Record<string, string>> = {
  en: {
    required: "This field is required",
    invalidEmail: "Please enter a valid email",
    invalidPhone: "Please enter a valid phone number",
    passwordMin: "Password must be at least 8 characters",
    passwordUppercase: "Password must contain an uppercase letter",
    passwordNumber: "Password must contain a number",
    passwordSymbol: "Password must contain a special character",
    passwordMismatch: "Passwords don't match",
    minDuration: "Duration must be at least 1 minute",
    minAmount: "Amount must be greater than 0",
  },
  tr: {
    required: "Bu alan zorunludur",
    invalidEmail: "Geçerli bir e-posta adresi girin",
    invalidPhone: "Geçerli bir telefon numarası girin",
    passwordMin: "Şifre en az 8 karakter olmalıdır",
    passwordUppercase: "Şifre en az bir büyük harf içermelidir",
    passwordNumber: "Şifre en az bir rakam içermelidir",
    passwordSymbol: "Şifre en az bir özel karakter içermelidir",
    passwordMismatch: "Şifreler uyuşmuyor",
    minDuration: "Süre en az 1 dakika olmalıdır",
    minAmount: "Tutar 0'dan büyük olmalıdır",
  },
};

/** Resolve a zod error key to a translated string */
export function getValidationMessage(key: string, lang: "en" | "tr"): string {
  return validationMessages[lang]?.[key] ?? key;
}
