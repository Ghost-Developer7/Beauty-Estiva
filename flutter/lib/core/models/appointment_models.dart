class AppointmentListItem {
  final int id;
  final int customerId;
  final String customerFullName;
  final String customerPhone;
  final int staffId;
  final String staffFullName;
  final int treatmentId;
  final String treatmentName;
  final String? treatmentColor;
  final int durationMinutes;
  final String startTime;
  final String endTime;
  final String status;
  final String? notes;

  AppointmentListItem({
    required this.id,
    required this.customerId,
    required this.customerFullName,
    required this.customerPhone,
    required this.staffId,
    required this.staffFullName,
    required this.treatmentId,
    required this.treatmentName,
    this.treatmentColor,
    required this.durationMinutes,
    required this.startTime,
    required this.endTime,
    required this.status,
    this.notes,
  });

  factory AppointmentListItem.fromJson(Map<String, dynamic> json) => AppointmentListItem(
        id: json['id'] ?? 0,
        customerId: json['customerId'] ?? 0,
        customerFullName: json['customerFullName'] ?? '',
        customerPhone: json['customerPhone'] ?? '',
        staffId: json['staffId'] ?? 0,
        staffFullName: json['staffFullName'] ?? '',
        treatmentId: json['treatmentId'] ?? 0,
        treatmentName: json['treatmentName'] ?? '',
        treatmentColor: json['treatmentColor'],
        durationMinutes: json['durationMinutes'] ?? 0,
        startTime: json['startTime'] ?? '',
        endTime: json['endTime'] ?? '',
        status: json['status'] ?? '',
        notes: json['notes'],
      );
}

class TreatmentListItem {
  final int id;
  final String name;
  final String? description;
  final int durationMinutes;
  final double? price;
  final String? color;

  TreatmentListItem({
    required this.id,
    required this.name,
    this.description,
    required this.durationMinutes,
    this.price,
    this.color,
  });

  factory TreatmentListItem.fromJson(Map<String, dynamic> json) => TreatmentListItem(
        id: json['id'] ?? 0,
        name: json['name'] ?? '',
        description: json['description'],
        durationMinutes: json['durationMinutes'] ?? 0,
        price: json['price'] != null ? (json['price']).toDouble() : null,
        color: json['color'],
      );
}

class StaffMember {
  final int id;
  final String name;
  final String surname;
  final String email;
  final String? phone;
  final List<String> roles;
  final bool isActive;
  final double defaultCommissionRate;

  StaffMember({
    required this.id,
    required this.name,
    required this.surname,
    required this.email,
    this.phone,
    required this.roles,
    required this.isActive,
    required this.defaultCommissionRate,
  });

  String get fullName => '$name $surname'.trim();
  String get rolesDisplay => roles.join(', ');

  factory StaffMember.fromJson(Map<String, dynamic> json) => StaffMember(
        id: json['id'] ?? 0,
        name: json['name'] ?? '',
        surname: json['surname'] ?? '',
        email: json['email'] ?? '',
        phone: json['phone'],
        roles: List<String>.from(json['roles'] ?? []),
        isActive: json['isActive'] ?? false,
        defaultCommissionRate: (json['defaultCommissionRate'] ?? 0).toDouble(),
      );
}
