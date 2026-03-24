using API_BeautyWise.DTO;

namespace API_BeautyWise.Services.Interface
{
    public interface IDashboardService
    {
        /// <summary>
        /// Dashboard &ouml;zet verisi. staffId verilirse sadece o personele ait istatistikler d&ouml;ner.
        /// </summary>
        Task<DashboardSummaryDto> GetSummaryAsync(int tenantId, int? staffId = null);
    }
}
