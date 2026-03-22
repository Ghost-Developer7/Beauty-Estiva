using System.ComponentModel.DataAnnotations;

namespace API_BeautyWise.DTO
{
    public class LoginRequestDto
    {
        [Required(ErrorMessage = "E-posta veya kullanıcı adı gereklidir.")]
        [StringLength(256, ErrorMessage = "E-posta en fazla 256 karakter olabilir.")]
        public string EmailOrUsername { get; set; } = "";

        [Required(ErrorMessage = "Şifre gereklidir.")]
        [StringLength(128, ErrorMessage = "Şifre en fazla 128 karakter olabilir.")]
        public string Password { get; set; } = "";
    }
}
