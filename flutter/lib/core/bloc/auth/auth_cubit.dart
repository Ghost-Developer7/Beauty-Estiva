import 'package:flutter_bloc/flutter_bloc.dart';
import '../../models/auth_models.dart';
import '../../services/api_service.dart';
import '../../services/auth_service.dart';
import '../../constants/api_endpoints.dart';
import 'auth_state.dart';

class AuthCubit extends Cubit<AuthState> {
  final AuthService _authService;
  final ApiService _apiService;

  AuthCubit({
    AuthService? authService,
    ApiService? apiService,
  })  : _authService = authService ?? AuthService(),
        _apiService = apiService ?? ApiService(),
        super(const AuthState());

  Future<void> tryRestoreSession() async {
    await _apiService.loadToken();
    if (!_apiService.isAuthenticated) {
      emit(state.copyWith(status: AuthStatus.unauthenticated));
      return;
    }

    final response = await _apiService.get(ApiEndpoints.dashboardSummary);
    if (response.success) {
      final profileRes = await _apiService.get(
        ApiEndpoints.profile,
        fromData: (data) => data as Map<String, dynamic>,
      );
      if (profileRes.success && profileRes.data != null) {
        final p = profileRes.data!;
        emit(state.copyWith(
          status: AuthStatus.authenticated,
          user: AuthUser(
            id: '',
            tenantId: '',
            name: p['name'] ?? '',
            surname: p['surname'] ?? '',
            email: p['email'] ?? '',
            roles: List<String>.from(p['roles'] ?? []),
            profileImageUrl: p['profileImageUrl'] ?? p['avatarUrl'],
          ),
        ));
        return;
      }
    }

    await _apiService.clearToken();
    emit(state.copyWith(status: AuthStatus.unauthenticated));
  }

  Future<bool> login(String email, String password) async {
    emit(state.copyWith(isLoading: true, clearError: true));

    try {
      final response = await _authService.login(
        LoginRequest(emailOrUsername: email, password: password),
      );

      if (response.success && response.data != null) {
        final result = response.data!;
        await _apiService.setToken(result.token);

        final decoded = _authService.decodeToken(result.token);
        emit(state.copyWith(
          status: AuthStatus.authenticated,
          isLoading: false,
          user: AuthUser(
            id: decoded?.id ?? '',
            tenantId: decoded?.tenantId ?? '',
            name: result.name,
            surname: result.surname,
            email: result.email,
            roles: result.roles,
          ),
        ));
        return true;
      } else {
        emit(state.copyWith(
          isLoading: false,
          error: response.error?.message ?? 'Giriş başarısız',
        ));
        return false;
      }
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        error: 'Bağlantı hatası: $e',
      ));
      return false;
    }
  }

  Future<void> logout() async {
    await _apiService.clearToken();
    emit(const AuthState(status: AuthStatus.unauthenticated));
  }
}
