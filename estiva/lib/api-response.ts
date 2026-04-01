import { NextResponse } from "next/server";

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { errorCode: string; message: string } | null;
  message: string | null;
}

export function success<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    error: null,
    message: message ?? null,
  });
}

export function fail(message: string, errorCode: string = "ERROR", status: number = 400): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      success: false,
      data: null,
      error: { errorCode, message },
      message,
    },
    { status }
  );
}

export function unauthorized(message: string = "Yetkisiz erişim"): NextResponse<ApiResponse<null>> {
  return fail(message, "UNAUTHORIZED", 401);
}

export function forbidden(message: string = "Bu işlem için yetkiniz yok"): NextResponse<ApiResponse<null>> {
  return fail(message, "FORBIDDEN", 403);
}

export function notFound(message: string = "Kayıt bulunamadı"): NextResponse<ApiResponse<null>> {
  return fail(message, "NOT_FOUND", 404);
}

export function serverError(message: string = "Sunucu hatası oluştu"): NextResponse<ApiResponse<null>> {
  return fail(message, "SERVER_ERROR", 500);
}
