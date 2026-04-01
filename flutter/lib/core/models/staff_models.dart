// ── Shift Models ──

class StaffShiftItem {
  final int id;
  final int staffId;
  final String staffFullName;
  final int dayOfWeek;
  final String startTime;
  final String endTime;
  final String? breakStartTime;
  final String? breakEndTime;
  final bool isWorkingDay;

  StaffShiftItem({
    required this.id,
    required this.staffId,
    required this.staffFullName,
    required this.dayOfWeek,
    required this.startTime,
    required this.endTime,
    this.breakStartTime,
    this.breakEndTime,
    required this.isWorkingDay,
  });

  factory StaffShiftItem.fromJson(Map<String, dynamic> json) => StaffShiftItem(
        id: json['id'] ?? 0,
        staffId: json['staffId'] ?? 0,
        staffFullName: json['staffFullName'] ?? '',
        dayOfWeek: json['dayOfWeek'] ?? 0,
        startTime: json['startTime'] ?? '09:00',
        endTime: json['endTime'] ?? '18:00',
        breakStartTime: json['breakStartTime'],
        breakEndTime: json['breakEndTime'],
        isWorkingDay: json['isWorkingDay'] ?? false,
      );

  Map<String, dynamic> toJson() => {
        'dayOfWeek': dayOfWeek,
        'startTime': startTime,
        'endTime': endTime,
        if (breakStartTime != null) 'breakStartTime': breakStartTime,
        if (breakEndTime != null) 'breakEndTime': breakEndTime,
        'isWorkingDay': isWorkingDay,
      };

  static String dayName(int day) => switch (day) {
        0 => 'Pazartesi',
        1 => 'Salı',
        2 => 'Çarşamba',
        3 => 'Perşembe',
        4 => 'Cuma',
        5 => 'Cumartesi',
        6 => 'Pazar',
        _ => '',
      };
}

class StaffWeeklyShift {
  final int staffId;
  final String staffFullName;
  final List<StaffShiftItem> shifts;

  StaffWeeklyShift({
    required this.staffId,
    required this.staffFullName,
    required this.shifts,
  });

  factory StaffWeeklyShift.fromJson(Map<String, dynamic> json) =>
      StaffWeeklyShift(
        staffId: json['staffId'] ?? 0,
        staffFullName: json['staffFullName'] ?? '',
        shifts: (json['shifts'] as List? ?? [])
            .map((e) => StaffShiftItem.fromJson(e))
            .toList(),
      );
}

// ── Leave Models ──

class StaffLeaveListItem {
  final int id;
  final int staffId;
  final String staffFullName;
  final String startDate;
  final String endDate;
  final int durationDays;
  final String leaveType;
  final String? reason;
  final String status;
  final int? approvedById;
  final String? approvedByName;
  final String? approvedDate;

  StaffLeaveListItem({
    required this.id,
    required this.staffId,
    required this.staffFullName,
    required this.startDate,
    required this.endDate,
    required this.durationDays,
    required this.leaveType,
    this.reason,
    required this.status,
    this.approvedById,
    this.approvedByName,
    this.approvedDate,
  });

  factory StaffLeaveListItem.fromJson(Map<String, dynamic> json) =>
      StaffLeaveListItem(
        id: json['id'] ?? 0,
        staffId: json['staffId'] ?? 0,
        staffFullName: json['staffFullName'] ?? '',
        startDate: json['startDate'] ?? '',
        endDate: json['endDate'] ?? '',
        durationDays: json['durationDays'] ?? 0,
        leaveType: json['leaveType'] ?? '',
        reason: json['reason'],
        status: json['status'] ?? 'Pending',
        approvedById: json['approvedById'],
        approvedByName: json['approvedByName'],
        approvedDate: json['approvedDate'],
      );
}

class StaffLeaveBalance {
  final int staffId;
  final String staffFullName;
  final int annualEntitlement;
  final int usedDays;
  final int pendingDays;
  final int remainingDays;

  StaffLeaveBalance({
    required this.staffId,
    required this.staffFullName,
    required this.annualEntitlement,
    required this.usedDays,
    required this.pendingDays,
    required this.remainingDays,
  });

