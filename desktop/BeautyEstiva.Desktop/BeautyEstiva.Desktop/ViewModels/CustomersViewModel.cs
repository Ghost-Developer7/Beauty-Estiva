using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using BeautyEstiva.Desktop.Models;
using BeautyEstiva.Desktop.Services;
using System.Collections.ObjectModel;

namespace BeautyEstiva.Desktop.ViewModels;

public partial class CustomersViewModel : ObservableObject
{
    private readonly ICustomerService _customerService;

    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private string? _errorMessage;
    [ObservableProperty] private string _searchText = string.Empty;
    [ObservableProperty] private int _currentPage = 1;
    [ObservableProperty] private int _totalPages = 1;
    [ObservableProperty] private int _totalCount;

    // Add/Edit dialog
    [ObservableProperty] private bool _isDialogOpen;
    [ObservableProperty] private bool _isEditing;
    [ObservableProperty] private int _editingId;
    [ObservableProperty] private string _formName = string.Empty;
    [ObservableProperty] private string _formSurname = string.Empty;
    [ObservableProperty] private string _formPhone = string.Empty;
    [ObservableProperty] private string _formEmail = string.Empty;
    [ObservableProperty] private string _formNotes = string.Empty;

    public ObservableCollection<CustomerListItem> Customers { get; } = [];

    public CustomersViewModel(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    [RelayCommand]
    public async Task LoadDataAsync()
    {
        IsLoading = true;
        ErrorMessage = null;

        try
        {
            var response = await _customerService.ListPaginatedAsync(
                CurrentPage, 20, string.IsNullOrWhiteSpace(SearchText) ? null : SearchText.Trim());

            if (response.Success && response.Data != null)
            {
                Customers.Clear();
                foreach (var c in response.Data.Items)
                    Customers.Add(c);
                TotalPages = response.Data.TotalPages;
                TotalCount = response.Data.TotalCount;
            }
            else
            {
                ErrorMessage = response.Error?.Message;
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = ex.Message;
        }
        finally
        {
            IsLoading = false;
        }
    }

    [RelayCommand]
    private async Task SearchAsync()
    {
        CurrentPage = 1;
        await LoadDataAsync();
    }

    [RelayCommand]
    private async Task NextPageAsync()
    {
        if (CurrentPage < TotalPages)
        {
            CurrentPage++;
            await LoadDataAsync();
        }
    }

    [RelayCommand]
    private async Task PreviousPageAsync()
    {
        if (CurrentPage > 1)
        {
            CurrentPage--;
            await LoadDataAsync();
        }
    }

    [RelayCommand]
    private void OpenAddDialog()
    {
        IsEditing = false;
        EditingId = 0;
        FormName = string.Empty;
        FormSurname = string.Empty;
        FormPhone = string.Empty;
        FormEmail = string.Empty;
        FormNotes = string.Empty;
        IsDialogOpen = true;
    }

    [RelayCommand]
    private void OpenEditDialog(CustomerListItem customer)
    {
        IsEditing = true;
        EditingId = customer.Id;
        FormName = customer.Name;
        FormSurname = customer.Surname;
        FormPhone = customer.Phone;
        FormEmail = customer.Email ?? string.Empty;
        FormNotes = string.Empty;
        IsDialogOpen = true;
    }

    [RelayCommand]
    private async Task SaveAsync()
    {
        if (string.IsNullOrWhiteSpace(FormName) || string.IsNullOrWhiteSpace(FormSurname))
        {
            ErrorMessage = "Ad ve soyad gereklidir";
            return;
        }

        IsLoading = true;
        var data = new CustomerCreate
        {
            Name = FormName.Trim(),
            Surname = FormSurname.Trim(),
            Phone = string.IsNullOrWhiteSpace(FormPhone) ? null : FormPhone.Trim(),
            Email = string.IsNullOrWhiteSpace(FormEmail) ? null : FormEmail.Trim(),
            Notes = string.IsNullOrWhiteSpace(FormNotes) ? null : FormNotes.Trim()
        };

        try
        {
            var response = IsEditing
                ? await _customerService.UpdateAsync(EditingId, data)
                : await _customerService.CreateAsync(data);

            if (response.Success)
            {
                IsDialogOpen = false;
                await LoadDataAsync();
            }
            else
            {
                ErrorMessage = response.Error?.Message;
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = ex.Message;
        }
        finally
        {
            IsLoading = false;
        }
    }

    [RelayCommand]
    private async Task DeleteAsync(CustomerListItem customer)
    {
        IsLoading = true;
        try
        {
            var response = await _customerService.DeleteAsync(customer.Id);
            if (response.Success)
                await LoadDataAsync();
            else
                ErrorMessage = response.Error?.Message;
        }
        catch (Exception ex)
        {
            ErrorMessage = ex.Message;
        }
        finally
        {
            IsLoading = false;
        }
    }

    [RelayCommand]
    private void CloseDialog()
    {
        IsDialogOpen = false;
    }
}
