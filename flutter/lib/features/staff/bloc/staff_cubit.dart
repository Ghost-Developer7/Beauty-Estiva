import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/appointment_models.dart';
import '../../../core/constants/api_endpoints.dart';
import 'staff_state.dart';

class StaffCubit extends Cubit<StaffState> {
  final ApiService _api;

  StaffCubit({ApiService? api})
      : _api = api ?? ApiService(),
        super(const StaffState());

  Future<void> load() async {
    emit(state.copyWith(status: StaffStatus.loading));
    final res = await _api.get(
      ApiEndpoints.staff,
      fromData: (d) {
        final list = d is List ? d : (d['items'] ?? d['data'] ?? []) as List;
        return list.map((e) => StaffMember.fromJson(e)).toList();
      },
    );
    if (res.success && res.data != null) {
      emit(state.copyWith(status: StaffStatus.loaded, staff: res.data!));
    } else {
      emit(state.copyWith(
        status: StaffStatus.error,
        error: res.error?.message ?? 'Veriler yüklenemedi',
      ));
    }
  }

  void setSearch(String value) {
    emit(state.copyWith(search: value));
  }
}
