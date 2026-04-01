import 'package:equatable/equatable.dart';
import '../../../core/models/customer_models.dart';

enum CustomersStatus { initial, loading, loaded, error }

class CustomersState extends Equatable {
  final CustomersStatus status;
  final List<CustomerListItem> customers;
  final int page;
  final int totalPages;
  final int totalCount;
  final String search;
  final String? error;

  // KPI values
  final int totalCustomerCount;
  final int vipCount;
  final double totalRevenue;
  final double avgSpend;

  const CustomersState({
    this.status = CustomersStatus.initial,
    this.customers = const [],
    this.page = 1,
    this.totalPages = 1,
    this.totalCount = 0,
    this.search = '',
    this.error,
    this.totalCustomerCount = 0,
    this.vipCount = 0,
    this.totalRevenue = 0,
    this.avgSpend = 0,
  });

  CustomersState copyWith({
    CustomersStatus? status,
    List<CustomerListItem>? customers,
    int? page,
    int? totalPages,
    int? totalCount,
    String? search,
    String? error,
    int? totalCustomerCount,
    int? vipCount,
    double? totalRevenue,
    double? avgSpend,
  }) {
    return CustomersState(
      status: status ?? this.status,
      customers: customers ?? this.customers,
      page: page ?? this.page,
      totalPages: totalPages ?? this.totalPages,
      totalCount: totalCount ?? this.totalCount,
      search: search ?? this.search,
      error: error ?? this.error,
      totalCustomerCount: totalCustomerCount ?? this.totalCustomerCount,
      vipCount: vipCount ?? this.vipCount,
      totalRevenue: totalRevenue ?? this.totalRevenue,
      avgSpend: avgSpend ?? this.avgSpend,
    );
  }

  @override
  List<Object?> get props => [
        status,
        customers,
        page,
        totalPages,
        totalCount,
        search,
        error,
        totalCustomerCount,
        vipCount,
        totalRevenue,
        avgSpend,
      ];
}
