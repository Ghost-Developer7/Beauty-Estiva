using System.ComponentModel.DataAnnotations.Schema;

namespace API_BeautyWise.Models
{
    /// <summary>
    /// Personele özel hizmet bazlı komisyon oranı.
    /// Bu kayıt varsa AppUser.DefaultCommissionRate yerine bu oran kullanılır.
    /// </summary>
    public class StaffTreatmentCommission : BaseEntity
    {
        public int Id { get; set; }

        public int TenantId { get; set; }
        [ForeignKey("TenantId")]
        public Tenant Tenant { get; set; } = null!;

        public int StaffId { get; set; }
        [ForeignKey("StaffId")]
        public AppUser Staff { get; set; } = null!;

        public int TreatmentId { get; set; }
        [ForeignKey("TreatmentId")]
        public Treatment Treatment { get; set; } = null!;

        /// <summary>Komisyon oranı (0-100 arası yüzde)</summary>
        public decimal CommissionRate { get; set; }
    }
}
