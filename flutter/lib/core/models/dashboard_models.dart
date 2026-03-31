class DashboardSummary {
  final int todayAppointmentsCount;
  final int upcomingAppointments;
  final double thisWeekRevenue;
  final double thisMonthRevenue;
  final double thisMonthExpense;
  final int totalCustomers;
  final int activePackages;
  final List<MonthlyTrend> monthlyTrend;
  final List<RevenueByGroup> topServices;
  final List<TodayAppointment> todaySchedule;

  DashboardSummary({
    required this.todayAppointmentsCount,
    required this.upcomingAppointments,
    required this.thisWeekRevenue,
    required this.thisMonthRevenue,
    required this.thisMonthExpense,
    required this.totalCustomers,
    required this.activePackages,
    required this.monthlyTrend,
    required this.topServices,
    required this.todaySchedule,
  });

  factory DashboardSummary.fromJson(Map<String, dynamic> json) {
    return DashboardSummary(
      todayAppointmentsCount: json['todayAppointmentsCount'] ?? 0,
      upcomingAppointments: json['upcomingAppointments'] ?? 0,
      thisWeekRevenue: (json['thisWeekRevenue'] ?? 0).toDouble(),
      thisMonthRevenue: (json['thisMonthRevenue'] ?? 0).toDouble(),
      thisMonthExpense: (json['thisMonthExpense'] ?? 0).toDouble(),
      totalCustomers: json['totalCustomers'] ?? 0,
      activePackages: json['activePackages'] ?? 0,
      monthlyTrend: (json['monthlyTrend'] as List? ?? [])
          .map((e) => MonthlyTrend.fromJson(e))
          .toList(),
      topServices: (json['topServices'] as List? ?? [])
          .map((e) => RevenueByGroup.fromJson(e))
          .toList(),
      todaySchedule: (json['todaySchedule'] as List? ?? [])
          .map((e) => TodayAppointment.fromJson(e))
          .toList(),
    );
  }
}

class MonthlyTrend {
  final String month;
  final double revenue;
  final double expense;

  MonthlyTrend({required this.month, required this.revenue, required this.expense});

  factory MonthlyTrend.fromJson(Map<String, dynamic> json) => MonthlyTrend(
        month: json['month'] ?? '',
        revenue: (json['revenue'] ?? 0).toDouble(),
        expense: (json['expense'] ?? 0).toDouble(),
      );
}

class RevenueByGroup {
  final String label;
  final int count;
  final double amountInTry;

  RevenueByGroup({required this.label, required this.count, required this.amountInTry});

  factory RevenueByGroup.fromJson(Map<String, dynamic> json) => RevenueByGroup(
        label: json['label'] ?? '',
        count: json['count'] ?? 0,
        amountInTry: (json['amountInTry'] ?? 0).toDouble(),
      );
}

class TodayAppointment {
  final int id;
  final String time;
  final String customerName;
  final String treatmentName;
  final String staffName;
  final String status;

  TodayAppointment({
    required this.id,
    required this.time,
    required this.customerName,
    required this.treatmentName,
    required this.staffName,
    required this.status,
  });

  factory TodayAppointment.fromJson(Map<String, dynamic> json) => TodayAppointment(
        id: json['id'] ?? 0,
        time: json['time'] ?? '',
        customerName: json['customerName'] ?? '',
        treatmentName: json['treatmentName'] ?? '',
        staffName: json['staffName'] ?? '',
        status: json['status'] ?? '',
      );
}
