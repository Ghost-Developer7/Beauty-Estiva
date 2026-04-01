import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/api_response.dart';
import '../../../core/models/appointment_models.dart';
import '../../../core/constants/api_endpoints.dart';
import 'appointments_state.dart';

class AppointmentsCubit extends Cubit<AppointmentsState> {
  final ApiService _api;

  AppointmentsCubit({ApiService? api})
      : _api = api ?? ApiService(),
        super(AppointmentsState());

  Future<void> load() async {
    emit(state.copyWith(status: AppointmentsStatus.loading));

    final startDate = state.selectedDate.toIso8601String().split('T')[0];
    final endDate = state.selectedDate
        .add(const Duration(days: 1))
        .toIso8601String()
        .split('T')[0];

    final queryParams = <String, dynamic>{
      'startDate': startDate,
      'endDate': endDate,
      'pageNumber': state.page,
      'pageSize': state.pageSize,
    };

    if (state.staffFilter != null) {
      queryParams['staffId'] = state.staffFilter;
    }
    if (state.treatmentFilter != null) {
      queryParams['treatmentId'] = state.treatmentFilter;
    }
    if (state.statusFilter != null && state.statusFilter!.isNotEmpty) {
      queryParams['status'] = state.statusFilter;
    }
    if (state.customerSearch.isNotEmpty) {
      queryParams['search'] = state.customerSearch;
    }

    final res = await _api.get(
      ApiEndpoints.appointments,
      queryParameters: queryParams,
      fromData: (d) =>
          PaginatedResponse.fromJson(d, AppointmentListItem.fromJson),
    );

    if (res.success && res.data != null) {
      final items = res.data!.items;
      emit(state.copyWith(
        status: AppointmentsStatus.loaded,
        appointments: items,
        totalPages: res.data!.totalPages,
        totalCount: res.data!.totalCount,
        statusCounts: StatusCounts.fromItems(items),
      ));
    } else {
      emit(state.copyWith(
        status: AppointmentsStatus.error,
        error: res.error?.message ?? 'Veriler yuklenemedi',
      ));
    }
  }

  /// Load staff and treatment lists for filter dropdowns
  Future<void> loadFilterOptions() async {
    final staffRes = await _api.get(
      ApiEndpoints.staff,
      queryParameters: {'pageSize': 100},
      fromData: (d) => PaginatedResponse.fromJson(d, StaffMember.fromJson),
    );

    final treatmentRes = await _api.get(
      ApiEndpoints.treatments,
      queryParameters: {'pageSize': 100},
      fromData: (d) =>
          PaginatedResponse.fromJson(d, TreatmentListItem.fromJson),
    );

    final staffOptions = <FilterOption>[];
    if (staffRes.success && staffRes.data != null) {
      for (final s in staffRes.data!.items) {
        staffOptions.add(FilterOption(id: s.id, name: s.fullName));
      }
    }

    final treatmentOptions = <FilterOption>[];
    if (treatmentRes.success && treatmentRes.data != null) {
      for (final t in treatmentRes.data!.items) {
        treatmentOptions.add(FilterOption(id: t.id, name: t.name));
      }
    }

    emit(state.copyWith(
      staffOptions: staffOptions,
      treatmentOptions: treatmentOptions,
    ));
  }

  void setDate(DateTime date) {
    emit(state.copyWith(selectedDate: date, page: 1));
    load();
  }

  void goToToday() {
    setDate(DateTime.now());
  }

  void goToPreviousDay() {
    setDate(state.selectedDate.subtract(const Duration(days: 1)));
  }

  void goToNextDay() {
    setDate(state.selectedDate.add(const Duration(days: 1)));
  }

  void setPage(int page) {
    emit(state.copyWith(page: page));
    load();
  }

  void setPageSize(int pageSize) {
    emit(state.copyWith(pageSize: pageSize, page: 1));
    load();
  }

  void setStaffFilter(int? staffId) {
    emit(state.copyWith(staffFilter: () => staffId, page: 1));
    load();
  }

  void setTreatmentFilter(int? treatmentId) {
    emit(state.copyWith(treatmentFilter: () => treatmentId, page: 1));
    load();
  }

  void setStatusFilter(String? status) {
    emit(state.copyWith(statusFilter: () => status, page: 1));
    load();
  }

  void setCustomerSearch(String search) {
    emit(state.copyWith(customerSearch: search, page: 1));
    load();
  }
}
