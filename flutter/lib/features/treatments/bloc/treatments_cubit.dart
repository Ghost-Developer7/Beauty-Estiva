import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/appointment_models.dart';
import '../../../core/constants/api_endpoints.dart';
import 'treatments_state.dart';

class TreatmentsCubit extends Cubit<TreatmentsState> {
  final ApiService _api;

  TreatmentsCubit({ApiService? api})
      : _api = api ?? ApiService(),
        super(const TreatmentsState());

  Future<void> load() async {
    emit(state.copyWith(status: TreatmentsStatus.loading));

    final res = await _api.get(
      ApiEndpoints.treatments,
      fromData: (d) {
        // Handle both list and paginated response
        final list = d is List ? d : (d['items'] ?? d['data'] ?? []) as List;
        return list.map((e) => TreatmentListItem.fromJson(e)).toList();
      },
    );

    if (res.success && res.data != null) {
      emit(state.copyWith(
        status: TreatmentsStatus.loaded,
        allTreatments: res.data!,
      ));
    } else {
      emit(state.copyWith(
        status: TreatmentsStatus.error,
        error: res.error?.message ?? 'Veriler yüklenemedi',
      ));
    }
  }

  void search(String query) {
    emit(state.copyWith(searchQuery: query, page: 1));
  }

  void goToPage(int page) {
    emit(state.copyWith(page: page));
  }

  void nextPage() {
    if (state.safePage < state.totalPages) {
      emit(state.copyWith(page: state.safePage + 1));
    }
  }

  void previousPage() {
    if (state.safePage > 1) {
      emit(state.copyWith(page: state.safePage - 1));
    }
  }

  Future<void> deleteTreatment(int id) async {
    final updated =
        state.allTreatments.where((t) => t.id != id).toList();
    emit(state.copyWith(allTreatments: updated));
  }
}
