namespace API_BeautyWise.DTO
{
    public class TenantOnboardingDto
    {
        // --- Tenant ---
        public string CompanyName { get; init; }
        public string Phone { get; init; }
        public string Address { get; init; }
        public string TaxNumber { get; init; }
        public string TaxOffice { get; init; }

        // --- Owner User ---
        public string Email { get; init; }
        public string Password { get; init; }
        public string ConfirmPassword { get; init; }
        public string Name { get; init; }
        public string Surname { get; init; }
    }

    public class TenantOnboardingResultDto
    {
        public int TenantId { get; init; }
        public int UserId { get; init; }
    }
}