  factory StaffLeaveBalance.fromJson(Map<String, dynamic> json) =>
      StaffLeaveBalance(
        staffId: json['staffId'] ?? 0,
        staffFullName: json['staffFullName'] ?? '',
        annualEntitlement: json['annualEntitlement'] ?? 0,
        usedDays: json['usedDays'] ?? 0,
        pendingDays: json['pendingDays'] ?? 0,
        remainingDays: json['remainingDays'] ?? 0,
      );
}

class StaffLeaveCreate {
  final int? staffId;
  final String startDate;
  final String endDate;
  final String leaveType;
  final String? reason;

  StaffLeaveCreate({
    this.staffId,
    required this.startDate,
    required this.endDate,
    required this.leaveType,
    this.reason,
  });

  Map<String, dynamic> toJson() => {
        if (staffId != null) 'staffId': staffId,
        'startDate': startDate,
        'endDate': endDate,
        'leaveType': leaveType,
        if (reason != null && reason!.isNotEmpty) 'reason': reason,
      };
}

// ── HR Models ──

class StaffHRSummary {
  final int staffId;
  final String staffFullName;
  final String? position;
  final String? hireDate;
  final double? salary;
  final String salaryCurrency;
  final int annualLeaveEntitlement;
  final int usedLeaveDays;
  final int remainingLeaveDays;
  final List<String> roles;

  StaffHRSummary({
    required this.staffId,
    required this.staffFullName,
    this.position,
    this.hireDate,
    this.salary,
    this.salaryCurrency = 'TRY',
    required this.annualLeaveEntitlement,
    required this.usedLeaveDays,
    required this.remainingLeaveDays,
    required this.roles,
  });

  factory StaffHRSummary.fromJson(Map<String, dynamic> json) => StaffHRSummary(
        staffId: json['staffId'] ?? 0,
        staffFullName: json['staffFullName'] ?? '',
        position: json['position'],
        hireDate: json['hireDate'],
        salary: json['salary'] != null ? (json['salary']).toDouble() : null,
        salaryCurrency: json['salaryCurrency'] ?? 'TRY',
        annualLeaveEntitlement: json['annualLeaveEntitlement'] ?? 0,
        usedLeaveDays: json['usedLeaveDays'] ?? 0,
        remainingLeaveDays: json['remainingLeaveDays'] ?? 0,
        roles: List<String>.from(json['roles'] ?? []),
      );
}

class StaffHRInfo {
  final int id;
  final int staffId;
  final String staffFullName;
  final String? hireDate;
  final String? position;
  final double? salary;
  final String salaryCurrency;
  final String? identityNumber;
  final String? emergencyContactName;
  final String? emergencyContactPhone;
  final int annualLeaveEntitlement;
  final int usedLeaveDays;
  final int remainingLeaveDays;
  final String? notes;

  StaffHRInfo({
    required this.id,
    required this.staffId,
    required this.staffFullName,
    this.hireDate,
    this.position,
    this.salary,
    this.salaryCurrency = 'TRY',
    this.identityNumber,
    this.emergencyContactName,
    this.emergencyContactPhone,
    required this.annualLeaveEntitlement,
    required this.usedLeaveDays,
    required this.remainingLeaveDays,
    this.notes,
  });

  factory StaffHRInfo.fromJson(Map<String, dynamic> json) => StaffHRInfo(
        id: json['id'] ?? 0,
        staffId: json['staffId'] ?? 0,
        staffFullName: json['staffFullName'] ?? '',
        hireDate: json['hireDate'],
        position: json['position'],
        salary: json['salary'] != null ? (json['salary']).toDouble() : null,
        salaryCurrency: json['salaryCurrency'] ?? 'TRY',
        identityNumber: json['identityNumber'],
        emergencyContactName: json['emergencyContactName'],
        emergencyContactPhone: json['emergencyContactPhone'],
        annualLeaveEntitlement: json['annualLeaveEntitlement'] ?? 0,
        usedLeaveDays: json['usedLeaveDays'] ?? 0,
        remainingLeaveDays: json['remainingLeaveDays'] ?? 0,
        notes: json['notes'],
      );
}

// ── Invite Models ──

class InviteResult {
  final String token;
  final String registerUrl;
  final bool emailSent;

  InviteResult({
    required this.token,
    required this.registerUrl,
    required this.emailSent,
  });

  factory InviteResult.fromJson(Map<String, dynamic> json) => InviteResult(
        token: json['token'] ?? '',
        registerUrl: json['registerUrl'] ?? '',
        emailSent: json['emailSent'] ?? false,
      );
}
