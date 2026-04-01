import 'package:equatable/equatable.dart';
import '../../../core/models/appointment_models.dart';

enum AppointmentsStatus { initial, loading, loaded, error }

class StatusCounts extends Equatable {
  final int scheduled;
  final int confirmed;
  final int completed;
  final int cancelled;

  const StatusCounts({
    this.scheduled = 0,
    this.confirmed = 0,
    this.completed = 0,
    this.cancelled = 0,
  });

  factory StatusCounts.fromItems(List<AppointmentListItem> items) {
    int scheduled = 0, confirmed = 0, completed = 0, cancelled = 0;
    for (final item in items) {
      switch (item.status) {
        case 'Scheduled':
          scheduled++;
        case 'Confirmed':
          confirmed++;
        case 'Completed':
          completed++;
        case 'Cancelled':
          cancelled++;
      }
    }
    return StatusCounts(
      scheduled: scheduled,
      confirmed: confirmed,
      completed: completed,
      cancelled: cancelled,
    );
  }

  @override
  List<Object?> get props => [scheduled, confirmed, completed, cancelled];
}

class FilterOption extends Equatable {
  final int id;
  final String name;

  const FilterOption({required this.id, required this.name});

  @override
  List<Object?> get props => [id, name];
}

class AppointmentsState extends Equatable {
  final AppointmentsStatus status;
  final List<AppointmentListItem> appointments;
  final DateTime selectedDate;
  final int page;
  final int pageSize;
  final int totalPages;
  final int totalCount;
  final StatusCounts statusCounts;
  final String? error;

  // Filters
  final int? staffFilter;
  final int? treatmentFilter;
  final String? statusFilter;
  final String customerSearch;

  // Filter options (loaded from API)
  final List<FilterOption> staffOptions;
  final List<FilterOption> treatmentOptions;

  AppointmentsState({
    this.status = AppointmentsStatus.initial,
    this.appointments = const [],
    DateTime? selectedDate,
    this.page = 1,
    this.pageSize = 20,
    this.totalPages = 1,
    this.totalCount = 0,
    this.statusCounts = const StatusCounts(),
    this.error,
    this.staffFilter,
    this.treatmentFilter,
    this.statusFilter,
    this.customerSearch = '',
    this.staffOptions = const [],
    this.treatmentOptions = const [],
  }) : selectedDate = selectedDate ?? DateTime.now();

  AppointmentsState copyWith({
    AppointmentsStatus? status,
    List<AppointmentListItem>? appointments,
    DateTime? selectedDate,
    int? page,
    int? pageSize,
    int? totalPages,
    int? totalCount,
    StatusCounts? statusCounts,
    String? error,
    int? Function()? staffFilter,
    int? Function()? treatmentFilter,
    String? Function()? statusFilter,
    String? customerSearch,
    List<FilterOption>? staffOptions,
    List<FilterOption>? treatmentOptions,
  }) {
    return AppointmentsState(
      status: status ?? this.status,
      appointments: appointments ?? this.appointments,
      selectedDate: selectedDate ?? this.selectedDate,
      page: page ?? this.page,
      pageSize: pageSize ?? this.pageSize,
      totalPages: totalPages ?? this.totalPages,
      totalCount: totalCount ?? this.totalCount,
      statusCounts: statusCounts ?? this.statusCounts,
      error: error ?? this.error,
      staffFilter: staffFilter != null ? staffFilter() : this.staffFilter,
      treatmentFilter:
          treatmentFilter != null ? treatmentFilter() : this.treatmentFilter,
      statusFilter:
          statusFilter != null ? statusFilter() : this.statusFilter,
      customerSearch: customerSearch ?? this.customerSearch,
      staffOptions: staffOptions ?? this.staffOptions,
      treatmentOptions: treatmentOptions ?? this.treatmentOptions,
    );
  }

  /// Range text for pagination: "Gosterilen 1-20 / 100 sonuc"
  String get paginationRangeText {
    if (totalCount == 0) return 'Sonuc bulunamadi';
    final start = (page - 1) * pageSize + 1;
    final end = (start + appointments.length - 1).clamp(start, totalCount);
    return 'Gosterilen $start-$end / $totalCount sonuc';
  }

  @override
  List<Object?> get props => [
        status,
        appointments,
        selectedDate,
        page,
        pageSize,
        totalPages,
        totalCount,
        statusCounts,
        error,
        staffFilter,
        treatmentFilter,
        statusFilter,
        customerSearch,
        staffOptions,
        treatmentOptions,
      ];
}
