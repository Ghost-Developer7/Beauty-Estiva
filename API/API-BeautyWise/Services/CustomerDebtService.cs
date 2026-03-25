using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace API_BeautyWise.Services
{
    public class CustomerDebtService : ICustomerDebtService
    {
        private readonly Context _ctx;

        public CustomerDebtService(Context ctx) => _ctx = ctx;

        // ════════════════════════════════════════════════════════════════════════
        //  BORÇ / ALACAK LİSTESİ
        // ════════════════════════════════════════════════════════════════════════

        public async Task<PaginatedResponse<CustomerDebtDto>> GetDebtsAsync(
            int tenantId, string? type = null, string? status = null,
            string? search = null, int page = 1, int pageSize = 20)
        {
            var query = _ctx.CustomerDebts
                .Include(d => d.Customer)
                .Include(d => d.Payments.Where(p => p.IsActive == true))
                .Where(d => d.TenantId == tenantId && d.IsActive == true);

            if (!string.IsNullOrEmpty(type))
                query = query.Where(d => d.Type == type);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(d => d.Status == status);

            if (!string.IsNullOrEmpty(search))
            {
                var s = search.ToLower();
                query = query.Where(d =>
                    (d.Customer != null && (d.Customer.Name + " " + d.Customer.Surname).ToLower().Contains(s)) ||
                    (d.PersonName != null && d.PersonName.ToLower().Contains(s)) ||
                    (d.Description != null && d.Description.ToLower().Contains(s)));
            }

            // Vadesi geçmiş olanları otomatik güncelle
            var now = DateTime.Now;
            var overdueIds = await query
                .Where(d => d.DueDate.HasValue && d.DueDate.Value < now &&
                       d.Status != "Paid" && d.Status != "Cancelled" && d.Status != "Overdue")
                .Select(d => d.Id)
                .ToListAsync();

            if (overdueIds.Count > 0)
            {
                await _ctx.CustomerDebts
                    .Where(d => overdueIds.Contains(d.Id))
                    .ExecuteUpdateAsync(s => s.SetProperty(d => d.Status, "Overdue"));
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(d => d.CDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(d => MapDebt(d))
                .ToListAsync();

            return new PaginatedResponse<CustomerDebtDto>
            {
                Items      = items,
                TotalCount = totalCount,
                PageNumber = page,
                PageSize   = pageSize
            };
        }

        // ════════════════════════════════════════════════════════════════════════
        //  TEKİL BORÇ DETAYI
        // ════════════════════════════════════════════════════════════════════════

        public async Task<CustomerDebtDto?> GetDebtByIdAsync(int tenantId, int debtId)
        {
            var d = await _ctx.CustomerDebts
                .Include(d => d.Customer)
                .Include(d => d.Payments.Where(p => p.IsActive == true))
                .FirstOrDefaultAsync(d => d.Id == debtId && d.TenantId == tenantId && d.IsActive == true);

            return d == null ? null : MapDebt(d);
        }

        // ════════════════════════════════════════════════════════════════════════
        //  OLUŞTUR
        // ════════════════════════════════════════════════════════════════════════

        public async Task<int> CreateDebtAsync(int tenantId, int userId, CreateCustomerDebtDto dto)
        {
            if (dto.CustomerId.HasValue)
            {
                var customerExists = await _ctx.Customers.AnyAsync(c =>
                    c.Id == dto.CustomerId && c.TenantId == tenantId && c.IsActive == true);
                if (!customerExists) throw new Exception("Müşteri bulunamadı.");
            }

            var debt = new CustomerDebt
            {
                TenantId             = tenantId,
                CustomerId           = dto.CustomerId,
                PersonName           = dto.PersonName,
                Type                 = dto.Type,
                Amount               = dto.Amount,
                PaidAmount           = 0,
                Currency             = dto.Currency ?? "TRY",
                Description          = dto.Description,
                Notes                = dto.Notes,
                DueDate              = dto.DueDate,
                Status               = "Pending",
                RelatedAppointmentId = dto.RelatedAppointmentId,
                RelatedPackageSaleId = dto.RelatedPackageSaleId,
                Source               = dto.Source ?? "Manual",
                IsActive             = true,
                CDate                = DateTime.Now,
                CUser                = userId
            };

            _ctx.CustomerDebts.Add(debt);
            await _ctx.SaveChangesAsync();
            return debt.Id;
        }

        // ════════════════════════════════════════════════════════════════════════
        //  GÜNCELLE
        // ════════════════════════════════════════════════════════════════════════

        public async Task UpdateDebtAsync(int tenantId, int userId, int debtId, UpdateCustomerDebtDto dto)
        {
            var debt = await _ctx.CustomerDebts
                .FirstOrDefaultAsync(d => d.Id == debtId && d.TenantId == tenantId && d.IsActive == true)
                ?? throw new Exception("Borç/alacak kaydı bulunamadı.");

            if (dto.CustomerId.HasValue)
            {
                var customerExists = await _ctx.Customers.AnyAsync(c =>
                    c.Id == dto.CustomerId && c.TenantId == tenantId && c.IsActive == true);
                if (!customerExists) throw new Exception("Müşteri bulunamadı.");
            }

            debt.CustomerId  = dto.CustomerId;
            debt.PersonName  = dto.PersonName;
            debt.Amount      = dto.Amount;
            debt.Currency    = dto.Currency ?? debt.Currency;
            debt.Description = dto.Description;
            debt.Notes       = dto.Notes;
            debt.DueDate     = dto.DueDate;
            debt.Source      = dto.Source ?? debt.Source;
            debt.UDate       = DateTime.Now;
            debt.UUser       = userId;

            if (!string.IsNullOrEmpty(dto.Status))
                debt.Status = dto.Status;

            // Recalculate status based on paid amount
            RecalculateStatus(debt);

            await _ctx.SaveChangesAsync();
        }

        // ════════════════════════════════════════════════════════════════════════
        //  SİL (soft delete)
        // ════════════════════════════════════════════════════════════════════════

        public async Task DeleteDebtAsync(int tenantId, int debtId)
        {
            var debt = await _ctx.CustomerDebts
                .FirstOrDefaultAsync(d => d.Id == debtId && d.TenantId == tenantId && d.IsActive == true)
                ?? throw new Exception("Borç/alacak kaydı bulunamadı.");

            debt.IsActive = false;
            debt.UDate    = DateTime.Now;
            await _ctx.SaveChangesAsync();
        }

        // ════════════════════════════════════════════════════════════════════════
        //  ÖDEME EKLE (TAHSİLAT)
        // ════════════════════════════════════════════════════════════════════════

        public async Task<CustomerDebtPaymentDto> AddPaymentAsync(
            int tenantId, int userId, int debtId, CreateDebtPaymentDto dto)
        {
            var debt = await _ctx.CustomerDebts
                .FirstOrDefaultAsync(d => d.Id == debtId && d.TenantId == tenantId && d.IsActive == true)
                ?? throw new Exception("Borç/alacak kaydı bulunamadı.");

            if (debt.Status == "Paid")
                throw new Exception("Bu borç/alacak zaten tamamen ödenmiş.");

            if (debt.Status == "Cancelled")
                throw new Exception("İptal edilmiş borç/alacak için ödeme yapılamaz.");

            var payment = new CustomerDebtPayment
            {
                TenantId       = tenantId,
                CustomerDebtId = debtId,
                Amount         = dto.Amount,
                PaymentMethod  = dto.PaymentMethod,
                Notes          = dto.Notes,
                PaymentDate    = dto.PaymentDate ?? DateTime.Now,
                IsActive       = true,
                CDate          = DateTime.Now,
                CUser          = userId
            };

            _ctx.CustomerDebtPayments.Add(payment);

            // Update paid amount
            debt.PaidAmount += dto.Amount;
            RecalculateStatus(debt);
            debt.UDate = DateTime.Now;
            debt.UUser = userId;

            await _ctx.SaveChangesAsync();

            return new CustomerDebtPaymentDto
            {
                Id             = payment.Id,
                CustomerDebtId = payment.CustomerDebtId,
                Amount         = payment.Amount,
                PaymentMethod  = payment.PaymentMethod,
                Notes          = payment.Notes,
                PaymentDate    = payment.PaymentDate,
                CDate          = payment.CDate
            };
        }

        // ════════════════════════════════════════════════════════════════════════
        //  ÖZET
        // ════════════════════════════════════════════════════════════════════════

        public async Task<CustomerDebtSummaryDto> GetSummaryAsync(int tenantId, string? type = null)
        {
            var query = _ctx.CustomerDebts
                .Where(d => d.TenantId == tenantId && d.IsActive == true);

            if (!string.IsNullOrEmpty(type))
                query = query.Where(d => d.Type == type);

            var debts = await query
                .Select(d => new { d.Amount, d.PaidAmount, d.Status })
                .ToListAsync();

            return new CustomerDebtSummaryDto
            {
                TotalAmount    = debts.Sum(d => d.Amount),
                TotalPaid      = debts.Sum(d => d.PaidAmount),
                TotalRemaining = debts.Sum(d => d.Amount - d.PaidAmount),
                TotalCount     = debts.Count,
                PendingCount   = debts.Count(d => d.Status == "Pending"),
                PartialCount   = debts.Count(d => d.Status == "PartiallyPaid"),
                PaidCount      = debts.Count(d => d.Status == "Paid"),
                OverdueCount   = debts.Count(d => d.Status == "Overdue")
            };
        }

        // ════════════════════════════════════════════════════════════════════════
        //  TAHSİLAT LİSTESİ (tüm ödemeler)
        // ════════════════════════════════════════════════════════════════════════

        public async Task<PaginatedResponse<CollectionListDto>> GetCollectionsAsync(
            int tenantId, DateTime? startDate = null, DateTime? endDate = null,
            string? search = null, string? paymentMethod = null,
            int page = 1, int pageSize = 20)
        {
            var query = _ctx.CustomerDebtPayments
                .Include(p => p.CustomerDebt)
                    .ThenInclude(d => d.Customer)
                .Where(p => p.TenantId == tenantId && p.IsActive == true &&
                       p.CustomerDebt.IsActive == true);

            if (startDate.HasValue)
                query = query.Where(p => p.PaymentDate.Date >= startDate.Value.Date);

            if (endDate.HasValue)
                query = query.Where(p => p.PaymentDate.Date <= endDate.Value.Date);

            if (!string.IsNullOrEmpty(paymentMethod))
                query = query.Where(p => p.PaymentMethod == paymentMethod);

            if (!string.IsNullOrEmpty(search))
            {
                var s = search.ToLower();
                query = query.Where(p =>
                    (p.CustomerDebt.Customer != null &&
                     (p.CustomerDebt.Customer.Name + " " + p.CustomerDebt.Customer.Surname).ToLower().Contains(s)) ||
                    (p.CustomerDebt.PersonName != null && p.CustomerDebt.PersonName.ToLower().Contains(s)));
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(p => p.PaymentDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new CollectionListDto
                {
                    Id              = p.Id,
                    CustomerDebtId  = p.CustomerDebtId,
                    CustomerName    = p.CustomerDebt.Customer != null
                        ? p.CustomerDebt.Customer.Name + " " + p.CustomerDebt.Customer.Surname
                        : null,
                    PersonName      = p.CustomerDebt.PersonName,
                    DebtDescription = p.CustomerDebt.Description,
                    DebtType        = p.CustomerDebt.Type,
                    Amount          = p.Amount,
                    PaymentMethod   = p.PaymentMethod,
                    Notes           = p.Notes,
                    PaymentDate     = p.PaymentDate,
                    Source          = p.CustomerDebt.Source,
                    CDate           = p.CDate
                })
                .ToListAsync();

            return new PaginatedResponse<CollectionListDto>
            {
                Items      = items,
                TotalCount = totalCount,
                PageNumber = page,
                PageSize   = pageSize
            };
        }

        // ════════════════════════════════════════════════════════════════════════
        //  PRIVATE HELPERS
        // ════════════════════════════════════════════════════════════════════════

        private static void RecalculateStatus(CustomerDebt debt)
        {
            if (debt.Status == "Cancelled") return;

            if (debt.PaidAmount >= debt.Amount)
                debt.Status = "Paid";
            else if (debt.PaidAmount > 0)
                debt.Status = "PartiallyPaid";
            else if (debt.DueDate.HasValue && debt.DueDate.Value < DateTime.Now)
                debt.Status = "Overdue";
            else
                debt.Status = "Pending";
        }

        private static CustomerDebtDto MapDebt(CustomerDebt d) => new()
        {
            Id                   = d.Id,
            TenantId             = d.TenantId,
            CustomerId           = d.CustomerId,
            CustomerName         = d.Customer != null ? d.Customer.Name + " " + d.Customer.Surname : null,
            CustomerPhone        = d.Customer?.Phone,
            PersonName           = d.PersonName,
            Type                 = d.Type,
            Amount               = d.Amount,
            PaidAmount           = d.PaidAmount,
            RemainingAmount      = d.Amount - d.PaidAmount,
            Currency             = d.Currency,
            Description          = d.Description,
            Notes                = d.Notes,
            DueDate              = d.DueDate,
            Status               = d.Status,
            RelatedAppointmentId = d.RelatedAppointmentId,
            RelatedPackageSaleId = d.RelatedPackageSaleId,
            Source               = d.Source,
            CDate                = d.CDate,
            Payments             = d.Payments.Where(p => p.IsActive == true).Select(p => new CustomerDebtPaymentDto
            {
                Id             = p.Id,
                CustomerDebtId = p.CustomerDebtId,
                Amount         = p.Amount,
                PaymentMethod  = p.PaymentMethod,
                Notes          = p.Notes,
                PaymentDate    = p.PaymentDate,
                CDate          = p.CDate
            }).OrderByDescending(p => p.PaymentDate).ToList()
        };
    }
}
