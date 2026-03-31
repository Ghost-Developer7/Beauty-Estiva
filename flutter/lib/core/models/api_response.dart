class ApiResponse<T> {
  final bool success;
  final T? data;
  final ApiError? error;
  final String? message;

  ApiResponse({required this.success, this.data, this.error, this.message});

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic)? fromData,
  ) {
    return ApiResponse(
      success: json['success'] ?? false,
      data: json['data'] != null && fromData != null
          ? fromData(json['data'])
          : null,
      error: json['error'] != null ? ApiError.fromJson(json['error']) : null,
      message: json['message'],
    );
  }
}

class ApiError {
  final String errorCode;
  final String message;

  ApiError({required this.errorCode, required this.message});

  factory ApiError.fromJson(Map<String, dynamic> json) {
    return ApiError(
      errorCode: json['errorCode'] ?? '',
      message: json['message'] ?? '',
    );
  }
}

class PaginatedResponse<T> {
  final List<T> items;
  final int totalCount;
  final int pageNumber;
  final int pageSize;
  final int totalPages;
  final bool hasNextPage;
  final bool hasPreviousPage;

  PaginatedResponse({
    required this.items,
    required this.totalCount,
    required this.pageNumber,
    required this.pageSize,
    required this.totalPages,
    required this.hasNextPage,
    required this.hasPreviousPage,
  });

  factory PaginatedResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) fromItem,
  ) {
    return PaginatedResponse(
      items: (json['items'] as List? ?? [])
          .map((e) => fromItem(e as Map<String, dynamic>))
          .toList(),
      totalCount: json['totalCount'] ?? 0,
      pageNumber: json['pageNumber'] ?? 1,
      pageSize: json['pageSize'] ?? 20,
      totalPages: json['totalPages'] ?? 1,
      hasNextPage: json['hasNextPage'] ?? false,
      hasPreviousPage: json['hasPreviousPage'] ?? false,
    );
  }
}
