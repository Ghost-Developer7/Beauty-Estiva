import 'dart:convert';
import '../models/auth_models.dart';
import '../models/api_response.dart';
import 'api_service.dart';

class AuthService {
  final ApiService _api = ApiService();

  Future<ApiResponse<LoginResult>> login(LoginRequest request) async {
    return _api.post<LoginResult>(
      '/auth/login',
      data: request.toJson(),
      fromData: (data) => LoginResult.fromJson(data),
    );
  }

  AuthUser? decodeToken(String token) {
    try {
      final parts = token.split('.');
      if (parts.length != 3) return null;
      var payload = parts[1];
      payload = base64.normalize(payload);
      final decoded = utf8.decode(base64.decode(payload));
      final json = jsonDecode(decoded) as Map<String, dynamic>;

      final roles = json['role'] is List
          ? List<String>.from(json['role'])
          : json['role'] is String
              ? [json['role'] as String]
              : <String>[];

      return AuthUser(
        id: json['sub'] ?? '',
        tenantId: json['tenantId'] ?? '',
        name: json['unique_name'] ?? '',
        surname: '',
        email: json['email'] ?? '',
        roles: roles,
      );
    } catch (_) {
      return null;
    }
  }

  bool isTokenExpired(String token) {
    try {
      final parts = token.split('.');
      if (parts.length != 3) return true;
      var payload = parts[1];
      payload = base64.normalize(payload);
      final decoded = utf8.decode(base64.decode(payload));
      final json = jsonDecode(decoded) as Map<String, dynamic>;
      final exp = json['exp'] as int;
      return DateTime.fromMillisecondsSinceEpoch(exp * 1000).isBefore(DateTime.now());
    } catch (_) {
      return true;
    }
  }
}
