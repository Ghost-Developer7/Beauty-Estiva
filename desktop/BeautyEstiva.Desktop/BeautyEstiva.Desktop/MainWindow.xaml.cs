using System.Windows;
using System.Windows.Controls;
using BeautyEstiva.Desktop.ViewModels;

namespace BeautyEstiva.Desktop;

public partial class MainWindow : Window
{
    private readonly MainViewModel _viewModel;

    public MainWindow(MainViewModel viewModel)
    {
        InitializeComponent();
        _viewModel = viewModel;
        DataContext = _viewModel;
    }

    private void NavButton_Click(object sender, RoutedEventArgs e)
    {
        if (sender is Button btn && btn.Tag is string page)
        {
            _viewModel.NavigateToCommand.Execute(page);
        }
    }
}
