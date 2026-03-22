// ─── Generic API Response (matches C# ApiResponse<T>) ───
export interface ApiError {
  errorCode: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  message: string | null;
}

// ─── Auth ───
export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface LoginResult {
  token: string;
  name: string;
  surname: string;
  email: string;
  roles: string[];
}

export interface StaffRegisterRequest {
  inviteToken: string;
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  surname: string;
  birthDate?: string;
}

// ─── JWT decoded payload ───
export interface JwtPayload {
  sub: string; // userId
  tenantId: string;
  email: string;
  unique_name: string;
  role: string | string[];
  exp: number;
  iat: number;
}

// ─── User (derived from JWT + LoginResult) ───
export interface AuthUser {
  id: string;
  tenantId: string;
  name: string;
  surname: string;
  email: string;
  roles: string[];
}

// ─── Tenant Onboarding ───
export interface TenantOnboardingRequest {
  companyName: string;
  phone: string;
  address: string;
  taxNumber: string;
  taxOffice: string;
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  surname: string;
}

export interface TenantOnboardingResult {
  tenantId: number;
  userId: number;
}

// ─── Customer ───
export interface CustomerCreate {
  name: string;
  surname: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  notes?: string;
}

export interface CustomerUpdate extends CustomerCreate {}

export interface CustomerListItem {
  id: number;
  name: string;
  surname: string;
  phone: string;
  email: string;
  birthDate: string | null;
  notes: string | null;
  isActive: boolean;
  cDate: string;
}

export interface CustomerDetail extends CustomerListItem {
  lastAppointments: AppointmentListItem[];
}

// ─── Treatment ───
export interface TreatmentCreate {
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  color?: string;
}

export interface TreatmentUpdate extends TreatmentCreate {}

export interface TreatmentListItem {
  id: number;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  color: string | null;
  isActive: boolean;
}

// ─── Appointment ───
export type AppointmentStatus =
  | "Scheduled"
  | "Confirmed"
  | "Completed"
  | "Cancelled"
  | "NoShow";

export interface AppointmentCreate {
  customerId: number;
  staffId: number;
  treatmentId: number;
  startTime: string;
  notes?: string;
  isRecurring?: boolean;
  recurrenceIntervalDays?: number;
  totalSessions?: number;
}

export interface AppointmentUpdate {
  staffId?: number;
  treatmentId?: number;
  startTime?: string;
  notes?: string;
  status?: number;
}

export interface AppointmentStatusUpdate {
  status: number;
  notes?: string;
}

export interface AppointmentListItem {
  id: number;
  customerName: string;
  customerSurname: string;
  staffName: string;
  staffSurname: string;
  treatmentName: string;
  startTime: string;
  endTime: string;
  status: number;
  statusText: string;
  notes: string | null;
  isRecurring: boolean;
  sessionNumber: number | null;
  totalSessions: number | null;
}

export interface AppointmentDetail extends AppointmentListItem {
  customerId: number;
  staffId: number;
  treatmentId: number;
  treatmentDuration: number;
  treatmentPrice: number;
  treatmentColor: string | null;
  seriesAppointments: AppointmentListItem[];
}

export interface StaffAvailabilityRequest {
  staffId: number;
  treatmentId: number;
  date: string;
}

export interface StaffAvailabilityResult {
  staffId: number;
  date: string;
  availableSlots: { startTime: string; endTime: string }[];
}

// ─── Staff Schedule ───
export interface StaffUnavailabilityCreate {
  startTime: string;
  endTime: string;
  reason?: string;
  notes?: string;
}

export interface StaffUnavailabilityUpdate extends StaffUnavailabilityCreate {}

export interface StaffUnavailabilityListItem {
  id: number;
  staffId: number;
  staffName: string;
  startTime: string;
  endTime: string;
  reason: string | null;
  notes: string | null;
}

export interface StaffDailySchedule {
  staffId: number;
  staffName: string;
  date: string;
  appointments: AppointmentListItem[];
  unavailabilities: StaffUnavailabilityListItem[];
}

// ─── Appointment Payment ───
export type PaymentMethod =
  | "Cash"
  | "CreditCard"
  | "BankTransfer"
  | "Check"
  | "Other";

export interface AppointmentPaymentCreate {
  appointmentId: number;
  amount: number;
  currencyId: number;
  paymentMethod: string;
  notes?: string;
}

export interface AppointmentPaymentUpdate {
  amount?: number;
  currencyId?: number;
  paymentMethod?: string;
  notes?: string;
}

export interface AppointmentPaymentItem {
  id: number;
  appointmentId: number;
  amount: number;
  currencyCode: string;
  currencySymbol: string;
  exchangeRateToTry: number;
  amountInTry: number;
  paymentMethod: string;
  paidAt: string;
  notes: string | null;
}

