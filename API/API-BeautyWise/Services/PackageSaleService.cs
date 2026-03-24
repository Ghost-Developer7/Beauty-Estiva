using API_BeautyWise.DTO;
using API_BeautyWise.Enums;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace API_BeautyWise.Services
{
    public class PackageSaleService : IPackageSaleService
    {
        private readonly Context _ctx;
        public PackageSaleService(Context ctx) => _ctx = ctx;

        // ════════════════════════════════════════
        //  GET ALL
        // ════════════════════════════════════════

        public async Task<List<PackageSaleListDto>> GetAllAsync(
            int tenantId, DateTime? startDate = null, DateTime? endDate = null,
            int? customerId = null, int? treatmentId = null, int? status = null)
        {
            var query = _ctx.PackageSales
                .Include(s => s.Customer)
                .Include(s => s.Treatment)
                .Include(s => s.Staff)
                .Include(s => s.Usages.Where(u => u.IsActive == true))
                .Include(s => s.Payments.Where(p => p.IsActive == true))
                .Where(s => s.TenantId == tenantId && s.IsActive == true);

            if (startDate.HasValue)
                query = query.Where(s => s.StartDate.Date >= startDate.Value.Date);
            if (endDate.HasValue)
                query = query.Where(s => s.StartDate.Date <= endDate.Value.Date);
            if (customerId.HasValue)
                query = query.Where(s => s.CustomerId == customerId.Value);
            if (treatmentId.HasValue)
                query = query.Where(s => s.TreatmentId == treatmentId.Value);
            if (status.HasValue)
                query = query.Where(s => (int)s.Status == status.Value);

            var sales = await query
                .OrderByDescending(s => s.CDate)
                .ToListAsync();

            return sales.Select(MapSale).ToList();
        }

        // ════════════════════════════════════════
        //  GET BY ID
        // ════════════════════════════════════════

        public async Task<PackageSaleListDto?> GetByIdAsync(int id, int tenantId)
        {
            var s = await _ctx.PackageSales
                .Include(x => x.Customer)
                .Include(x => x.Treatment)
                .Include(x => x.Staff)
                .Include(x => x.Usages.Where(u => u.IsActive == true))
                    .ThenInclude(u => u.Staff)
                .Include(x => x.Payments.Where(p => p.IsActive == true))
                .FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId && x.IsActive == true);
            return s == null ? null : MapSale(s);
        }

        // ════════════════════════════════════════
        //  CREATE
        // ════════════════════════════════════════

        public async Task<int> CreateAsync(int tenantId, int staffId, PackageSaleCreateDto dto)
        {
            // Müşteri kontrolü
            var customer = await _ctx.Customers
                .FirstOrDefaultAsync(c => c.Id == dto.CustomerId && c.TenantId == tenantId && c.IsActive == true)
                ?? throw new KeyNotFoundException("Müşteri bulunamadı.");

            // Hizmet kontrolü
            var treatment = await _ctx.Treatments
                .FirstOrDefaultAsync(t => t.Id == dto.TreatmentId && t.TenantId == tenantId && t.IsActive == true)
                ?? throw new KeyNotFoundException("Hizmet bulunamadı.");

            var sale = new PackageSale
            {
                TenantId      = tenantId,
                CustomerId    = dto.CustomerId,
                TreatmentId   = dto.TreatmentId,
                StaffId       = staffId,
                TotalSessions = dto.TotalSessions,
                UsedSessions  = 0,
                TotalPrice    = dto.TotalPrice,
                PaidAmount    = dto.PaidAmount,
                PaymentMethod = dto.PaymentMethod,
                StartDate     = dto.StartDate ?? DateTime.UtcNow,
                EndDate       = dto.EndDate ?? DateTime.UtcNow.AddYears(1),
                Status        = PackageSaleStatus.Active,
                Notes         = dto.Notes,
                CUser         = staffId,
                CDate         = DateTime.UtcNow,
                IsActive      = true
            };

            _ctx.PackageSales.Add(sale);
            await _ctx.SaveChangesAsync();

            // İlk ödeme kaydı
            if (dto.PaidAmount > 0)
            {
                var payment = new PackageSalePayment
                {
                    PackageSaleId = sale.Id,
                    TenantId      = tenantId,
                    Amount        = dto.PaidAmount,
                    PaymentMethod = dto.PaymentMethod,
                    PaidAt        = DateTime.UtcNow,
                    Notes         = "İlk ödeme",
                    CUser         = staffId,
                    CDate         = DateTime.UtcNow,
                    IsActive      = true
                };
                _ctx.PackageSalePayments.Add(payment);
                await _ctx.SaveChangesAsync();
            }

            return sale.Id;
        }

        // ════════════════════════════════════════
        //  UPDATE
        // ════════════════════════════════════════

        public async Task UpdateAsync(int id, int tenantId, PackageSaleUpdateDto dto)
        {
            var sale = await _ctx.PackageSales
                .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId && s.IsActive == true)
                ?? throw new KeyNotFoundException("Paket satışı bulunamadı.");

            sale.TotalSessions = dto.TotalSessions;
            sale.TotalPrice    = dto.TotalPrice;
            sale.Notes         = dto.Notes;
            sale.UDate         = DateTime.UtcNow;

            if (dto.EndDate.HasValue)
                sale.EndDate = dto.EndDate.Value;

            if (dto.Status.HasValue)
                sale.Status = dto.Status.Value;

            // Seans sayısı değiştiyse durum güncelle
            if (sale.UsedSessions >= sale.TotalSessions)
                sale.Status = PackageSaleStatus.Completed;

            await _ctx.SaveChangesAsync();
        }

        // ════════════════════════════════════════
        //  DELETE (soft)
        // ════════════════════════════════════════

        public async Task DeleteAsync(int id, int tenantId)
        {
            var sale = await _ctx.PackageSales
                .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId && s.IsActive == true)
                ?? throw new KeyNotFoundException("Paket satışı bulunamadı.");

            sale.IsActive = false;
            sale.UDate    = DateTime.UtcNow;
            await _ctx.SaveChangesAsync();
        }

        // ════════════════════════════════════════
        //  STATS
        // ════════════════════════════════════════

        public async Task<PackageSaleStatsDto> GetStatsAsync(int tenantId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var query = _ctx.PackageSales
                .Where(s => s.TenantId == tenantId && s.IsActive == true);

            if (startDate.HasValue)
                query = query.Where(s => s.CDate >= startDate.Value);
            if (endDate.HasValue)
                query = query.Where(s => s.CDate <= endDate.Value);

            var sales = await query.ToListAsync();

            return new PackageSaleStatsDto
            {
                TotalSales        = sales.Count,
                TotalRevenue      = sales.Sum(s => s.TotalPrice),
                ActivePackages    = sales.Count(s => s.Status == PackageSaleStatus.Active),
                CompletedPackages = sales.Count(s => s.Status == PackageSaleStatus.Completed)
            };
        }

        // ════════════════════════════════════════
        //  RECORD USAGE
        // ════════════════════════════════════════

        public async Task<int> RecordUsageAsync(int packageSaleId, int tenantId, PackageSaleUsageCreateDto dto)
        {
            var sale = await _ctx.PackageSales
                .FirstOrDefaultAsync(s => s.Id == packageSaleId && s.TenantId == tenantId && s.IsActive == true)
                ?? throw new KeyNotFoundException("Paket satışı bulunamadı.");

            if (sale.UsedSessions >= sale.TotalSessions)
                throw new InvalidOperationException("Tüm seanslar kullanılmış. Ek seans eklenemez.");

            if (sale.Status != PackageSaleStatus.Active)
                throw new InvalidOperationException("Paket aktif değil. Seans kaydedilemez.");

            var usage = new PackageSaleUsage
            {
                PackageSaleId = packageSaleId,
                TenantId      = tenantId,
                UsageDate     = dto.UsageDate ?? DateTime.UtcNow,
                StaffId       = dto.StaffId,
                Notes         = dto.Notes,
                CDate         = DateTime.UtcNow,
                IsActive      = true
            };

            _ctx.PackageSaleUsages.Add(usage);

            sale.UsedSessions += 1;
            sale.UDate = DateTime.UtcNow;

            // Tüm seanslar kullanıldıysa paketi tamamla
            if (sale.UsedSessions >= sale.TotalSessions)
                sale.Status = PackageSaleStatus.Completed;

            await _ctx.SaveChangesAsync();
            return usage.Id;
        }

        // ════════════════════════════════════════
        //  DELETE USAGE
        // ════════════════════════════════════════

        public async Task DeleteUsageAsync(int usageId, int tenantId)
        {
            var usage = await _ctx.PackageSaleUsages
                .FirstOrDefaultAsync(u => u.Id == usageId && u.TenantId == tenantId && u.IsActive == true)
                ?? throw new KeyNotFoundException("Kullanım kaydı bulunamadı.");

            var sale = await _ctx.PackageSales
                .FirstOrDefaultAsync(s => s.Id == usage.PackageSaleId && s.TenantId == tenantId && s.IsActive == true)
                ?? throw new KeyNotFoundException("Paket satışı bulunamadı.");

            usage.IsActive = false;
            usage.UDate    = DateTime.UtcNow;

            sale.UsedSessions = Math.Max(0, sale.UsedSessions - 1);
            sale.UDate        = DateTime.UtcNow;

            // Seans geri alındıysa ve paket tamamlanmışsa aktife çevir
            if (sale.Status == PackageSaleStatus.Completed && sale.UsedSessions < sale.TotalSessions)
                sale.Status = PackageSaleStatus.Active;

            await _ctx.SaveChangesAsync();
        }

        // ════════════════════════════════════════
        //  ADD PAYMENT
        // ════════════════════════════════════════

        public async Task<int> AddPaymentAsync(int packageSaleId, int tenantId, PackageSalePaymentCreateDto dto)
        {
            var sale = await _ctx.PackageSales
                .FirstOrDefaultAsync(s => s.Id == packageSaleId && s.TenantId == tenantId && s.IsActive == true)
                ?? throw new KeyNotFoundException("Paket satışı bulunamadı.");

            var payment = new PackageSalePayment
            {
                PackageSaleId = packageSaleId,
                TenantId      = tenantId,
                Amount        = dto.Amount,
                PaymentMethod = dto.PaymentMethod,
                PaidAt        = dto.PaidAt ?? DateTime.UtcNow,
                Notes         = dto.Notes,
                CDate         = DateTime.UtcNow,
                IsActive      = true
            };

            _ctx.PackageSalePayments.Add(payment);

            sale.PaidAmount += dto.Amount;
            sale.UDate = DateTime.UtcNow;

            await _ctx.SaveChangesAsync();
            return payment.Id;
        }

        // ════════════════════════════════════════
        //  MAPPERS
        // ════════════════════════════════════════

        private static string PaymentMethodDisplayName(PaymentMethod m) => m switch
        {
            PaymentMethod.Cash         => "Nakit",
            PaymentMethod.CreditCard   => "Kredi / Banka Kartı",
            PaymentMethod.BankTransfer => "Havale / EFT",
            PaymentMethod.Check        => "Çek",
            _                          => "Diğer"
        };

        private static string StatusDisplayName(PackageSaleStatus s) => s switch
        {
            PackageSaleStatus.Active    => "Aktif",
            PackageSaleStatus.Completed => "Tamamlandı",
            PackageSaleStatus.Expired   => "Süresi Doldu",
            PackageSaleStatus.Cancelled => "İptal",
            _                           => "Bilinmiyor"
        };

        private static PackageSaleListDto MapSale(PackageSale s) => new()
        {
            Id                   = s.Id,
            CustomerId           = s.CustomerId,
            CustomerFullName     = s.Customer != null ? $"{s.Customer.Name} {s.Customer.Surname}" : "",
            TreatmentId          = s.TreatmentId,
            TreatmentName        = s.Treatment?.Name ?? "",
            StaffId              = s.StaffId,
            StaffFullName        = s.Staff != null ? $"{s.Staff.Name} {s.Staff.Surname}" : "",
            TotalSessions        = s.TotalSessions,
            UsedSessions         = s.UsedSessions,
            RemainingSessions    = s.TotalSessions - s.UsedSessions,
            TotalPrice           = s.TotalPrice,
            PaidAmount           = s.PaidAmount,
            RemainingPayment     = s.TotalPrice - s.PaidAmount,
            PaymentMethodValue   = (int)s.PaymentMethod,
            PaymentMethodDisplay = PaymentMethodDisplayName(s.PaymentMethod),
            StartDate            = s.StartDate,
            EndDate              = s.EndDate,
            StatusValue          = (int)s.Status,
            StatusDisplay        = StatusDisplayName(s.Status),
            Notes                = s.Notes,
            CreatedAt            = s.CDate ?? DateTime.MinValue,
            Usages = s.Usages?.Where(u => u.IsActive == true).OrderByDescending(u => u.UsageDate).Select(u => new PackageSaleUsageDto
            {
                Id            = u.Id,
                UsageDate     = u.UsageDate,
                StaffId       = u.StaffId,
                StaffFullName = u.Staff != null ? $"{u.Staff.Name} {u.Staff.Surname}" : null,
                Notes         = u.Notes
            }).ToList() ?? new(),
            Payments = s.Payments?.Where(p => p.IsActive == true).OrderByDescending(p => p.PaidAt).Select(p => new PackageSalePaymentDto
            {
                Id                   = p.Id,
                Amount               = p.Amount,
                PaymentMethodValue   = (int)p.PaymentMethod,
                PaymentMethodDisplay = PaymentMethodDisplayName(p.PaymentMethod),
                PaidAt               = p.PaidAt,
                Notes                = p.Notes
            }).ToList() ?? new()
        };
    }
}
