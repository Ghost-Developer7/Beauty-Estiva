using System.ComponentModel.DataAnnotations;

namespace API_BeautyWise.DTO
{
    public class ProfileDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Surname { get; set; } = "";
        public string Email { get; set; } = "";
        public string? Phone { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? ProfilePicturePath { get; set; }
        public List<string> Roles { get; set; } = new();
    }

    public class UpdateProfileDto
    {
        [Required(ErrorMessage = "Ad alanı zorunludur.")]
        [MaxLength(100, ErrorMessage = "Ad en fazla 100 karakter olabilir.")]
        public string Name { get; set; } = "";

        [Required(ErrorMessage = "Soyad alanı zorunludur.")]
        [MaxLength(100, ErrorMessage = "Soyad en fazla 100 karakter olabilir.")]
        public string Surname { get; set; } = "";

        [Phone(ErrorMessage = "Geçerli bir telefon numarası giriniz.")]
        public string? Phone { get; set; }

        public DateTime? BirthDate { get; set; }
    }

    public class ChangePasswordDto
    {
        [Required(ErrorMessage = "Mevcut şifre zorunludur.")]
        public string CurrentPassword { get; set; } = "";

        [Required(ErrorMessage = "Yeni şifre zorunludur.")]
        [MinLength(8, ErrorMessage = "Şifre en az 8 karakter olmalıdır.")]
        public string NewPassword { get; set; } = "";

        [Required(ErrorMessage = "Şifre tekrarı zorunludur.")]
        [Compare("NewPassword", ErrorMessage = "Şifreler eşleşmiyor.")]
        public string ConfirmNewPassword { get; set; } = "";
    }
}
