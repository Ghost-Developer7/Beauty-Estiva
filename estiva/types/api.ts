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

// ─── Paginated Response ───
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
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
  profilePicturePath?: string | null;
}

// ─── Profile ───
export interface ProfileData {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string | null;
  birthDate: string | null;
  profilePicturePath: string | null;
  roles: string[];
}

export interface UpdateProfileRequest {
  name: string;
  surname: string;
  phone?: string | null;
  birthDate?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
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
  allergies?: string;
  preferences?: string;
  referralSource?: string;
  preferredStaffId?: number;
  tags?: string[];
}

export interface CustomerUpdate extends CustomerCreate {}

export interface CustomerListItem {
  id: number;
  name: string;
  surname: string;
  fullName: string;
  phone: string;
  email: string | null;
  totalAppointments: number;
  lastAppointmentDate: string | null;
  loyaltyPoints: number;
  totalSpent: number;
  totalVisits: number;
  segment: string;
  tags: string[];
  customerSince: string | null;
}

export interface CustomerAppointmentSummary {
  id: number;
  startTime: string;
  treatmentName: string;
  staffName: string;
  status: string;
  amount?: number;
  durationMinutes?: number;
}

export interface CustomerDetail {
  id: number;
  name: string;
  surname: string;
  fullName: string;
  phone: string;
  email: string | null;
  birthDate: string | null;
  notes: string | null;
  cDate: string | null;
  totalAppointments: number;
  recentAppointments: CustomerAppointmentSummary[];
  loyaltyPoints: number;
  totalSpent: number;
  totalVisits: number;
  lastVisitDate: string | null;
  customerSince: string | null;
  preferredStaffId: number | null;
  preferredStaffName: string | null;
  allergies: string | null;
  preferences: string | null;
  tags: string[];
  referralSource: string | null;
  segment: string;
  averageSpendPerVisit: number;
}

// ─── Customer History & Stats ───
export interface CustomerTimelineItem {
  id: number;
  type: string; // "appointment" | "product_purchase" | "package_purchase" | "note"
  date: string;
  title: string;
  description: string | null;
  staffName: string | null;
  amount: number | null;
  status: string | null;
  durationMinutes: number | null;
}

export interface CustomerHistory {
  customerId: number;
  customerFullName: string;
  timeline: CustomerTimelineItem[];
}

export interface CustomerStats {
  customerId: number;
  customerFullName: string;
  totalVisits: number;
  totalSpent: number;
  loyaltyPoints: number;
  customerSince: string | null;
  averageSpendPerVisit: number;
  visitFrequencyDays: number;
  segment: string;
  preferredStaffName: string | null;
  mostUsedTreatment: string | null;
  mostUsedTreatmentCount: number;
  lastVisitDate: string | null;
  nextAppointmentDate: string | null;
}

export interface UpdateLoyaltyPoints {
  points: number;
  reason?: string;
}

export interface UpdateCustomerTags {
  tags: string[];
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
  price: number | null;
  color: string | null;
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
  staffId: number;
  treatmentId: number;
  startTime: string;
  notes?: string;
  status: number;
}

export interface AppointmentStatusUpdate {
  status: number;
  notes?: string;
}

export interface AppointmentListItem {
  id: number;
  customerId: number;
  customerFullName: string;
  customerPhone: string;
  staffId: number;
  staffFullName: string;
  treatmentId: number;
  treatmentName: string;
  treatmentColor: string | null;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  isRecurring: boolean;
  sessionNumber: number;
  totalSessions: number | null;
  parentAppointmentId: number | null;
}

export interface AppointmentDetail extends AppointmentListItem {
  recurrenceIntervalDays: number | null;
  seriesAppointments: AppointmentListItem[];
}

export interface StaffAvailabilityRequest {
  staffId: number;
  treatmentId: number;
  date: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  blockReason: string | null;
}

export interface StaffAvailabilityResult {
  staffId: number;
  staffFullName: string;
  date: string;
  availableSlots: TimeSlot[];
  blockedSlots: TimeSlot[];
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
  currencyId?: number;
  exchangeRateToTry?: number;
  paymentMethod: string;
  paidAt?: string;
  notes?: string;
}

export interface AppointmentPaymentUpdate {
  amount: number;
  currencyId?: number;
  exchangeRateToTry?: number;
  paymentMethod?: string;
  paidAt?: string;
  notes?: string;
}

