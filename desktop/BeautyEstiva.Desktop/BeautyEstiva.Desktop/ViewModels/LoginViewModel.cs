using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using BeautyEstiva.Desktop.Models;
using BeautyEstiva.Desktop.Services;

namespace BeautyEstiva.Desktop.ViewModels;

public partial class LoginViewModel : ObservableObject
{
    private readonly IAuthService _authService;

    [ObservableProperty] private string _email = string.Empty;
    [ObservableProperty] private string _password = string.Empty;
    [ObservableProperty] private string? _errorMessage;
    [ObservableProperty] private bool _isLoading;

    public event Action? LoginSucceeded;

    public LoginViewModel(IAuthService authService)
    {
        _authService = authService;
    }

    [RelayCommand]
    private async Task LoginAsync()
    {
        if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(Password))
        {
            ErrorMessage = "E-posta ve şifre gereklidir";
            return;
        }

        IsLoading = true;
        ErrorMessage = null;

        try
        {
            var result = await _authService.LoginAsync(new LoginRequest
            {
                EmailOrUsername = Email.Trim(),
                Password = Password
            });

            if (result.Success)
            {
                LoginSucceeded?.Invoke();
            }
            else
            {
                ErrorMessage = result.Error?.Message ?? "Giriş başarısız";
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Bağlantı hatası: {ex.Message}";
        }
        finally
        {
            IsLoading = false;
        }
    }
}
