import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/api_constants.dart';
import '../models/api_response.dart';

class ApiService {
  late final Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  String? _token;

  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;

  ApiService._internal() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: ApiConstants.timeout,
      receiveTimeout: ApiConstants.timeout,
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        if (_token != null) {
          options.headers['Authorization'] = 'Bearer $_token';
        }
        handler.next(options);
      },
      onError: (error, handler) {
        if (error.response?.statusCode == 401) {
          clearToken();
        }
        handler.next(error);
      },
    ));
  }

  bool get isAuthenticated => _token != null;

  Future<void> loadToken() async {
    _token = await _storage.read(key: 'estiva_token');
  }

  Future<void> setToken(String token) async {
    _token = token;
    await _storage.write(key: 'estiva_token', value: token);
  }

  Future<void> clearToken() async {
    _token = null;
    await _storage.delete(key: 'estiva_token');
  }

  Future<ApiResponse<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    T Function(dynamic)? fromData,
  }) async {
    try {
      final response = await _dio.get(path, queryParameters: queryParameters);
      return ApiResponse.fromJson(response.data, fromData);
    } on DioException catch (e) {
      return _handleError(e);
    }
  }

  Future<ApiResponse<T>> post<T>(
    String path, {
    dynamic data,
    T Function(dynamic)? fromData,
  }) async {
    try {
      final response = await _dio.post(path, data: data);
      return ApiResponse.fromJson(response.data, fromData);
    } on DioException catch (e) {
      return _handleError(e);
    }
  }

  Future<ApiResponse<T>> put<T>(
    String path, {
    dynamic data,
    T Function(dynamic)? fromData,
  }) async {
    try {
      final response = await _dio.put(path, data: data);
      return ApiResponse.fromJson(response.data, fromData);
    } on DioException catch (e) {
      return _handleError(e);
    }
  }

  Future<ApiResponse<T>> delete<T>(
    String path, {
    T Function(dynamic)? fromData,
  }) async {
    try {
      final response = await _dio.delete(path);
      return ApiResponse.fromJson(response.data, fromData);
    } on DioException catch (e) {
      return _handleError(e);
    }
  }

  Future<ApiResponse<T>> patch<T>(
    String path, {
    dynamic data,
    T Function(dynamic)? fromData,
  }) async {
    try {
      final response = await _dio.patch(path, data: data);
      return ApiResponse.fromJson(response.data, fromData);
    } on DioException catch (e) {
      return _handleError(e);
    }
  }

  ApiResponse<T> _handleError<T>(DioException e) {
    String message;
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      message = 'Bağlantı zaman aşımına uğradı';
    } else if (e.type == DioExceptionType.connectionError) {
      message = 'Sunucuya bağlanılamadı';
    } else {
      message = e.response?.data?['error']?['message'] ?? 'Bir hata oluştu';
    }
    return ApiResponse(
      success: false,
      error: ApiError(errorCode: 'ERROR', message: message),
    );
  }
}
