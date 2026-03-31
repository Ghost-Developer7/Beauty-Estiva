using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using BeautyEstiva.Desktop.Models;
using BeautyEstiva.Desktop.Services;
using System.Collections.ObjectModel;

namespace BeautyEstiva.Desktop.ViewModels;

public partial class AppointmentsViewModel : ObservableObject
{
    private readonly IAppointmentService _appointmentService;
    private readonly ICustomerService _customerService;
    private readonly ITreatmentService _treatmentService;
    private readonly IStaffService _staffService;

    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private string? _errorMessage;
    [ObservableProperty] private int _currentPage = 1;
    [ObservableProperty] private int _totalPages = 1;
    [ObservableProperty] private DateTime _filterDate = DateTime.Today;

    // Create dialog
    [ObservableProperty] private bool _isDialogOpen;
    [ObservableProperty] private int _selectedCustomerId;
    [ObservableProperty] private int _selectedStaffId;
    [ObservableProperty] private int _selectedTreatmentId;
    [ObservableProperty] private DateTime _appointmentDate = DateTime.Today;
    [ObservableProperty] private string _appointmentTime = "10:00";
    [ObservableProperty] private string _appointmentNotes = string.Empty;

    public ObservableCollection<AppointmentListItem> Appointments { get; } = [];
    public ObservableCollection<CustomerListItem> CustomerList { get; } = [];
    public ObservableCollection<TreatmentListItem> TreatmentList { get; } = [];
    public ObservableCollection<StaffMember> StaffList { get; } = [];

    public AppointmentsViewModel(
        IAppointmentService appointmentService,
        ICustomerService customerService,
        ITreatmentService treatmentService,
        IStaffService staffService)
    {
        _appointmentService = appointmentService;
        _customerService = customerService;
        _treatmentService = treatmentService;
        _staffService = staffService;
    }

    [RelayCommand]
    public async Task LoadDataAsync()
    {
        IsLoading = true;
        ErrorMessage = null;

        try
        {
            var startDate = FilterDate.ToString("yyyy-MM-dd");
            var endDate = FilterDate.AddDays(1).ToString("yyyy-MM-dd");

            var response = await _appointmentService.ListPaginatedAsync(
                CurrentPage, 20, startDate, endDate);

            if (response.Success && response.Data != null)
            {
                Appointments.Clear();
                foreach (var a in response.Data.Items)
                    Appointments.Add(a);
                TotalPages = Math.Max(1, response.Data.TotalPages);
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
    private async Task OpenCreateDialogAsync()
    {
        IsDialogOpen = true;
        SelectedCustomerId = 0;
        SelectedStaffId = 0;
        SelectedTreatmentId = 0;
        AppointmentDate = DateTime.Today;
        AppointmentTime = "10:00";
        AppointmentNotes = string.Empty;

        await LoadDropdownDataAsync();
    }

    private async Task LoadDropdownDataAsync()
    {
        try
        {
            var customersTask = _customerService.ListAsync();
            var treatmentsTask = _treatmentService.ListAsync();
            var staffTask = _staffService.ListAsync();
            await Task.WhenAll(customersTask, treatmentsTask, staffTask);

            CustomerList.Clear();
            if (customersTask.Result.Data != null)
                foreach (var c in customersTask.Result.Data) CustomerList.Add(c);

            TreatmentList.Clear();
            if (treatmentsTask.Result.Data != null)
                foreach (var t in treatmentsTask.Result.Data) TreatmentList.Add(t);

            StaffList.Clear();
            if (staffTask.Result.Data != null)
                foreach (var s in staffTask.Result.Data) StaffList.Add(s);
        }
        catch { /* dropdowns will be empty */ }
    }

    [RelayCommand]
    private async Task CreateAppointmentAsync()
    {
        if (SelectedCustomerId == 0 || SelectedStaffId == 0 || SelectedTreatmentId == 0)
        {
            ErrorMessage = "Müşteri, personel ve hizmet seçiniz";
            return;
        }

        IsLoading = true;
        try
        {
            var startTime = AppointmentDate.Date.Add(TimeSpan.Parse(AppointmentTime));
            var data = new AppointmentCreate
            {
                CustomerId = SelectedCustomerId,
                StaffId = SelectedStaffId,
                TreatmentId = SelectedTreatmentId,
                StartTime = startTime.ToString("yyyy-MM-ddTHH:mm:ss"),
                Notes = string.IsNullOrWhiteSpace(AppointmentNotes) ? null : AppointmentNotes.Trim()
            };

            var response = await _appointmentService.CreateAsync(data);
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
    private async Task UpdateStatusAsync(AppointmentListItem appointment)
    {
        // Cycle: Scheduled -> Confirmed -> Completed
        var newStatus = appointment.Status switch
        {
            "Scheduled" => 1, // Confirmed
            "Confirmed" => 2, // Completed
            _ => -1
        };
        if (newStatus < 0) return;

        IsLoading = true;
        try
        {
            var response = await _appointmentService.UpdateStatusAsync(
                appointment.Id, new AppointmentStatusUpdate { Status = newStatus });
            if (response.Success) await LoadDataAsync();
            else ErrorMessage = response.Error?.Message;
        }
        catch (Exception ex) { ErrorMessage = ex.Message; }
        finally { IsLoading = false; }
    }

    [RelayCommand]
    private async Task CancelAppointmentAsync(AppointmentListItem appointment)
    {
        IsLoading = true;
        try
        {
            var response = await _appointmentService.CancelAsync(appointment.Id);
            if (response.Success) await LoadDataAsync();
            else ErrorMessage = response.Error?.Message;
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