export interface AppointmentPaymentItem {
  id: number;
  appointmentId: number;
  customerFullName: string;
  treatmentName: string;
  staffFullName: string;
  appointmentStartTime: string;
  amount: number;
  currencyCode: string;
  currencySymbol: string;
  exchangeRateToTry: number;
  amountInTry: number;
  paymentMethodValue: number;
  paymentMethodDisplay: string;
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

// ─── Dashboard Summary ───
export interface DashboardSummary {
  todayAppointmentsCount: number;
  upcomingAppointments: number;
  thisWeekRevenue: number;
  thisMonthRevenue: number;
  thisMonthExpense: number;
  totalCustomers: number;
  activePackages: number;
  monthlyTrend: MonthlyTrend[];
  topServices: RevenueByGroup[];
  topStaff: RevenueByGroup[];
  customerGrowth: CustomerGrowth[];
  statusDistribution: AppointmentStatusDistribution;
  todaySchedule: TodayAppointment[];
}

export interface MonthlyTrend {
  month: string;
  revenue: number;
  expense: number;
}

export interface CustomerGrowth {
  month: string;
  newCustomers: number;
  totalCustomers: number;
}

export interface AppointmentStatusDistribution {
  scheduled: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  noShow: number;
  total: number;
}

export interface TodayAppointment {
  id: number;
  time: string;
  customerName: string;
  treatmentName: string;
  staffName: string;
  status: string;
  treatmentColor: string | null;
}

// ─── Subscription ───
export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  maxStaffCount: number;
  maxBranchCount: number;
  hasSmsIntegration: boolean;
  hasWhatsappIntegration: boolean;
  hasSocialMediaIntegration: boolean;
  hasAiFeatures: boolean;
  features: string | null;
  validityMonths: number;
  isActive: boolean | null;
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

export interface AllCommissionRates {
  staffRates: StaffCommissionRate[];
  treatments: TreatmentBasic[];
}

export interface TreatmentBasic {
  id: number;
  name: string;
}

export interface BulkPayCommissionsRequest {
  staffId: number;
  month: number;
  year: number;
}

// ─── Package Sale ───
export type PackageSaleStatus = "Active" | "Completed" | "Expired" | "Cancelled";

export interface PackageSaleCreate {
  customerId: number;
  treatmentId: number;
  totalSessions: number;
  totalPrice: number;
  paidAmount: number;
  paymentMethod: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface PackageSaleUpdate {
  totalSessions: number;
  totalPrice: number;
  endDate?: string;
  status?: number;
  notes?: string;
}

export interface PackageSaleUsageCreate {
  usageDate?: string;
  staffId?: number;
  notes?: string;
}

export interface PackageSalePaymentCreate {
  amount: number;
  paymentMethod: string;
  paidAt?: string;
  notes?: string;
}

export interface PackageSaleUsageItem {
  id: number;
  usageDate: string;
  staffId: number | null;
  staffFullName: string | null;
  notes: string | null;
}

export interface PackageSalePaymentItem {
  id: number;
  amount: number;
  paymentMethodValue: number;
  paymentMethodDisplay: string;
  paidAt: string;
  notes: string | null;
}

export interface PackageSaleListItem {
  id: number;
  customerId: number;
  customerFullName: string;
  treatmentId: number;
  treatmentName: string;
  staffId: number;
  staffFullName: string;
  totalSessions: number;
  usedSessions: number;
  remainingSessions: number;
  totalPrice: number;
  paidAmount: number;
  remainingPayment: number;
  paymentMethodValue: number;
  paymentMethodDisplay: string;
  startDate: string;
  endDate: string;
  statusValue: number;
  statusDisplay: string;
  notes: string | null;
  createdAt: string;
  usages: PackageSaleUsageItem[];
  payments: PackageSalePaymentItem[];
}

export interface PackageSaleStats {
  totalSales: number;
  totalRevenue: number;
  activePackages: number;
  completedPackages: number;
}

// ─── Product ───
export interface ProductCreate {
  name: string;
  description?: string;
  barcode?: string;
  price: number;
  stockQuantity?: number;
}

export interface ProductUpdate extends ProductCreate {}

export interface ProductListItem {
  id: number;
  name: string;
  description: string | null;
  barcode: string | null;
  price: number;
  stockQuantity: number;
}

// ─── Product Sale ───
export interface ProductSaleCreate {
  productId: number;
  customerId?: number;
  quantity?: number;
  currencyId?: number;
  exchangeRateToTry?: number;
  paymentMethod: string;
  saleDate?: string;
  notes?: string;
}

export interface ProductSaleListItem {
  id: number;
  productId: number;
  productName: string;
  customerId: number | null;
  customerFullName: string | null;
  staffId: number;
  staffFullName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  currencyCode: string;
  currencySymbol: string;
  exchangeRateToTry: number;
  amountInTry: number;
  paymentMethodValue: number;
  paymentMethodDisplay: string;
  saleDate: string;
  notes: string | null;
}

// ─── Branch ───
export interface BranchCreate {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  workingHoursJson?: string;
  isMainBranch: boolean;
}

export interface BranchUpdate {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  workingHoursJson?: string;
  isMainBranch: boolean;
  isActive: boolean;
}

export interface BranchListItem {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  isMainBranch: boolean;
  isActive: boolean;
  staffCount: number;
  cDate: string | null;
}

export interface BranchStaffItem {
  id: number;
  name: string;
  surname: string;
  email: string;
  roles: string[];
}

export interface BranchDetail {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  workingHoursJson: string | null;
  isMainBranch: boolean;
  isActive: boolean;
  staffCount: number;
  cDate: string | null;
  staff: BranchStaffItem[];
}

export interface BranchLimit {
  currentCount: number;
  maxCount: number;
  canAdd: boolean;
  message: string | null;
}

// ─── Staff Shift ───
export interface StaffShiftItem {
  id: number;
  staffId: number;
  staffFullName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStartTime: string | null;
  breakEndTime: string | null;
  isWorkingDay: boolean;
}

export interface StaffWeeklyShift {
  staffId: number;
  staffFullName: string;
  shifts: StaffShiftItem[];
}

export interface StaffShiftUpsert {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStartTime?: string | null;
  breakEndTime?: string | null;
  isWorkingDay: boolean;
}

export interface StaffShiftBulkUpdate {
  shifts: StaffShiftUpsert[];
}

// ─── Staff Leave ───
export type LeaveType = "Annual" | "Sick" | "Maternity" | "Unpaid" | "Other";
export type LeaveStatus = "Pending" | "Approved" | "Rejected";

export interface StaffLeaveListItem {
  id: number;
  staffId: number;
  staffFullName: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  leaveType: string;
  reason: string | null;
  status: string;
  approvedById: number | null;
  approvedByName: string | null;
  approvedDate: string | null;
}

export interface StaffLeaveCreate {
  staffId?: number;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason?: string;
}

export interface StaffLeaveBalance {
  staffId: number;
  staffFullName: string;
  annualEntitlement: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
}

// ─── Staff HR Info ───
export interface StaffHRInfo {
  id: number;
  staffId: number;
  staffFullName: string;
  hireDate: string | null;
  position: string | null;
  salary: number | null;
  salaryCurrency: string;
  identityNumber: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  annualLeaveEntitlement: number;
  usedLeaveDays: number;
  remainingLeaveDays: number;
  notes: string | null;
}

export interface StaffHRInfoUpdate {
  hireDate?: string | null;
  position?: string | null;
  salary?: number | null;
  salaryCurrency?: string | null;
  identityNumber?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  annualLeaveEntitlement?: number | null;
  notes?: string | null;
}

export interface StaffHRSummary {
  staffId: number;
  staffFullName: string;
  position: string | null;
  hireDate: string | null;
  salary: number | null;
  salaryCurrency: string;
  annualLeaveEntitlement: number;
  usedLeaveDays: number;
  remainingLeaveDays: number;
  roles: string[];
}

// ─── Customer Debt / Receivable ───
export interface CustomerDebtItem {
  id: number;
  tenantId: number;
  customerId: number | null;
  customerName: string | null;
  customerPhone: string | null;
  personName: string | null;
  type: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  currency: string | null;
  description: string | null;
  notes: string | null;
  dueDate: string | null;
  status: string;
  relatedAppointmentId: number | null;
  relatedPackageSaleId: number | null;
  source: string | null;
  cDate: string | null;
  payments: CustomerDebtPaymentItem[];
}

export interface CustomerDebtCreate {
  customerId?: number | null;
  personName?: string | null;
  type: string;
  amount: number;
  currency?: string;
  description?: string;
  notes?: string;
  dueDate?: string | null;
  relatedAppointmentId?: number | null;
  relatedPackageSaleId?: number | null;
  source?: string;
}

export interface CustomerDebtUpdate {
  customerId?: number | null;
  personName?: string | null;
  amount: number;
  currency?: string;
  description?: string;
  notes?: string;
  dueDate?: string | null;
  source?: string;
  status?: string;
}

export interface CustomerDebtPaymentItem {
  id: number;
  customerDebtId: number;
  amount: number;
  paymentMethod: string;
  notes: string | null;
  paymentDate: string;
  cDate: string | null;
}

export interface CreateDebtPayment {
  amount: number;
  paymentMethod: string;
  notes?: string;
  paymentDate?: string | null;
}

export interface CustomerDebtSummary {
  totalAmount: number;
  totalPaid: number;
  totalRemaining: number;
  totalCount: number;
  pendingCount: number;
  partialCount: number;
  paidCount: number;
  overdueCount: number;
}

export interface CollectionListItem {
  id: number;
  customerDebtId: number;
  customerName: string | null;
  personName: string | null;
  debtDescription: string | null;
  debtType: string;
  amount: number;
  paymentMethod: string;
  notes: string | null;
  paymentDate: string;
  source: string | null;
  cDate: string | null;
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
  cDate: string | null;
}
