import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/services/api_service.dart';
import '../../../core/models/api_response.dart';
import '../../../core/models/payment_models.dart';
import '../../../core/constants/api_endpoints.dart';
import 'orders_state.dart';

class OrdersCubit extends Cubit<OrdersState> {
  final ApiService _api;

  OrdersCubit({ApiService? api})
      : _api = api ?? ApiService(),
        super(const OrdersState());

  Future<void> load() async {
    emit(state.copyWith(status: OrdersStatus.loading));

    final params = <String, dynamic>{
      'pageNumber': state.page,
      'pageSize': 20,
    };
    if (state.startDate != null) params['startDate'] = state.startDate;
    if (state.endDate != null) params['endDate'] = state.endDate;
    if (state.staffFilter != null) params['staffId'] = state.staffFilter;
    if (state.search.isNotEmpty) params['search'] = state.search;

    final res = await _api.get(
      ApiEndpoints.payments,
      queryParameters: params,
      fromData: (d) =>
          PaginatedResponse.fromJson(d, PaymentListItem.fromJson),
    );

    if (res.success && res.data != null) {
      final items = res.data!.items;

      // Compute KPI values
      double totalRev = 0;
      final methodCounts = <String, int>{};
      for (final p in items) {
        totalRev += p.amountInTry;
        methodCounts[p.paymentMethodDisplay] =
            (methodCounts[p.paymentMethodDisplay] ?? 0) + 1;
      }

      String topMethod = '-';
      int topCount = 0;
      methodCounts.forEach((key, value) {
        if (value > topCount) {
          topCount = value;
          topMethod = key;
        }
      });

      emit(state.copyWith(
        status: OrdersStatus.loaded,
        payments: items,
        totalPages: res.data!.totalPages,
        totalCount: res.data!.totalCount,
        totalRevenue: totalRev,
        avgPayment: items.isNotEmpty ? totalRev / items.length : 0,
        topMethod: topMethod,
        topMethodCount: topCount,
      ));
    } else {
      emit(state.copyWith(
        status: OrdersStatus.error,
        error: res.error?.message ?? 'Veriler yüklenemedi',
      ));
    }
  }

  void setDateRange(String? start, String? end) {
    emit(state.copyWith(
      startDate: start,
      endDate: end,
      page: 1,
      clearStartDate: start == null,
      clearEndDate: end == null,
    ));
    load();
  }

  void setStaffFilter(int? staffId) {
    emit(state.copyWith(
      staffFilter: staffId,
      page: 1,
      clearStaffFilter: staffId == null,
    ));
    load();
  }

  void setSearch(String value) {
    emit(state.copyWith(search: value, page: 1));
    load();
  }

  void setPage(int page) {
    emit(state.copyWith(page: page));
    load();
  }

  Future<bool> createPayment(PaymentCreate data) async {
    final res = await _api.post(ApiEndpoints.payments, data: data.toJson());
    if (res.success) {
      load();
      return true;
    }
    return false;
  }

  Future<void> deletePayment(int id) async {
    await _api.delete(ApiEndpoints.paymentById(id));
    load();
  }
}
