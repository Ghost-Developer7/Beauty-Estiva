using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API_BeautyWise.Models
{
    public class TenantEmailIntegration : BaseEntity
    {
        [Key]
        public int Id { get; set; }
        public int TenantId { get; set; }
        public string SmtpServer { get; set; }
        public int SmtpPort { get; set; }
        public string SmtpUser { get; set; }
        public string SmtpPass { get; set; }

        [ForeignKey("TenantId")]
        public Tenant Tenant { get; set; }
    }
}
