namespace API_BeautyWise.DTO
{
    public class LogErrorDto
    {
        public Exception Exception { get; init; } = default!;
        public LogLevel LogLevel { get; init; } = LogLevel.Error;
        public int StatusCode { get; init; }
        public string Action { get; init; } = default!;
        public string Controller { get; init; } = default!;
        public string Endpoint { get; init; } = default!;
        public DateTime Timestamp { get; init; }
        public int? UserId { get; init; }
    }
}
