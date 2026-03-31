using CommunityToolkit.Mvvm.ComponentModel;

namespace BeautyEstiva.Desktop.Navigation;

public interface INavigationService
{
    ObservableObject CurrentView { get; }
    void NavigateTo<TViewModel>() where TViewModel : ObservableObject;
    event Action? CurrentViewChanged;
}
