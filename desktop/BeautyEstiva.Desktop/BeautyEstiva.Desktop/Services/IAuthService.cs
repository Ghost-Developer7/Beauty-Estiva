using BeautyEstiva.Desktop.Models;

namespace BeautyEstiva.Desktop.Services;

public interface IAuthService
{
    Task<ApiResponse<LoginResult>> LoginAsync(LoginRequest request);
    AuthUser? CurrentUser { get; }
    bool IsAuthenticated { get; }
    void Logout();
    bool TryRestoreSession();
    event Action? AuthStateChanged;
}
