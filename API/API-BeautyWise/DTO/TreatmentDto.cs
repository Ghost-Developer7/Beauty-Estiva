using System.ComponentModel.DataAnnotations;

namespace API_BeautyWise.DTO
{
    public class TreatmentCreateDto
    {
        [Required(ErrorMessage = "Hizmet adı gereklidir.")]
        [StringLength(200, ErrorMessage = "Hizmet adı en fazla 200 karakter olabilir.")]
        public string Name { get; set; } = "";

        [StringLength(1000)]
        public string? Description { get; set; }

        [Range(1, 480, ErrorMessage = "Süre 1 ile 480 dakika arasında olmalıdır.")]
        public int DurationMinutes { get; set; }

        [Range(0, 999999.99, ErrorMessage = "Fiyat geçerli bir değer olmalıdır.")]
        public decimal? Price { get; set; }

        [StringLength(7)]
        public string? Color { get; set; }
    }

    public class TreatmentUpdateDto
    {
        [Required(ErrorMessage = "Hizmet adı gereklidir.")]
        [StringLength(200)]
        public string Name { get; set; } = "";

        [StringLength(1000)]
        public string? Description { get; set; }

        [Range(1, 480, ErrorMessage = "Süre 1 ile 480 dakika arasında olmalıdır.")]
        public int DurationMinutes { get; set; }

        [Range(0, 999999.99)]
        public decimal? Price { get; set; }

        [StringLength(7)]
        public string? Color { get; set; }
    }

    public class TreatmentListDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string? Description { get; set; }
        public int DurationMinutes { get; set; }
        public decimal? Price { get; set; }
        public string? Color { get; set; }
    }
}
