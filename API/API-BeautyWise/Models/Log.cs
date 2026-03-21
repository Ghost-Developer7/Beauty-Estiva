using API_BeautyWise.Models;

public class Log
{
    public int Id { get; set; }
    public int LogLevel { get; set; } // Log level (e.g., "Info", "Warning", "Error", "Debug"). //ENUMS
    public string? Message { get; set; } // Log message (e.g., "User logged in", "An error occurred: ...").
    public string? Exception { get; set; } // Exception details in case of error (stack trace, error message, etc.).
    public DateTime Timestamp { get; set; } // The date and time when the log entry was created.
    public int? UserId { get; set; } // The ID of the user who created the log entry (optional).
    public AppUser? User { get; set; }
    public string? Action { get; set; } // The action related to the log (e.g., "Login", "CreateOrder").
    public string? Controller { get; set; } // The controller where the log was created.
    public string? Endpoint { get; set; } // The API endpoint where the log was created.
    public string? HttpMethod { get; set; } // HTTP method (GET, POST, PUT, DELETE, etc.).
    public int? StatusCode { get; set; } // HTTP status code (200, 404, 500, etc.).
    public string? RequestPath { get; set; } // The requested URL or route.
    public string? ClientIpAddress { get; set; } // The IP address of the client making the request.
    public long? Duration { get; set; } // How long the operation took (in milliseconds).
    public string? AdditionalInfo { get; set; } // Additional information (in JSON format or serialized data).
}