import 'package:flutter/foundation.dart';
import '../models/auth_models.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();
  final ApiService _apiService = ApiService();

  AuthUser? _user;
  bool _isLoading = false;
  String? _error;

  AuthUser? get user => _user;
  bool get isAuthenticated => _user != null;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<bool> tryRestoreSession() async {
    await _apiService.loadToken();
    if (!_apiService.isAuthenticated) return false;

    // API service zaten token'ı yükledi, kontrol edelim
    final response = await _apiService.get('/dashboard/summary');
    if (response.success) {
      // Token geçerli, user bilgisi için profile çek
      final profileRes = await _apiService.get('/profile',
          fromData: (data) => data as Map<String, dynamic>);
      if (profileRes.success && profileRes.data != null) {
        final p = profileRes.data!;
        _user = AuthUser(
          id: '',
          tenantId: '',
          name: p['name'] ?? '',
          surname: p['surname'] ?? '',
          email: p['email'] ?? '',
          roles: List<String>.from(p['roles'] ?? []),
        );
        notifyListeners();
        return true;
      }
    }

    await _apiService.clearToken();
    return false;
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _authService.login(
        LoginRequest(emailOrUsername: email, password: password),
      );

      if (response.success && response.data != null) {
        final result = response.data!;
        await _apiService.setToken(result.token);

        final decoded = _authService.decodeToken(result.token);
        _user = AuthUser(
          id: decoded?.id ?? '',
          tenantId: decoded?.tenantId ?? '',
          name: result.name,
          surname: result.surname,
          email: result.email,
          roles: result.roles,
        );

        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = response.error?.message ?? 'Giriş başarısız';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Bağlantı hatası: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _apiService.clearToken();
    _user = null;
    notifyListeners();
  }
}
