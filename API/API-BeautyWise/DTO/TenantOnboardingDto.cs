using System.ComponentModel.DataAnnotations;

namespace API_BeautyWise.DTO
{
    public class TenantOnboardingDto
    {
        // --- Tenant ---
        [Required(ErrorMessage = "Şirket adı gereklidir.")]
        [StringLength(200, ErrorMessage = "Şirket adı en fazla 200 karakter olabilir.")]
        public string CompanyName { get; init; } = "";

        [Required(ErrorMessage = "Telefon gereklidir.")]
        [Phone(ErrorMessage = "Geçerli bir telefon numarası girin.")]
        [StringLength(20)]
        public string Phone { get; init; } = "";

        [StringLength(500)]
        public string? Address { get; init; }

        [StringLength(20)]
        public string? TaxNumber { get; init; }

        [StringLength(100)]
        public string? TaxOffice { get; init; }

        // --- Owner User ---
        [Required(ErrorMessage = "E-posta gereklidir.")]
        [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi girin.")]
        [StringLength(256)]
        public string Email { get; init; } = "";

        [Required(ErrorMessage = "Şifre gereklidir.")]
        [StringLength(128, MinimumLength = 8, ErrorMessage = "Şifre en az 8 karakter olmalıdır.")]
        public string Password { get; init; } = "";

        [Required(ErrorMessage = "Şifre tekrarı gereklidir.")]
        [Compare("Password", ErrorMessage = "Şifreler uyuşmuyor.")]
        public string ConfirmPassword { get; init; } = "";

        [Required(ErrorMessage = "Ad gereklidir.")]
        [StringLength(100)]
        public string Name { get; init; } = "";

        [Required(ErrorMessage = "Soyad gereklidir.")]
        [StringLength(100)]
        public string Surname { get; init; } = "";
    }

    public class TenantOnboardingResultDto
    {
        public int TenantId { get; init; }
        public int UserId { get; init; }
    }
}
