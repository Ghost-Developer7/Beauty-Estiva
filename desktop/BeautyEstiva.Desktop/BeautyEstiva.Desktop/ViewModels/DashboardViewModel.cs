using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using BeautyEstiva.Desktop.Models;
using BeautyEstiva.Desktop.Services;
using LiveChartsCore;
using LiveChartsCore.SkiaSharpView;
using System.Collections.ObjectModel;

namespace BeautyEstiva.Desktop.ViewModels;

public partial class DashboardViewModel : ObservableObject
{
    private readonly IDashboardService _dashboardService;

    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private string? _errorMessage;

    // KPI Values
    [ObservableProperty] private int _todayAppointmentsCount;
    [ObservableProperty] private int _upcomingAppointments;
    [ObservableProperty] private decimal _weeklyRevenue;
    [ObservableProperty] private decimal _monthlyRevenue;
    [ObservableProperty] private int _totalCustomers;

    // Today Schedule
    public ObservableCollection<TodayAppointment> TodaySchedule { get; } = [];

    // Charts
    [ObservableProperty] private ISeries[] _monthlyTrendSeries = [];
    [ObservableProperty] private Axis[] _monthlyTrendXAxes = [];

    public DashboardViewModel(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [RelayCommand]
    public async Task LoadDataAsync()
    {
        IsLoading = true;
        ErrorMessage = null;

        try
        {
            var response = await _dashboardService.GetSummaryAsync();
            if (response.Success && response.Data != null)
            {
                var data = response.Data;
                TodayAppointmentsCount = data.TodayAppointmentsCount;
                UpcomingAppointments = data.UpcomingAppointments;
                WeeklyRevenue = data.ThisWeekRevenue;
                MonthlyRevenue = data.ThisMonthRevenue;
                TotalCustomers = data.TotalCustomers;

                TodaySchedule.Clear();
                foreach (var item in data.TodaySchedule)
                    TodaySchedule.Add(item);

                BuildCharts(data);
            }
            else
            {
                ErrorMessage = response.Error?.Message ?? "Veri yüklenemedi";
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

    private void BuildCharts(DashboardSummary data)
    {
        if (data.MonthlyTrend.Count == 0) return;

        MonthlyTrendSeries =
        [
            new ColumnSeries<decimal>
            {
                Name = "Gelir",
                Values = data.MonthlyTrend.Select(t => t.Revenue).ToArray(),
                Fill = new LiveChartsCore.SkiaSharpView.Painting.SolidColorPaint(
                    new SkiaSharp.SKColor(103, 58, 183))
            },
            new ColumnSeries<decimal>
            {
                Name = "Gider",
                Values = data.MonthlyTrend.Select(t => t.Expense).ToArray(),
                Fill = new LiveChartsCore.SkiaSharpView.Painting.SolidColorPaint(
                    new SkiaSharp.SKColor(244, 67, 54))
            }
        ];

        MonthlyTrendXAxes =
        [
            new Axis
            {
                Labels = data.MonthlyTrend.Select(t => t.Month).ToArray()
            }
        ];
    }
}
