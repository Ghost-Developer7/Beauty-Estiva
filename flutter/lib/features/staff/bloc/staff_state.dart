import 'package:equatable/equatable.dart';
import '../../../core/models/appointment_models.dart';

enum StaffStatus { initial, loading, loaded, error }

class StaffState extends Equatable {
  final StaffStatus status;
  final List<StaffMember> staff;
  final String search;
  final String? error;

  const StaffState({
    this.status = StaffStatus.initial,
    this.staff = const [],
    this.search = '',
    this.error,
  });

  int get totalCount => staff.length;
  int get activeCount => staff.where((s) => s.isActive).length;
  int get ownerCount => staff.where((s) => s.roles.contains('Owner')).length;
  int get adminCount => staff.where((s) => s.roles.contains('Admin')).length;

  List<StaffMember> get filteredStaff {
    if (search.isEmpty) return staff;
    final q = search.toLowerCase();
    return staff.where((s) =>
        s.fullName.toLowerCase().contains(q) ||
        s.email.toLowerCase().contains(q) ||
        (s.phone?.toLowerCase().contains(q) ?? false)).toList();
  }

  StaffState copyWith({
    StaffStatus? status,
    List<StaffMember>? staff,
    String? search,
    String? error,
  }) {
    return StaffState(
      status: status ?? this.status,
      staff: staff ?? this.staff,
      search: search ?? this.search,
      error: error ?? this.error,
    );
  }

  @override
  List<Object?> get props => [status, staff, search, error];
}
