using API_BeautyWise.DTO;

namespace API_BeautyWise.Services.Interface
{
    public interface IFinancialReportService
    {
        /// <summary>
        /// Gelir özeti. staffId verilirse sadece o personelin randevularına ait ödemeler hesaplanır.
        /// </summary>
        Task<RevenueSummaryDto> GetRevenueSummaryAsync(
            int tenantId, DateTime startDate, DateTime endDate, int? staffId = null);

        /// <summary>
        /// Gider özeti. (Sadece Owner/Admin görebilir; controller katmanında kontrol edilir.)
        /// </summary>
        Task<ExpenseSummaryDto> GetExpenseSummaryAsync(
            int tenantId, DateTime startDate, DateTime endDate);

        /// <summary>
        /// Finansal dashboard: gelir + gider + net kâr + istatistikler.
        /// staffId verilirse gelir sadece o personele göre hesaplanır.
        /// </summary>
        Task<FinancialDashboardDto> GetDashboardAsync(
            int tenantId, DateTime startDate, DateTime endDate, int? staffId = null);
    }
}
