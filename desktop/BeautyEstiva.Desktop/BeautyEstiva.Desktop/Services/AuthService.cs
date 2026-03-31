using BeautyEstiva.Desktop.Helpers;
using BeautyEstiva.Desktop.Models;

namespace BeautyEstiva.Desktop.Services;

public class AuthService : IAuthService
{
    private readonly IApiService _apiService;
    private readonly ITokenStorageService _tokenStorage;

    public AuthUser? CurrentUser { get; private set; }
    public bool IsAuthenticated => CurrentUser != null;
    public event Action? AuthStateChanged;

    public AuthService(IApiService apiService, ITokenStorageService tokenStorage)
    {
        _apiService = apiService;
        _tokenStorage = tokenStorage;
    }

    public async Task<ApiResponse<LoginResult>> LoginAsync(LoginRequest request)
    {
        var response = await _apiService.PostAsync<LoginResult>("/auth/login", request);

        if (response.Success && response.Data != null)
        {
            var result = response.Data;
            _apiService.SetToken(result.Token);

            var payload = JwtHelper.DecodeToken(result.Token);
            CurrentUser = new AuthUser
            {
                Id = payload?.Sub ?? "",
                TenantId = payload?.TenantId ?? "",
                Name = result.Name,
                Surname = result.Surname,
                Email = result.Email,
                Roles = result.Roles
            };

            AuthStateChanged?.Invoke();
        }

        return response;
    }

    public void Logout()
    {
        _apiService.SetToken(null);
        CurrentUser = null;
        AuthStateChanged?.Invoke();
    }

    public bool TryRestoreSession()
    {
        var token = _tokenStorage.GetToken();
        if (string.IsNullOrEmpty(token))
            return false;

        if (JwtHelper.IsTokenExpired(token))
        {
            _tokenStorage.ClearToken();
            return false;
        }

        var payload = JwtHelper.DecodeToken(token);
        if (payload == null)
        {
            _tokenStorage.ClearToken();
            return false;
        }

        _apiService.SetToken(token);

        var roles = JwtHelper.ExtractRoles(payload);
        CurrentUser = new AuthUser
        {
            Id = payload.Sub,
            TenantId = payload.TenantId,
            Name = payload.UniqueName,
            Email = payload.Email,
            Roles = roles
        };

        AuthStateChanged?.Invoke();
        return true;
    }
}
