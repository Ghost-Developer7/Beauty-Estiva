using System.Text.Json.Serialization;

namespace BeautyEstiva.Desktop.Models;

public class LoginRequest
{
    [JsonPropertyName("emailOrUsername")]
    public string EmailOrUsername { get; set; } = string.Empty;

    [JsonPropertyName("password")]
    public string Password { get; set; } = string.Empty;
}

public class LoginResult
{
    [JsonPropertyName("token")]
    public string Token { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("surname")]
    public string Surname { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("roles")]
    public List<string> Roles { get; set; } = [];
}

public class JwtPayload
{
    [JsonPropertyName("sub")]
    public string Sub { get; set; } = string.Empty;

    [JsonPropertyName("tenantId")]
    public string TenantId { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("unique_name")]
    public string UniqueName { get; set; } = string.Empty;

    [JsonPropertyName("role")]
    public object? Role { get; set; }

    [JsonPropertyName("exp")]
    public long Exp { get; set; }
}

public class AuthUser
{
    public string Id { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = [];

    public string FullName => $"{Name} {Surname}".Trim();
    public bool IsOwner => Roles.Contains("Owner");
    public bool IsAdmin => Roles.Contains("Admin") || IsOwner;
}
