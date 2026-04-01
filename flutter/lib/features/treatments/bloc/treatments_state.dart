import 'package:equatable/equatable.dart';
import '../../../core/models/appointment_models.dart';

enum TreatmentsStatus { initial, loading, loaded, error }

class TreatmentsState extends Equatable {
  final TreatmentsStatus status;
  final List<TreatmentListItem> allTreatments;
  final String searchQuery;
  final int page;
  final int perPage;
  final String? error;

  const TreatmentsState({
    this.status = TreatmentsStatus.initial,
    this.allTreatments = const [],
    this.searchQuery = '',
    this.page = 1,
    this.perPage = 10,
    this.error,
  });

  // ── Filtered list ──
  List<TreatmentListItem> get filteredTreatments {
    if (searchQuery.isEmpty) return allTreatments;
    final q = searchQuery.toLowerCase();
    return allTreatments.where((t) {
      return t.name.toLowerCase().contains(q) ||
          (t.description?.toLowerCase().contains(q) ?? false);
    }).toList();
  }

  // ── Pagination ──
  int get totalCount => filteredTreatments.length;
  int get totalPages => (totalCount / perPage).ceil().clamp(1, 999);
  int get safePage => page.clamp(1, totalPages);
  int get startIndex => (safePage - 1) * perPage;
  int get endIndex => (startIndex + perPage).clamp(0, totalCount);

  List<TreatmentListItem> get pagedTreatments =>
      filteredTreatments.sublist(startIndex, endIndex);

  // ── KPI computed values ──
  int get totalTreatmentCount => allTreatments.length;

  double get avgPrice {
    final priced = allTreatments.where((t) => t.price != null).toList();
    if (priced.isEmpty) return 0;
    return priced.fold<double>(0, (sum, t) => sum + t.price!) / priced.length;
  }

  double get avgDuration {
    if (allTreatments.isEmpty) return 0;
    return allTreatments.fold<double>(
            0, (sum, t) => sum + t.durationMinutes) /
        allTreatments.length;
  }

  double get minPrice {
    final priced = allTreatments.where((t) => t.price != null).toList();
    if (priced.isEmpty) return 0;
    return priced.map((t) => t.price!).reduce((a, b) => a < b ? a : b);
  }

  double get maxPrice {
    final priced = allTreatments.where((t) => t.price != null).toList();
    if (priced.isEmpty) return 0;
    return priced.map((t) => t.price!).reduce((a, b) => a > b ? a : b);
  }

  TreatmentsState copyWith({
    TreatmentsStatus? status,
    List<TreatmentListItem>? allTreatments,
    String? searchQuery,
    int? page,
    int? perPage,
    String? error,
  }) {
    return TreatmentsState(
      status: status ?? this.status,
      allTreatments: allTreatments ?? this.allTreatments,
      searchQuery: searchQuery ?? this.searchQuery,
      page: page ?? this.page,
      perPage: perPage ?? this.perPage,
      error: error ?? this.error,
    );
  }

  @override
  List<Object?> get props =>
      [status, allTreatments, searchQuery, page, perPage, error];
}
