using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using BeautyEstiva.Desktop.Models;
using BeautyEstiva.Desktop.Services;
using System.Collections.ObjectModel;

namespace BeautyEstiva.Desktop.ViewModels;

public partial class TreatmentsViewModel : ObservableObject
{
    private readonly ITreatmentService _treatmentService;

    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private string? _errorMessage;
    [ObservableProperty] private int _currentPage = 1;
    [ObservableProperty] private int _totalPages = 1;

    // Dialog
    [ObservableProperty] private bool _isDialogOpen;
    [ObservableProperty] private bool _isEditing;
    [ObservableProperty] private int _editingId;
    [ObservableProperty] private string _formName = string.Empty;
    [ObservableProperty] private string _formDescription = string.Empty;
    [ObservableProperty] private int _formDuration = 30;
    [ObservableProperty] private decimal _formPrice;

    public ObservableCollection<TreatmentListItem> Treatments { get; } = [];

    public TreatmentsViewModel(ITreatmentService treatmentService)
    {
        _treatmentService = treatmentService;
    }

    [RelayCommand]
    public async Task LoadDataAsync()
    {
        IsLoading = true;
        ErrorMessage = null;

        try
        {
            var response = await _treatmentService.ListPaginatedAsync(CurrentPage, 20);
            if (response.Success && response.Data != null)
            {
                Treatments.Clear();
                foreach (var t in response.Data.Items)
                    Treatments.Add(t);
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
    private void OpenAddDialog()
    {
        IsEditing = false;
        EditingId = 0;
        FormName = string.Empty;
        FormDescription = string.Empty;
        FormDuration = 30;
        FormPrice = 0;
        IsDialogOpen = true;
    }

    [RelayCommand]
    private void OpenEditDialog(TreatmentListItem treatment)
    {
        IsEditing = true;
        EditingId = treatment.Id;
        FormName = treatment.Name;
        FormDescription = treatment.Description ?? string.Empty;
        FormDuration = treatment.DurationMinutes;
        FormPrice = treatment.Price ?? 0;
        IsDialogOpen = true;
    }

    [RelayCommand]
    private async Task SaveAsync()
    {
        if (string.IsNullOrWhiteSpace(FormName))
        {
            ErrorMessage = "Hizmet adı gereklidir";
            return;
        }

        IsLoading = true;
        var data = new TreatmentCreate
        {
            Name = FormName.Trim(),
            Description = string.IsNullOrWhiteSpace(FormDescription) ? null : FormDescription.Trim(),
            DurationMinutes = FormDuration,
            Price = FormPrice
        };

        try
        {
            var response = IsEditing
                ? await _treatmentService.UpdateAsync(EditingId, data)
                : await _treatmentService.CreateAsync(data);

            if (response.Success)
            {
                IsDialogOpen = false;
                await LoadDataAsync();
            }
            else ErrorMessage = response.Error?.Message;
        }
        catch (Exception ex) { ErrorMessage = ex.Message; }
        finally { IsLoading = false; }
    }

    [RelayCommand]
    private async Task DeleteAsync(TreatmentListItem treatment)
    {
        IsLoading = true;
        try
        {
            var r = await _treatmentService.DeleteAsync(treatment.Id);
            if (r.Success) await LoadDataAsync();
            else ErrorMessage = r.Error?.Message;
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

    [RelayCommand]
    private void CloseDialog() => IsDialogOpen = false;
}
