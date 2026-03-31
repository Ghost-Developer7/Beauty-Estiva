using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using BeautyEstiva.Desktop.Models;
using BeautyEstiva.Desktop.Services;
using System.Collections.ObjectModel;

namespace BeautyEstiva.Desktop.ViewModels;

public partial class StaffViewModel : ObservableObject
{
    private readonly IStaffService _staffService;

    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private string? _errorMessage;
    [ObservableProperty] private int _currentPage = 1;
    [ObservableProperty] private int _totalPages = 1;

    public ObservableCollection<StaffMember> StaffMembers { get; } = [];

    public StaffViewModel(IStaffService staffService)
    {
        _staffService = staffService;
    }

    [RelayCommand]
    public async Task LoadDataAsync()
    {
        IsLoading = true;
        ErrorMessage = null;

        try
        {
            var response = await _staffService.ListPaginatedAsync(CurrentPage, 20);
            if (response.Success && response.Data != null)
            {
                StaffMembers.Clear();
                foreach (var s in response.Data.Items)
                    StaffMembers.Add(s);
                TotalPages = Math.Max(1, response.Data.TotalPages);
            }
            else
            {
                ErrorMessage = response.Error?.Message;
            }
        }
        catch (Exception ex) { ErrorMessage = ex.Message; }
        finally { IsLoading = false; }
    }

    [RelayCommand]
    private async Task NextPageAsync()
    {
        if (CurrentPage < TotalPages) { CurrentPage++; await LoadDataAsync(); }
    }

    [RelayCommand]
    private async Task PreviousPageAsync()
    {
        if (CurrentPage > 1) { CurrentPage--; await LoadDataAsync(); }
    }
}
