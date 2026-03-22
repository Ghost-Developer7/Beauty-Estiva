using System.ComponentModel.DataAnnotations;

namespace API_BeautyWise.DTO
{
    public class StaffRegisterDto
    {
        [Required(ErrorMessage = "Davet kodu gereklidir.")]
        [StringLength(100)]
        public string InviteToken { get; init; } = default!;

        [Required(ErrorMessage = "E-posta gereklidir.")]
        [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi girin.")]
        [StringLength(256)]
        public string Email { get; init; } = default!;

        [Required(ErrorMessage = "Şifre gereklidir.")]
        [StringLength(128, MinimumLength = 8, ErrorMessage = "Şifre en az 8 karakter olmalıdır.")]
        public string Password { get; init; } = default!;

        [Required(ErrorMessage = "Şifre tekrarı gereklidir.")]
        [Compare("Password", ErrorMessage = "Şifreler uyuşmuyor.")]
        public string ConfirmPassword { get; init; } = default!;

        [Required(ErrorMessage = "Ad gereklidir.")]
        [StringLength(100, ErrorMessage = "Ad en fazla 100 karakter olabilir.")]
        public string Name { get; init; } = default!;

        [Required(ErrorMessage = "Soyad gereklidir.")]
        [StringLength(100, ErrorMessage = "Soyad en fazla 100 karakter olabilir.")]
        public string Surname { get; init; } = default!;

        public DateTime? BirthDate { get; init; }
    }
}
