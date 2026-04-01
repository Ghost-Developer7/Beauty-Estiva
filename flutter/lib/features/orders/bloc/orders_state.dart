import 'package:equatable/equatable.dart';
import '../../../core/models/payment_models.dart';

enum OrdersStatus { initial, loading, loaded, error }

class OrdersState extends Equatable {
  final OrdersStatus status;
  final List<PaymentListItem> payments;
  final int page;
  final int totalPages;
  final int totalCount;
  final String? startDate;
  final String? endDate;
  final int? staffFilter;
  final String search;
  final String? error;

  // Computed KPI values
  final double totalRevenue;
  final double avgPayment;
  final String topMethod;
  final int topMethodCount;

  const OrdersState({
    this.status = OrdersStatus.initial,
    this.payments = const [],
    this.page = 1,
    this.totalPages = 1,
    this.totalCount = 0,
    this.startDate,
    this.endDate,
    this.staffFilter,
    this.search = '',
    this.error,
    this.totalRevenue = 0,
    this.avgPayment = 0,
    this.topMethod = '-',
    this.topMethodCount = 0,
  });

  OrdersState copyWith({
    OrdersStatus? status,
    List<PaymentListItem>? payments,
    int? page,
    int? totalPages,
    int? totalCount,
    String? startDate,
    String? endDate,
    int? staffFilter,
    String? search,
    String? error,
    double? totalRevenue,
    double? avgPayment,
    String? topMethod,
    int? topMethodCount,
    bool clearStartDate = false,
    bool clearEndDate = false,
    bool clearStaffFilter = false,
  }) {
    return OrdersState(
      status: status ?? this.status,
      payments: payments ?? this.payments,
      page: page ?? this.page,
      totalPages: totalPages ?? this.totalPages,
      totalCount: totalCount ?? this.totalCount,
      startDate: clearStartDate ? null : (startDate ?? this.startDate),
      endDate: clearEndDate ? null : (endDate ?? this.endDate),
      staffFilter: clearStaffFilter ? null : (staffFilter ?? this.staffFilter),
      search: search ?? this.search,
      error: error ?? this.error,
      totalRevenue: totalRevenue ?? this.totalRevenue,
      avgPayment: avgPayment ?? this.avgPayment,
      topMethod: topMethod ?? this.topMethod,
      topMethodCount: topMethodCount ?? this.topMethodCount,
    );
  }

  @override
  List<Object?> get props => [
        status,
        payments,
        page,
        totalPages,
        totalCount,
        startDate,
        endDate,
        staffFilter,
        search,
        error,
        totalRevenue,
        avgPayment,
        topMethod,
        topMethodCount,
      ];
}
