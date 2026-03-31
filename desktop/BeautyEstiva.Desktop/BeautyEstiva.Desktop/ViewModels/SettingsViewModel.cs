using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace BeautyEstiva.Desktop.ViewModels;

public partial class SettingsViewModel : ObservableObject
{
    [ObservableProperty] private bool _isDarkTheme;
    [ObservableProperty] private bool _isTurkish = true;

    [RelayCommand]
    private void ToggleTheme()
    {
        IsDarkTheme = !IsDarkTheme;
        App.ChangeTheme(IsDarkTheme);
    }

    [RelayCommand]
    private void ChangeLanguage(string lang)
    {
        IsTurkish = lang == "tr";
        App.ChangeLanguage(IsTurkish ? "tr-TR" : "en-US");
    }
}
