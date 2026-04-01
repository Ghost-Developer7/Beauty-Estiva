class LoginRequest {
  final String emailOrUsername;
  final String password;

  LoginRequest({required this.emailOrUsername, required this.password});

  Map<String, dynamic> toJson() => {
        'emailOrUsername': emailOrUsername,
        'password': password,
      };
}

class LoginResult {
  final String token;
  final String name;
  final String surname;
  final String email;
  final List<String> roles;

  LoginResult({
    required this.token,
    required this.name,
    required this.surname,
    required this.email,
    required this.roles,
  });

  factory LoginResult.fromJson(Map<String, dynamic> json) {
    return LoginResult(
      token: json['token'] ?? '',
      name: json['name'] ?? '',
      surname: json['surname'] ?? '',
      email: json['email'] ?? '',
      roles: List<String>.from(json['roles'] ?? []),
    );
  }
}

class AuthUser {
  final String id;
  final String tenantId;
  final String name;
  final String surname;
  final String email;
  final List<String> roles;
  final String? profileImageUrl;

  AuthUser({
    required this.id,
    required this.tenantId,
    required this.name,
    required this.surname,
    required this.email,
    required this.roles,
    this.profileImageUrl,
  });

  String get fullName => '$name $surname'.trim();
  String get initials =>
      '${name.isNotEmpty ? name[0] : '?'}${surname.isNotEmpty ? surname[0] : '?'}';
  bool get isOwner => roles.contains('Owner');
  bool get isAdmin => roles.contains('Admin') || isOwner;
  String get displayRole =>
      isOwner ? 'Owner' : (roles.contains('Admin') ? 'Admin' : 'Staff');
}
