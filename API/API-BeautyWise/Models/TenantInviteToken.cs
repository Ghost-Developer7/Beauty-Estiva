using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API_BeautyWise.Models
{
    public class TenantInviteToken : BaseEntity
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(10)]
        public string TokenCode { get; set; }

        public string? EmailToInvite { get; set; }
        public DateTime ExpireDate { get; set; }
        public bool IsUsed { get; set; } = false;
        public int TenantId { get; set; }

        [ForeignKey("TenantId")]
        public Tenant Tenant { get; set; }
    }
}
