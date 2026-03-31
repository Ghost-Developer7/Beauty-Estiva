using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using BeautyEstiva.Desktop.Models;

namespace BeautyEstiva.Desktop.Services;

public class ApiService : IApiService
{
    private readonly HttpClient _httpClient;
    private readonly ITokenStorageService _tokenStorage;
    private string? _token;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public ApiService(HttpClient httpClient, ITokenStorageService tokenStorage)
    {
        _httpClient = httpClient;
        _tokenStorage = tokenStorage;
        _token = tokenStorage.GetToken();
        ApplyAuthHeader();
    }

    public bool IsAuthenticated => !string.IsNullOrEmpty(_token);

    public void SetToken(string? token)
    {
        _token = token;
        if (token != null)
            _tokenStorage.SaveToken(token);
        else
            _tokenStorage.ClearToken();
        ApplyAuthHeader();
    }

    private void ApplyAuthHeader()
    {
        _httpClient.DefaultRequestHeaders.Authorization = !string.IsNullOrEmpty(_token)
            ? new AuthenticationHeaderValue("Bearer", _token)
            : null;
    }

    public async Task<ApiResponse<T>> GetAsync<T>(string endpoint, Dictionary<string, string?>? queryParams = null)
    {
        var url = BuildUrl(endpoint, queryParams);
        return await SendAsync<T>(() => _httpClient.GetAsync(url));
    }

    public async Task<ApiResponse<T>> PostAsync<T>(string endpoint, object? body = null)
    {
        return await SendAsync<T>(() =>
            _httpClient.PostAsJsonAsync(NormalizeEndpoint(endpoint), body, JsonOptions));
    }

    public async Task<ApiResponse<T>> PutAsync<T>(string endpoint, object? body = null)
    {
        return await SendAsync<T>(() =>
            _httpClient.PutAsJsonAsync(NormalizeEndpoint(endpoint), body, JsonOptions));
    }

    public async Task<ApiResponse<T>> PatchAsync<T>(string endpoint, object? body = null)
    {
        var content = JsonContent.Create(body, options: JsonOptions);
        return await SendAsync<T>(() =>
            _httpClient.PatchAsync(NormalizeEndpoint(endpoint), content));
    }

    public async Task<ApiResponse<T>> DeleteAsync<T>(string endpoint)
    {
        return await SendAsync<T>(() => _httpClient.DeleteAsync(NormalizeEndpoint(endpoint)));
    }

    private async Task<ApiResponse<T>> SendAsync<T>(Func<Task<HttpResponseMessage>> requestFunc)
    {
        try
        {
            var response = await requestFunc();

            if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
            {
                SetToken(null);
                return new ApiResponse<T>
                {
                    Success = false,
                    Error = new ApiError { ErrorCode = "UNAUTHORIZED", Message = "Oturum süresi doldu" }
                };
            }

            var content = await response.Content.ReadAsStringAsync();

            if (string.IsNullOrWhiteSpace(content))
            {
                return new ApiResponse<T>
                {
                    Success = response.IsSuccessStatusCode,
                    Error = response.IsSuccessStatusCode ? null : new ApiError
                    {
                        ErrorCode = response.StatusCode.ToString(),
                        Message = "Sunucu boş yanıt döndü"
                    }
                };
            }

            var result = JsonSerializer.Deserialize<ApiResponse<T>>(content, JsonOptions);
            return result ?? new ApiResponse<T>
            {
                Success = false,
                Error = new ApiError { ErrorCode = "PARSE_ERROR", Message = "Yanıt ayrıştırılamadı" }
            };
        }
        catch (HttpRequestException ex)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Error = new ApiError { ErrorCode = "NETWORK_ERROR", Message = $"Sunucuya bağlanılamadı: {ex.Message}" }
            };
        }
        catch (TaskCanceledException)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Error = new ApiError { ErrorCode = "TIMEOUT", Message = "İstek zaman aşımına uğradı" }
            };
        }
        catch (Exception ex)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Error = new ApiError { ErrorCode = "UNKNOWN", Message = ex.Message }
            };
        }
    }

    /// <summary>
    /// Strips leading '/' from endpoint so HttpClient resolves it relative to BaseAddress.
    /// e.g. BaseAddress = "https://host/api/" + endpoint "auth/login" = "https://host/api/auth/login"
    /// Without this, "/auth/login" would resolve to "https://host/auth/login" (skipping /api).
    /// </summary>
    private static string NormalizeEndpoint(string endpoint)
        => endpoint.TrimStart('/');

    private static string BuildUrl(string endpoint, Dictionary<string, string?>? queryParams)
    {
        var normalized = NormalizeEndpoint(endpoint);
        if (queryParams == null || queryParams.Count == 0)
            return normalized;

        var validParams = queryParams
            .Where(kv => !string.IsNullOrEmpty(kv.Value))
            .Select(kv => $"{Uri.EscapeDataString(kv.Key)}={Uri.EscapeDataString(kv.Value!)}");

        return $"{normalized}?{string.Join("&", validParams)}";
    }
}
