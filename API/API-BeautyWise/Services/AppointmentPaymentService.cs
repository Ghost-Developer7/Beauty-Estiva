using API_BeautyWise.DTO;
using API_BeautyWise.Enums;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace API_BeautyWise.Services
{
    public class AppointmentPaymentService : IAppointmentPaymentService
    {
        private readonly Context _ctx;
        private readonly IStaffCommissionService _commissionService;

        public AppointmentPaymentService(Context ctx, IStaffCommissionService commissionService)
        {
            _ctx = ctx;
            _commissionService = commissionService;
        }

        // ─── Helpers ──────────────────────────────────────────────────────────────

        private static string PaymentMethodDisplay(PaymentMethod method) => method switch
        {
            PaymentMethod.Cash          => "Nakit",
            PaymentMethod.CreditCard    => "Kredi / Banka Kartı",
            PaymentMethod.BankTransfer  => "Havale / EFT",
            PaymentMethod.Check         => "Çek",
            _                           => "Diğer"
        };

        private static AppointmentPaymentListDto Map(AppointmentPayment p) => new()
        {
            Id                   = p.Id,
            AppointmentId        = p.AppointmentId,
            CustomerFullName     = $"{p.Appointment.Customer.Name} {p.Appointment.Customer.Surname}",
            TreatmentName        = p.Appointment.Treatment.Name,
            StaffFullName        = $"{p.Appointment.Staff.Name} {p.Appointment.Staff.Surname}",
            AppointmentStartTime = p.Appointment.StartTime,
            Amount               = p.Amount,
            CurrencyCode         = p.Currency.Code,
            CurrencySymbol       = p.Currency.Symbol,
            ExchangeRateToTry    = p.ExchangeRateToTry,
            AmountInTry          = p.AmountInTry,
            PaymentMethodValue   = (int)p.PaymentMethod,
            PaymentMethodDisplay = PaymentMethodDisplay(p.PaymentMethod),
            PaidAt               = p.PaidAt,
            Notes                = p.Notes
        };

        // ─── Queries ──────────────────────────────────────────────────────────────

        public async Task<List<AppointmentPaymentListDto>> GetByAppointmentAsync(int appointmentId, int tenantId)
        {
            return await _ctx.AppointmentPayments
                .Include(p => p.Appointment).ThenInclude(a => a.Customer)
                .Include(p => p.Appointment).ThenInclude(a => a.Treatment)
                .Include(p => p.Appointment).ThenInclude(a => a.Staff)
                .Include(p => p.Currency)
                .Where(p => p.TenantId == tenantId
                         && p.AppointmentId == appointmentId
                         && p.IsActive == true)
                .OrderByDescending(p => p.PaidAt)
                .Select(p => Map(p))
                .ToListAsync();
        }

        public async Task<List<AppointmentPaymentListDto>> GetAllAsync(
            int tenantId, DateTime? startDate = null, DateTime? endDate = null,
            int? staffId = null, int? customerId = null)
        {
            var query = _ctx.AppointmentPayments
                .Include(p => p.Appointment).ThenInclude(a => a.Customer)
                .Include(p => p.Appointment).ThenInclude(a => a.Treatment)
                .Include(p => p.Appointment).ThenInclude(a => a.Staff)
                .Include(p => p.Currency)
                .Where(p => p.TenantId == tenantId && p.IsActive == true);

            if (startDate.HasValue)
                query = query.Where(p => p.PaidAt.Date >= startDate.Value.Date);

            if (endDate.HasValue)
                query = query.Where(p => p.PaidAt.Date <= endDate.Value.Date);

            if (staffId.HasValue)
                query = query.Where(p => p.Appointment.StaffId == staffId.Value);

            if (customerId.HasValue)
                query = query.Where(p => p.Appointment.CustomerId == customerId.Value);

            return await query
                .OrderByDescending(p => p.PaidAt)
                .Select(p => Map(p))
                .ToListAsync();
        }

        public async Task<PaginatedResponse<AppointmentPaymentListDto>> GetAllPaginatedAsync(
            int tenantId, int pageNumber, int pageSize,
            DateTime? startDate = null, DateTime? endDate = null,
            int? staffId = null, int? customerId = null)
        {
            var query = _ctx.AppointmentPayments
                .Include(p => p.Appointment).ThenInclude(a => a.Customer)
                .Include(p => p.Appointment).ThenInclude(a => a.Treatment)
                .Include(p => p.Appointment).ThenInclude(a => a.Staff)
                .Include(p => p.Currency)
                .Where(p => p.TenantId == tenantId && p.IsActive == true);

            if (startDate.HasValue)
                query = query.Where(p => p.PaidAt.Date >= startDate.Value.Date);
            if (endDate.HasValue)
                query = query.Where(p => p.PaidAt.Date <= endDate.Value.Date);
            if (staffId.HasValue)
                query = query.Where(p => p.Appointment.StaffId == staffId.Value);
            if (customerId.HasValue)
                query = query.Where(p => p.Appointment.CustomerId == customerId.Value);

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(p => p.PaidAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(p => Map(p))
                .ToListAsync();

            return new PaginatedResponse<AppointmentPaymentListDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<AppointmentPaymentListDto?> GetByIdAsync(int id, int tenantId)
        {
            var p = await _ctx.AppointmentPayments
                .Include(p => p.Appointment).ThenInclude(a => a.Customer)
                .Include(p => p.Appointment).ThenInclude(a => a.Treatment)
                .Include(p => p.Appointment).ThenInclude(a => a.Staff)
                .Include(p => p.Currency)
                .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId && p.IsActive == true);

            return p == null ? null : Map(p);
        }

        // ─── Commands ─────────────────────────────────────────────────────────────

        public async Task<int> CreateAsync(int tenantId, int createdByUserId, AppointmentPaymentCreateDto dto)
        {
            // Randevunun bu tenant'a ait olduğunu doğrula
            var appointment = await _ctx.Appointments
                .FirstOrDefaultAsync(a => a.Id == dto.AppointmentId && a.TenantId == tenantId && a.IsActive == true)
                ?? throw new Exception("Randevu bulunamadı.");

            // Para birimi doğrula
            var currency = await _ctx.Currencies.FirstOrDefaultAsync(c => c.Id == dto.CurrencyId && c.IsActive)
                ?? throw new Exception("Geçersiz para birimi.");

            var payment = new AppointmentPayment
            {
                TenantId          = tenantId,
                AppointmentId     = dto.AppointmentId,
                Amount            = dto.Amount,
                CurrencyId        = dto.CurrencyId,
                ExchangeRateToTry = dto.ExchangeRateToTry,
                AmountInTry       = dto.Amount * dto.ExchangeRateToTry,
                PaymentMethod     = dto.PaymentMethod,
                PaidAt            = dto.PaidAt ?? DateTime.Now,
                Notes             = dto.Notes,
                IsActive          = true,
                CDate             = DateTime.Now,
                CUser             = createdByUserId
            };

            _ctx.AppointmentPayments.Add(payment);
            await _ctx.SaveChangesAsync();

            // Komisyon kaydı oluştur
            await _commissionService.CalculateAndRecordCommissionAsync(
                tenantId, payment, appointment.StaffId, appointment.TreatmentId, createdByUserId);

            return payment.Id;
        }

        public async Task UpdateAsync(int id, int tenantId, AppointmentPaymentUpdateDto dto)
        {
            var payment = await _ctx.AppointmentPayments
                .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId && p.IsActive == true)
                ?? throw new Exception("Ödeme kaydı bulunamadı.");

            var currency = await _ctx.Currencies.FirstOrDefaultAsync(c => c.Id == dto.CurrencyId && c.IsActive)
                ?? throw new Exception("Geçersiz para birimi.");

            payment.Amount            = dto.Amount;
            payment.CurrencyId        = dto.CurrencyId;
            payment.ExchangeRateToTry = dto.ExchangeRateToTry;
            payment.AmountInTry       = dto.Amount * dto.ExchangeRateToTry;
            payment.PaymentMethod     = dto.PaymentMethod;
            payment.PaidAt            = dto.PaidAt ?? payment.PaidAt;
            payment.Notes             = dto.Notes;
            payment.UDate             = DateTime.Now;

            await _ctx.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id, int tenantId)
        {
            var payment = await _ctx.AppointmentPayments
                .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId && p.IsActive == true)
                ?? throw new Exception("Ödeme kaydı bulunamadı.");

            payment.IsActive = false;
            payment.UDate    = DateTime.Now;

            // İlişkili komisyon kaydını da deaktive et
            var commissionRecord = await _ctx.StaffCommissionRecords
                .FirstOrDefaultAsync(r => r.AppointmentPaymentId == id && r.IsActive == true);
            if (commissionRecord != null)
            {
                commissionRecord.IsActive = false;
                commissionRecord.UDate = DateTime.Now;
            }

            await _ctx.SaveChangesAsync();
        }
    }
}