// ─── Currency ───
export interface CurrencyItem {
  id: number;
  code: string;
  symbol: string;
  name: string;
  isDefault: boolean;
  exchangeRateToTry?: number;
  rateLastUpdated?: string;
}

// ─── Expense ───
export interface ExpenseCategoryCreate {
  name: string;
  description?: string;
}

export interface ExpenseCategoryItem {
  id: number;
  name: string;
  description: string | null;
}

export interface ExpenseCreate {
  categoryId: number;
  amount: number;
  currencyId: number;
  description?: string;
  expenseDate: string;
  receiptNumber?: string;
  notes?: string;
}

export interface ExpenseUpdate extends ExpenseCreate {}

export interface ExpenseItem {
  id: number;
  categoryId: number;
  categoryName: string;
  amount: number;
  currencyCode: string;
  currencySymbol: string;
  exchangeRateToTry: number;
  amountInTry: number;
  description: string | null;
  expenseDate: string;
  receiptNumber: string | null;
  notes: string | null;
}

// ─── Financial Reports ───
export interface RevenueByGroup {
  label: string;
  count: number;
  amountInTry: number;
}

export interface DailyAmount {
  date: string;
  amountInTry: number;
}

export interface FinancialDashboard {
  startDate: string;
  endDate: string;
  totalRevenueTRY: number;
  totalExpenseTRY: number;
  netIncomeTRY: number;
  totalAppointments: number;
  paidAppointments: number;
  unpaidAppointments: number;
  topTreatments: RevenueByGroup[];
  topStaff: RevenueByGroup[];
  paymentMethods: RevenueByGroup[];
  topExpenseCategories: RevenueByGroup[];
  dailyRevenue: DailyAmount[];
  dailyExpense: DailyAmount[];
}

export interface RevenueSummary {
  startDate: string;
  endDate: string;
  totalAmountInTry: number;
  paymentCount: number;
  appointmentCount: number;
  byPaymentMethod: RevenueByGroup[];
  byCurrency: RevenueByGroup[];
  byTreatment: RevenueByGroup[];
  byStaff: RevenueByGroup[];
  dailyBreakdown: DailyAmount[];
}

export interface ExpenseSummary {
  startDate: string;
  endDate: string;
  totalAmountInTry: number;
  expenseCount: number;
  byCategory: RevenueByGroup[];
  dailyBreakdown: DailyAmount[];
}

// ─── Subscription ───
export interface SubscriptionPlan {
  id: number;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxStaffCount: number;
  maxBranchCount: number;
  hasSmsIntegration: boolean;
  hasAiFeatures: boolean;
  description: string | null;
}

export interface CurrentSubscription {
  planName: string;
  priceSold: number;
  startDate: string;
  endDate: string;
  isTrialPeriod: boolean;
  trialEndDate: string | null;
  autoRenew: boolean;
  paymentStatus: string;
  isCancelled: boolean;
}

export interface SubscriptionPurchase {
  planId: number;
  isYearly: boolean;
  couponCode?: string;
}

export interface SubscriptionPurchaseResult {
  iframeToken: string;
  iframeUrl: string;
  merchantOid: string;
  originalPrice: number;
  finalPrice: number;
}

// ─── Exchange Rate (TCMB) ───
export interface ExchangeRate {
  currencyCode: string;
  currencyName: string;
  forexBuying: number;
  forexSelling: number;
  rateDate: string;
}

// ─── Staff Commission ───
export interface StaffCommissionRate {
  staffId: number;
  staffFullName: string;
  defaultCommissionRate: number;
  treatmentCommissions: TreatmentCommission[];
}

export interface TreatmentCommission {
  treatmentId: number;
  treatmentName: string;
  commissionRate: number;
}

export interface SetStaffCommissionRequest {
  defaultCommissionRate: number;
  treatmentRates?: { treatmentId: number; commissionRate: number }[];
}

export interface StaffCommissionRecord {
  id: number;
  staffId: number;
  staffFullName: string;
  treatmentName: string;
  customerFullName: string;
  appointmentDate: string;
  paymentAmountInTry: number;
  commissionRate: number;
  commissionAmountInTry: number;
  salonShareInTry: number;
  isPaid: boolean;
  paidAt: string | null;
}

export interface StaffCommissionSummary {
  staffId: number;
  staffFullName: string;
  totalPaymentsInTry: number;
  totalCommissionInTry: number;
  totalSalonShareInTry: number;
  paidCommissionInTry: number;
  unpaidCommissionInTry: number;
  recordCount: number;
}

// ─── Staff (with commission) ───
export interface StaffMember {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string | null;
  birthDate: string | null;
  roles: string[];
  isActive: boolean;
  isApproved: boolean;
  defaultCommissionRate: number;
  cDate: string;
}
