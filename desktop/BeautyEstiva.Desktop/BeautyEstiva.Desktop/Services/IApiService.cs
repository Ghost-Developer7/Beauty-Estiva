using BeautyEstiva.Desktop.Models;

namespace BeautyEstiva.Desktop.Services;

public interface IApiService
{
    Task<ApiResponse<T>> GetAsync<T>(string endpoint, Dictionary<string, string?>? queryParams = null);
    Task<ApiResponse<T>> PostAsync<T>(string endpoint, object? body = null);
    Task<ApiResponse<T>> PutAsync<T>(string endpoint, object? body = null);
    Task<ApiResponse<T>> PatchAsync<T>(string endpoint, object? body = null);
    Task<ApiResponse<T>> DeleteAsync<T>(string endpoint);
    void SetToken(string? token);
    bool IsAuthenticated { get; }
}
