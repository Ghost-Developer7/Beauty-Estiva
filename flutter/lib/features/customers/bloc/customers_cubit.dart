import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/api_response.dart';
import '../../../core/models/customer_models.dart';
import '../../../core/constants/api_endpoints.dart';
import 'customers_state.dart';

class CustomersCubit extends Cubit<CustomersState> {
  final ApiService _api;

  CustomersCubit({ApiService? api})
      : _api = api ?? ApiService(),
        super(const CustomersState());

  Future<void> load() async {
    emit(state.copyWith(status: CustomersStatus.loading));

    final params = <String, dynamic>{
      'pageNumber': state.page,
      'pageSize': 20,
    };
    if (state.search.isNotEmpty) params['search'] = state.search;

    final res = await _api.get(
      ApiEndpoints.customers,
      queryParameters: params,
      fromData: (d) =>
          PaginatedResponse.fromJson(d, CustomerListItem.fromJson),
    );

    if (res.success && res.data != null) {
      final items = res.data!.items;
      final totalCount = res.data!.totalCount;

      // Compute KPIs from the current page data
      final vipCount =
          items.where((c) => c.segment.toLowerCase() == 'vip').length;
      final totalRevenue =
          items.fold<double>(0, (sum, c) => sum + c.totalSpent);
      final avgSpend = items.isNotEmpty ? totalRevenue / items.length : 0.0;

      emit(state.copyWith(
        status: CustomersStatus.loaded,
        customers: items,
        totalPages: res.data!.totalPages,
        totalCount: totalCount,
        totalCustomerCount: totalCount,
        vipCount: vipCount,
        totalRevenue: totalRevenue,
        avgSpend: avgSpend,
      ));
    } else {
      emit(state.copyWith(
        status: CustomersStatus.error,
        error: res.error?.message ?? 'Veriler yüklenemedi',
      ));
    }
  }

  void setSearch(String value) {
    emit(state.copyWith(search: value, page: 1));
    load();
  }

  void setPage(int page) {
    emit(state.copyWith(page: page));
    load();
  }

  Future<void> deleteCustomer(int id) async {
    await _api.delete(ApiEndpoints.customerById(id));
    load();
  }
}
