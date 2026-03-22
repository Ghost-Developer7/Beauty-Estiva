using System.ComponentModel.DataAnnotations.Schema;

namespace API_BeautyWise.Models
{
    /// <summary>
    /// Ödeme başına komisyon kaydı (ledger).
    /// Her AppointmentPayment oluşturulduğunda otomatik oluşturulur.
    /// Komisyon oranı snapshot olarak saklanır — geçmişe dönük değişmez.
    /// </summary>
    public class StaffCommissionRecord : BaseEntity
    {
        public int Id { get; set; }

        public int TenantId { get; set; }
        [ForeignKey("TenantId")]
        public Tenant Tenant { get; set; } = null!;

        public int StaffId { get; set; }
        [ForeignKey("StaffId")]
        public AppUser Staff { get; set; } = null!;

        public int AppointmentPaymentId { get; set; }
        [ForeignKey("AppointmentPaymentId")]
        public AppointmentPayment AppointmentPayment { get; set; } = null!;

        /// <summary>Ödeme anında uygulanan komisyon oranı (snapshot)</summary>
        public decimal CommissionRate { get; set; }

        /// <summary>Ödemenin TRY karşılığı (snapshot)</summary>
        public decimal PaymentAmountInTry { get; set; }

        /// <summary>Personel komisyonu = PaymentAmountInTry × (CommissionRate / 100)</summary>
        public decimal CommissionAmountInTry { get; set; }

        /// <summary>Salon payı = PaymentAmountInTry - CommissionAmountInTry</summary>
        public decimal SalonShareInTry { get; set; }

        /// <summary>Komisyon personele ödendi mi?</summary>
        public bool IsPaid { get; set; } = false;

        /// <summary>Komisyon ödeme tarihi</summary>
        public DateTime? PaidAt { get; set; }
    }
}
