using System.Windows;
using Microsoft.Extensions.DependencyInjection;
using BeautyEstiva.Desktop.Navigation;
using BeautyEstiva.Desktop.Services;
using BeautyEstiva.Desktop.ViewModels;

namespace BeautyEstiva.Desktop;

public partial class App : Application
{
    public static IServiceProvider Services { get; private set; } = null!;

    private const string DefaultApiBaseUrl = "https://test.mehmetkara.xyz/api/";

    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        var services = new ServiceCollection();
        ConfigureServices(services);
        Services = services.BuildServiceProvider();

        var mainWindow = Services.GetRequiredService<MainWindow>();
        mainWindow.Show();
    }

    private static void ConfigureServices(IServiceCollection services)
    {
        // Token storage (DPAPI)
        services.AddSingleton<ITokenStorageService, TokenStorageService>();

        // HTTP Client
        services.AddHttpClient<IApiService, ApiService>(client =>
        {
            client.BaseAddress = new Uri(DefaultApiBaseUrl);
            client.Timeout = TimeSpan.FromSeconds(30);
            client.DefaultRequestHeaders.Add("Accept", "application/json");
        });

        // Business services
        services.AddTransient<IAuthService, AuthService>();
        services.AddTransient<ICustomerService, CustomerService>();
        services.AddTransient<IAppointmentService, AppointmentService>();
        services.AddTransient<ITreatmentService, TreatmentService>();
        services.AddTransient<IStaffService, StaffService>();
        services.AddTransient<IDashboardService, DashboardService>();
        services.AddTransient<IBranchService, BranchService>();

        // Navigation
        services.AddSingleton<INavigationService, NavigationService>();

        // ViewModels
        services.AddTransient<LoginViewModel>();
        services.AddTransient<DashboardViewModel>();
        services.AddTransient<CustomersViewModel>();
        services.AddTransient<AppointmentsViewModel>();
        services.AddTransient<TreatmentsViewModel>();
        services.AddTransient<StaffViewModel>();
        services.AddTransient<SettingsViewModel>();
        services.AddSingleton<MainViewModel>();

        // Main window
        services.AddSingleton<MainWindow>();
    }

    public static void ChangeLanguage(string cultureCode)
    {
        var dict = new ResourceDictionary
        {
            Source = new Uri($"Resources/Languages/{cultureCode}.xaml", UriKind.Relative)
        };

        var existing = Current.Resources.MergedDictionaries
            .FirstOrDefault(d => d.Source?.OriginalString.Contains("Languages/") == true);

        if (existing != null)
            Current.Resources.MergedDictionaries.Remove(existing);

        Current.Resources.MergedDictionaries.Add(dict);
    }

    public static void ChangeTheme(bool isDark)
    {
        var bundledTheme = Current.Resources.MergedDictionaries
            .OfType<MaterialDesignThemes.Wpf.BundledTheme>()
            .FirstOrDefault();

        if (bundledTheme != null)
        {
            bundledTheme.BaseTheme = isDark
                ? MaterialDesignThemes.Wpf.BaseTheme.Dark
                : MaterialDesignThemes.Wpf.BaseTheme.Light;
        }
    }
}
