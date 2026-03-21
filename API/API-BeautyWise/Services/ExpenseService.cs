using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace API_BeautyWise.Services
{
    public class ExpenseService : IExpenseService
    {
        private readonly Context _ctx;

        public ExpenseService(Context ctx) => _ctx = ctx;

        // ════════════════════════════════════════════════════════════════════════
        //  KATEGORİLER
        // ════════════════════════════════════════════════════════════════════════

        public async Task<List<ExpenseCategoryListDto>> GetCategoriesAsync(int tenantId)
        {
            var categories = await _ctx.ExpenseCategories
                .Where(c => c.TenantId == tenantId && c.IsActive == true)
                .OrderBy(c => c.Name)
                .ToListAsync();

            // Her kategori için gider toplamını hesapla
            var categoryIds = categories.Select(c => c.Id).ToList();
            var totals = await _ctx.Expenses
                .Where(e => e.TenantId == tenantId && e.IsActive == true && e.ExpenseCategoryId.HasValue)
                .GroupBy(e => e.ExpenseCategoryId!.Value)
                .Select(g => new { CategoryId = g.Key, Count = g.Count(), Total = g.Sum(e => e.AmountInTry) })
                .ToListAsync();

            return categories.Select(c =>
            {
                var t = totals.FirstOrDefault(x => x.CategoryId == c.Id);
                return new ExpenseCategoryListDto
                {
                    Id               = c.Id,
                    Name             = c.Name,
                    Color            = c.Color,
                    ExpenseCount     = t?.Count  ?? 0,
                    TotalAmountInTry = t?.Total  ?? 0
                };
            }).ToList();
        }

        public async Task<ExpenseCategoryListDto?> GetCategoryByIdAsync(int id, int tenantId)
        {
            var c = await _ctx.ExpenseCategories
                .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId && c.IsActive == true);

            if (c == null) return null;

            var stats = await _ctx.Expenses
                .Where(e => e.TenantId == tenantId && e.ExpenseCategoryId == id && e.IsActive == true)
                .GroupBy(e => 1)
                .Select(g => new { Count = g.Count(), Total = g.Sum(e => e.AmountInTry) })
                .FirstOrDefaultAsync();

            return new ExpenseCategoryListDto
            {
                Id               = c.Id,
                Name             = c.Name,
                Color            = c.Color,
                ExpenseCount     = stats?.Count ?? 0,
                TotalAmountInTry = stats?.Total ?? 0
            };
        }

        public async Task<int> CreateCategoryAsync(int tenantId, int userId, ExpenseCategoryCreateDto dto)
        {
            var cat = new ExpenseCategory
            {
                TenantId = tenantId,
                Name     = dto.Name,
                Color    = dto.Color,
                IsActive = true,
                CDate    = DateTime.Now,
                CUser    = userId
            };
            _ctx.ExpenseCategories.Add(cat);
            await _ctx.SaveChangesAsync();
            return cat.Id;
        }

        public async Task UpdateCategoryAsync(int id, int tenantId, ExpenseCategoryUpdateDto dto)
        {
            var cat = await _ctx.ExpenseCategories
                .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId && c.IsActive == true)
                ?? throw new Exception("Kategori bulunamadı.");

            cat.Name  = dto.Name;
            cat.Color = dto.Color;
            cat.UDate = DateTime.Now;
            await _ctx.SaveChangesAsync();
        }

        public async Task DeleteCategoryAsync(int id, int tenantId)
        {
            var cat = await _ctx.ExpenseCategories
                .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId && c.IsActive == true)
                ?? throw new Exception("Kategori bulunamadı.");

            cat.IsActive = false;
            cat.UDate    = DateTime.Now;
            await _ctx.SaveChangesAsync();
        }

        // ════════════════════════════════════════════════════════════════════════
        //  GİDERLER
        // ════════════════════════════════════════════════════════════════════════

        private static ExpenseListDto MapExpense(Expense e) => new()
        {
            Id                = e.Id,
            ExpenseCategoryId = e.ExpenseCategoryId,
            CategoryName      = e.ExpenseCategory?.Name,
            CategoryColor     = e.ExpenseCategory?.Color,
            Amount            = e.Amount,
            CurrencyCode      = e.Currency.Code,
            CurrencySymbol    = e.Currency.Symbol,
            ExchangeRateToTry = e.ExchangeRateToTry,
            AmountInTry       = e.AmountInTry,
            Description       = e.Description,
            ExpenseDate       = e.ExpenseDate,
            ReceiptNumber     = e.ReceiptNumber,
            Notes             = e.Notes
        };

        public async Task<List<ExpenseListDto>> GetAllAsync(
            int tenantId, DateTime? startDate = null, DateTime? endDate = null, int? categoryId = null)
        {
            var query = _ctx.Expenses
                .Include(e => e.Currency)
                .Include(e => e.ExpenseCategory)
                .Where(e => e.TenantId == tenantId && e.IsActive == true);

            if (startDate.HasValue) query = query.Where(e => e.ExpenseDate.Date >= startDate.Value.Date);
            if (endDate.HasValue)   query = query.Where(e => e.ExpenseDate.Date <= endDate.Value.Date);
            if (categoryId.HasValue) query = query.Where(e => e.ExpenseCategoryId == categoryId.Value);

            return await query
                .OrderByDescending(e => e.ExpenseDate)
                .Select(e => MapExpense(e))
                .ToListAsync();
        }

        public async Task<ExpenseListDto?> GetByIdAsync(int id, int tenantId)
        {
            var e = await _ctx.Expenses
                .Include(e => e.Currency)
                .Include(e => e.ExpenseCategory)
                .FirstOrDefaultAsync(e => e.Id == id && e.TenantId == tenantId && e.IsActive == true);

            return e == null ? null : MapExpense(e);
        }

        public async Task<int> CreateAsync(int tenantId, int userId, ExpenseCreateDto dto)
        {
            var currency = await _ctx.Currencies.FirstOrDefaultAsync(c => c.Id == dto.CurrencyId && c.IsActive)
                ?? throw new Exception("Geçersiz para birimi.");

            if (dto.ExpenseCategoryId.HasValue)
            {
                var catExists = await _ctx.ExpenseCategories.AnyAsync(c =>
                    c.Id == dto.ExpenseCategoryId && c.TenantId == tenantId && c.IsActive == true);
                if (!catExists) throw new Exception("Kategori bulunamadı.");
            }

            var expense = new Expense
            {
                TenantId          = tenantId,
                ExpenseCategoryId = dto.ExpenseCategoryId,
                Amount            = dto.Amount,
                CurrencyId        = dto.CurrencyId,
                ExchangeRateToTry = dto.ExchangeRateToTry,
                AmountInTry       = dto.Amount * dto.ExchangeRateToTry,
                Description       = dto.Description,
                ExpenseDate       = dto.ExpenseDate,
                ReceiptNumber     = dto.ReceiptNumber,
                Notes             = dto.Notes,
                IsActive          = true,
                CDate             = DateTime.Now,
                CUser             = userId
            };

            _ctx.Expenses.Add(expense);
            await _ctx.SaveChangesAsync();
            return expense.Id;
        }

        public async Task UpdateAsync(int id, int tenantId, ExpenseUpdateDto dto)
        {
            var expense = await _ctx.Expenses
                .FirstOrDefaultAsync(e => e.Id == id && e.TenantId == tenantId && e.IsActive == true)
                ?? throw new Exception("Gider kaydı bulunamadı.");

            var currency = await _ctx.Currencies.FirstOrDefaultAsync(c => c.Id == dto.CurrencyId && c.IsActive)
                ?? throw new Exception("Geçersiz para birimi.");

            if (dto.ExpenseCategoryId.HasValue)
            {
                var catExists = await _ctx.ExpenseCategories.AnyAsync(c =>
                    c.Id == dto.ExpenseCategoryId && c.TenantId == tenantId && c.IsActive == true);
                if (!catExists) throw new Exception("Kategori bulunamadı.");
            }

            expense.ExpenseCategoryId = dto.ExpenseCategoryId;
            expense.Amount            = dto.Amount;
            expense.CurrencyId        = dto.CurrencyId;
            expense.ExchangeRateToTry = dto.ExchangeRateToTry;
            expense.AmountInTry       = dto.Amount * dto.ExchangeRateToTry;
            expense.Description       = dto.Description;
            expense.ExpenseDate       = dto.ExpenseDate;
            expense.ReceiptNumber     = dto.ReceiptNumber;
            expense.Notes             = dto.Notes;
            expense.UDate             = DateTime.Now;

            await _ctx.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id, int tenantId)
        {
            var expense = await _ctx.Expenses
                .FirstOrDefaultAsync(e => e.Id == id && e.TenantId == tenantId && e.IsActive == true)
                ?? throw new Exception("Gider kaydı bulunamadı.");

            expense.IsActive = false;
            expense.UDate    = DateTime.Now;
            await _ctx.SaveChangesAsync();
        }
    }
}
