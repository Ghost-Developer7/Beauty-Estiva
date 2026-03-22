using System.ComponentModel.DataAnnotations;

namespace API_BeautyWise.DTO
{
    // ─── Komisyon Oran Bilgisi ──────────────────────────────────────────────

    public class StaffCommissionRateDto
    {
        public int StaffId { get; set; }
        public string StaffFullName { get; set; } = "";
        public decimal DefaultCommissionRate { get; set; }
        public List<TreatmentCommissionDto> TreatmentCommissions { get; set; } = new();
    }

    public class TreatmentCommissionDto
    {
        public int TreatmentId { get; set; }
        public string TreatmentName { get; set; } = "";
        public decimal CommissionRate { get; set; }
    }

    // ─── Komisyon Oran Ayarlama (Input) ─────────────────────────────────────

    public class SetStaffCommissionDto
    {
        [Range(0, 100, ErrorMessage = "Komisyon oranı 0-100 arasında olmalıdır.")]
        public decimal DefaultCommissionRate { get; set; }

        public List<TreatmentCommissionRateInput>? TreatmentRates { get; set; }
    }

    public class TreatmentCommissionRateInput
    {
        [Range(1, int.MaxValue, ErrorMessage = "Hizmet seçimi gereklidir.")]
        public int TreatmentId { get; set; }

        [Range(0, 100, ErrorMessage = "Komisyon oranı 0-100 arasında olmalıdır.")]
        public decimal CommissionRate { get; set; }
    }

    // ─── Komisyon Kayıt (Ledger) ────────────────────────────────────────────

    public class StaffCommissionRecordDto
    {
        public int Id { get; set; }
        public int StaffId { get; set; }
        public string StaffFullName { get; set; } = "";
        public string TreatmentName { get; set; } = "";
        public string CustomerFullName { get; set; } = "";
        public DateTime AppointmentDate { get; set; }
        public decimal PaymentAmountInTry { get; set; }
        public decimal CommissionRate { get; set; }
        public decimal CommissionAmountInTry { get; set; }
        public decimal SalonShareInTry { get; set; }
        public bool IsPaid { get; set; }
        public DateTime? PaidAt { get; set; }
    }

    // ─── Komisyon Özeti (Rapor) ─────────────────────────────────────────────

    public class StaffCommissionSummaryDto
    {
        public int StaffId { get; set; }
        public string StaffFullName { get; set; } = "";
        public decimal TotalPaymentsInTry { get; set; }
        public decimal TotalCommissionInTry { get; set; }
        public decimal TotalSalonShareInTry { get; set; }
        public decimal PaidCommissionInTry { get; set; }
        public decimal UnpaidCommissionInTry { get; set; }
        public int RecordCount { get; set; }
    }

    // ─── Ödeme İşaretle (Input) ─────────────────────────────────────────────

    public class MarkCommissionsPaidDto
    {
        [Required(ErrorMessage = "En az bir komisyon kaydı seçilmelidir.")]
        public List<int> CommissionRecordIds { get; set; } = new();
    }
}
