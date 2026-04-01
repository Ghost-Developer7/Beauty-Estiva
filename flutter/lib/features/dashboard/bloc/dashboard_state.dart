import 'package:equatable/equatable.dart';
import '../../../core/models/dashboard_models.dart';

enum DashboardStatus { initial, loading, loaded, error }

class DashboardState extends Equatable {
  final DashboardStatus status;
  final DashboardSummary? data;
  final String? error;

  const DashboardState({
    this.status = DashboardStatus.initial,
    this.data,
    this.error,
  });

  DashboardState copyWith({
    DashboardStatus? status,
    DashboardSummary? data,
    String? error,
  }) {
    return DashboardState(
      status: status ?? this.status,
      data: data ?? this.data,
      error: error ?? this.error,
    );
  }

  @override
  List<Object?> get props => [status, data, error];
}
