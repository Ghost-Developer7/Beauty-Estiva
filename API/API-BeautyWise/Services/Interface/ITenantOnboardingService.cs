using API_BeautyWise.DTO;

namespace API_BeautyWise.Services.Interface
{
    public interface ITenantOnboardingService
    {
        Task<TenantOnboardingResultDto> RegisterTenantAsync(TenantOnboardingDto dto);
        Task<string> CreateInviteTokenAsync(int tenantId, string? emailToInvite = null);

    }
}
