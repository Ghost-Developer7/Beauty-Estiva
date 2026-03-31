using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using BeautyEstiva.Desktop.Navigation;
using BeautyEstiva.Desktop.Services;

namespace BeautyEstiva.Desktop.ViewModels;

public partial class MainViewModel : ObservableObject
{
    private readonly INavigationService _navigation;
    private readonly IAuthService _authService;

    [ObservableProperty] private ObservableObject? _currentView;
    [ObservableProperty] private bool _isLoggedIn;
    [ObservableProperty] private string _userName = string.Empty;
    [ObservableProperty] private string _userRoles = string.Empty;
    [ObservableProperty] private string _userInitials = "?";
    [ObservableProperty] private string _selectedMenuItem = "Dashboard";

    public MainViewModel(INavigationService navigation, IAuthService authService)
    {
        _navigation = navigation;
        _authService = authService;

        _navigation.CurrentViewChanged += () =>
        {
            CurrentView = _navigation.CurrentView;
        };

        _authService.AuthStateChanged += OnAuthStateChanged;

        // Try restore session
        if (_authService.TryRestoreSession())
        {
            OnAuthStateChanged();
            NavigateTo("Dashboard");
        }
        else
        {
            ShowLogin();
        }
    }

    private void OnAuthStateChanged()
    {
        IsLoggedIn = _authService.IsAuthenticated;
        if (_authService.CurrentUser != null)
        {
            var u = _authService.CurrentUser;
            UserName = u.FullName;
            UserRoles = string.Join(", ", u.Roles);
            UserInitials = $"{(u.Name.Length > 0 ? u.Name[0] : '?')}{(u.Surname.Length > 0 ? u.Surname[0] : '?')}";
        }
    }

    public void ShowLogin()
    {
        _navigation.NavigateTo<LoginViewModel>();
        if (_navigation.CurrentView is LoginViewModel loginVm)
        {
            loginVm.LoginSucceeded += () =>
            {
                OnAuthStateChanged();
                NavigateTo("Dashboard");
            };
        }
        CurrentView = _navigation.CurrentView;
    }

    [RelayCommand]
    private void NavigateTo(string page)
    {
        SelectedMenuItem = page;
        switch (page)
        {
            case "Dashboard":
                _navigation.NavigateTo<DashboardViewModel>();
                if (_navigation.CurrentView is DashboardViewModel dashVm)
                    _ = dashVm.LoadDataCommand.ExecuteAsync(null);
                break;
            case "Customers":
                _navigation.NavigateTo<CustomersViewModel>();
                if (_navigation.CurrentView is CustomersViewModel custVm)
                    _ = custVm.LoadDataCommand.ExecuteAsync(null);
                break;
            case "Appointments":
                _navigation.NavigateTo<AppointmentsViewModel>();
                if (_navigation.CurrentView is AppointmentsViewModel apptVm)
                    _ = apptVm.LoadDataCommand.ExecuteAsync(null);
                break;
            case "Treatments":
                _navigation.NavigateTo<TreatmentsViewModel>();
                if (_navigation.CurrentView is TreatmentsViewModel treatVm)
                    _ = treatVm.LoadDataCommand.ExecuteAsync(null);
                break;
            case "Staff":
                _navigation.NavigateTo<StaffViewModel>();
                if (_navigation.CurrentView is StaffViewModel staffVm)
                    _ = staffVm.LoadDataCommand.ExecuteAsync(null);
                break;
            case "Settings":
                _navigation.NavigateTo<SettingsViewModel>();
                break;
        }
        CurrentView = _navigation.CurrentView;
    }

    [RelayCommand]
    private void Logout()
    {
        _authService.Logout();
        IsLoggedIn = false;
        ShowLogin();
    }
}
