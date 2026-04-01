import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/dashboard_models.dart';
import '../../../core/constants/api_endpoints.dart';
import 'dashboard_state.dart';

class DashboardCubit extends Cubit<DashboardState> {
  final ApiService _api;

  DashboardCubit({ApiService? api})
      : _api = api ?? ApiService(),
        super(const DashboardState());

  Future<void> load() async {
    emit(state.copyWith(status: DashboardStatus.loading));

    final res = await _api.get(
      ApiEndpoints.dashboardSummary,
      fromData: (d) => DashboardSummary.fromJson(d),
    );

    if (res.success && res.data != null) {
      emit(state.copyWith(status: DashboardStatus.loaded, data: res.data));
    } else {
      emit(state.copyWith(
        status: DashboardStatus.error,
        error: res.error?.message ?? 'Veri yüklenemedi',
      ));
    }
  }

  Future<void> refresh() => load();
}
