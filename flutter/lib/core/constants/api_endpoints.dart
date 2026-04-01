/// Merkezi API endpoint yönetimi
class ApiEndpoints {
  ApiEndpoints._();

  // ── Auth ──
  static const String login = '/auth/login';
  static const String profile = '/profile';

  // ── Dashboard ──
  static const String dashboardSummary = '/dashboard/summary';

  // ── Customers ──
  static const String customers = '/customer';
  static String customerById(int id) => '/customer/$id';

  // ── Appointments ──
  static const String appointments = '/appointment';
  static String appointmentById(int id) => '/appointment/$id';
  static String appointmentStatus(int id) => '/appointment/$id/status';
  static const String appointmentCheckAvailability = '/appointment/check-availability';

  // ── Treatments ──
  static const String treatments = '/treatment';
  static String treatmentById(int id) => '/treatment/$id';

  // ── Staff ──
  static const String staff = '/staff';
  static String staffById(int id) => '/staff/$id';
  static String staffRole(int id) => '/staff/$id/role';
  static String staffRoleToggle(int id) => '/staff/$id/role/toggle';

  // ── Staff Shifts ──
  static String staffShifts(int id) => '/staff/$id/shifts';
  static const String staffShiftsWeekly = '/staff/shifts/weekly-view';

  // ── Staff Leaves ──
  static const String staffLeaves = '/staff/leaves';
  static String staffLeaveApprove(int id) => '/staff/leaves/$id/approve';
  static String staffLeaveReject(int id) => '/staff/leaves/$id/reject';
  static String staffLeaveById(int id) => '/staff/leaves/$id';
  static const String staffLeaveBalances = '/staff/leaves/balances';

  // ── Staff HR ──
  static String staffHrInfo(int id) => '/staff/$id/hr-info';
  static const String staffHrSummary = '/staff/hr-summary';

  // ── Staff Invite ──
  static const String inviteToken = '/tenant/invite-token';
  static const String checkStaffLimit = '/subscription/check-staff-limit';

  // ── Payments / Adisyonlar ──
  static const String payments = '/appointmentpayment';
  static String paymentById(int id) => '/appointmentpayment/$id';

  // ── Currency ──
  static const String currencies = '/currency';
}
