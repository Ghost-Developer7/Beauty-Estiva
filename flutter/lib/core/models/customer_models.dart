class CustomerListItem {
  final int id;
  final String name;
  final String surname;
  final String fullName;
  final String phone;
  final String? email;
  final int totalAppointments;
  final int totalVisits;
  final double totalSpent;
  final int loyaltyPoints;
  final String segment;
  final List<String> tags;

  CustomerListItem({
    required this.id,
    required this.name,
    required this.surname,
    required this.fullName,
    required this.phone,
    this.email,
    required this.totalAppointments,
    required this.totalVisits,
    required this.totalSpent,
    required this.loyaltyPoints,
    required this.segment,
    required this.tags,
  });

  factory CustomerListItem.fromJson(Map<String, dynamic> json) => CustomerListItem(
        id: json['id'] ?? 0,
        name: json['name'] ?? '',
        surname: json['surname'] ?? '',
        fullName: json['fullName'] ?? '',
        phone: json['phone'] ?? '',
        email: json['email'],
        totalAppointments: json['totalAppointments'] ?? 0,
        totalVisits: json['totalVisits'] ?? 0,
        totalSpent: (json['totalSpent'] ?? 0).toDouble(),
        loyaltyPoints: json['loyaltyPoints'] ?? 0,
        segment: json['segment'] ?? '',
        tags: List<String>.from(json['tags'] ?? []),
      );
}

class CustomerCreate {
  final String name;
  final String surname;
  final String? phone;
  final String? email;
  final String? notes;

  CustomerCreate({required this.name, required this.surname, this.phone, this.email, this.notes});

  Map<String, dynamic> toJson() => {
        'name': name,
        'surname': surname,
        if (phone != null) 'phone': phone,
        if (email != null) 'email': email,
        if (notes != null) 'notes': notes,
      };
}
