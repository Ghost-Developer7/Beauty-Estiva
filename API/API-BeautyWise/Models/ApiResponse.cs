namespace API_BeautyWise.Models
{
    public class ApiResponse<T>
    {
        public bool Success { get; init; }
        public T? Data { get; init; }
        public ApiError? Error { get; init; }
        public string? Message { get; init; }

        public static ApiResponse<T> Ok(T data, string? message = null) => new() 
        { 
            Success = true, 
            Data = data,
            Message = message
        };

        public static ApiResponse<T> Fail(string message, string errorCode = "ERROR") => new() 
        { 
            Success = false, 
            Error = new ApiError 
            { 
                ErrorCode = errorCode, 
                Message = message 
            }
        };
    }

    public class ApiError
    {
        public string ErrorCode { get; init; } = default!;
        public string Message { get; init; } = default!;
    }
}
