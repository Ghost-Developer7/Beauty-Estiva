using API_BeautyWise.DTO;
using API_BeautyWise.Enums;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace API_BeautyWise.Services
{
    public class ProductService : IProductService
    {
        private readonly Context _ctx;
        public ProductService(Context ctx) => _ctx = ctx;

        // ════════════════════════════════════════
        //  PRODUCTS
        // ════════════════════════════════════════

        public async Task<List<ProductListDto>> GetAllProductsAsync(int tenantId)
        {
            return await _ctx.Products
                .Where(p => p.TenantId == tenantId && p.IsActive == true)
                .OrderBy(p => p.Name)
                .Select(p => MapProduct(p))
                .ToListAsync();
        }

        public async Task<ProductListDto?> GetProductByIdAsync(int id, int tenantId)
        {
            var p = await _ctx.Products
                .FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId && x.IsActive == true);
            return p == null ? null : MapProduct(p);
        }

        public async Task<int> CreateProductAsync(int tenantId, int userId, ProductCreateDto dto)
        {
            var product = new Product
            {
                TenantId      = tenantId,
                Name          = dto.Name,
                Description   = dto.Description,
                Barcode       = dto.Barcode,
                Price         = dto.Price,
                StockQuantity = dto.StockQuantity,
                CUser         = userId,
                CDate         = DateTime.UtcNow,
                IsActive      = true
            };
            _ctx.Products.Add(product);
            await _ctx.SaveChangesAsync();
            return product.Id;
        }

        public async Task UpdateProductAsync(int id, int tenantId, ProductUpdateDto dto)
        {
            var product = await _ctx.Products
                .FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId && x.IsActive == true)
                ?? throw new KeyNotFoundException("Ürün bulunamadı.");

            product.Name          = dto.Name;
            product.Description   = dto.Description;
            product.Barcode       = dto.Barcode;
            product.Price         = dto.Price;
            product.StockQuantity = dto.StockQuantity;
            product.UDate         = DateTime.UtcNow;

            await _ctx.SaveChangesAsync();
        }

        public async Task DeleteProductAsync(int id, int tenantId)
        {
            var product = await _ctx.Products
                .FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId && x.IsActive == true)
                ?? throw new KeyNotFoundException("Ürün bulunamadı.");

            product.IsActive = false;
            product.UDate    = DateTime.UtcNow;
            await _ctx.SaveChangesAsync();
        }

        // ════════════════════════════════════════
        //  PRODUCT SALES
        // ════════════════════════════════════════

        public async Task<List<ProductSaleListDto>> GetAllSalesAsync(
            int tenantId, DateTime? startDate = null, DateTime? endDate = null,
            int? staffId = null, int? customerId = null)
        {
            var query = _ctx.ProductSales
                .Include(s => s.Product)
                .Include(s => s.Customer)
                .Include(s => s.Staff)
                .Include(s => s.Currency)
                .Where(s => s.TenantId == tenantId && s.IsActive == true);

            if (startDate.HasValue)
                query = query.Where(s => s.SaleDate.Date >= startDate.Value.Date);
            if (endDate.HasValue)
                query = query.Where(s => s.SaleDate.Date <= endDate.Value.Date);
            if (staffId.HasValue)
                query = query.Where(s => s.StaffId == staffId.Value);
            if (customerId.HasValue)
                query = query.Where(s => s.CustomerId == customerId.Value);

            return await query
                .OrderByDescending(s => s.SaleDate)
                .Select(s => MapSale(s))
                .ToListAsync();
        }

        public async Task<PaginatedResponse<ProductSaleListDto>> GetAllSalesPaginatedAsync(
            int tenantId, int pageNumber, int pageSize,
            DateTime? startDate = null, DateTime? endDate = null,
            int? staffId = null, int? customerId = null)
        {
            var query = _ctx.ProductSales
                .Include(s => s.Product)
                .Include(s => s.Customer)
                .Include(s => s.Staff)
                .Include(s => s.Currency)
                .Where(s => s.TenantId == tenantId && s.IsActive == true);

            if (startDate.HasValue)
                query = query.Where(s => s.SaleDate.Date >= startDate.Value.Date);
            if (endDate.HasValue)
                query = query.Where(s => s.SaleDate.Date <= endDate.Value.Date);
            if (staffId.HasValue)
                query = query.Where(s => s.StaffId == staffId.Value);
            if (customerId.HasValue)
                query = query.Where(s => s.CustomerId == customerId.Value);

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(s => s.SaleDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(s => MapSale(s))
                .ToListAsync();

            return new PaginatedResponse<ProductSaleListDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<ProductSaleListDto?> GetSaleByIdAsync(int id, int tenantId)
        {
            var s = await _ctx.ProductSales
                .Include(x => x.Product)
                .Include(x => x.Customer)
                .Include(x => x.Staff)
                .Include(x => x.Currency)
                .FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId && x.IsActive == true);
            return s == null ? null : MapSale(s);
        }

        public async Task<int> CreateSaleAsync(int tenantId, int staffId, ProductSaleCreateDto dto)
        {
            var product = await _ctx.Products
                .FirstOrDefaultAsync(p => p.Id == dto.ProductId && p.TenantId == tenantId && p.IsActive == true)
                ?? throw new KeyNotFoundException("Ürün bulunamadı.");

            var currency = await _ctx.Currencies
                .FirstOrDefaultAsync(c => c.Id == dto.CurrencyId && c.IsActive)
                ?? throw new KeyNotFoundException("Para birimi bulunamadı.");

            if (dto.CustomerId.HasValue)
            {
                var customer = await _ctx.Customers
                    .FirstOrDefaultAsync(c => c.Id == dto.CustomerId.Value && c.TenantId == tenantId && c.IsActive == true)
                    ?? throw new KeyNotFoundException("Müşteri bulunamadı.");
            }

            var totalAmount = product.Price * dto.Quantity;
            var amountInTry = totalAmount * dto.ExchangeRateToTry;

            var sale = new ProductSale
            {
                TenantId          = tenantId,
                ProductId         = dto.ProductId,
                CustomerId        = dto.CustomerId,
                StaffId           = staffId,
                Quantity          = dto.Quantity,
                UnitPrice         = product.Price,
                TotalAmount       = totalAmount,
                CurrencyId        = dto.CurrencyId,
                ExchangeRateToTry = dto.ExchangeRateToTry,
                AmountInTry       = amountInTry,
                PaymentMethod     = dto.PaymentMethod,
                SaleDate          = dto.SaleDate ?? DateTime.UtcNow,
                Notes             = dto.Notes,
                CUser             = staffId,
                CDate             = DateTime.UtcNow,
                IsActive          = true
            };

            _ctx.ProductSales.Add(sale);

            // Stok düş
            product.StockQuantity = Math.Max(0, product.StockQuantity - dto.Quantity);
            product.UDate = DateTime.UtcNow;

            await _ctx.SaveChangesAsync();
            return sale.Id;
        }

        public async Task UpdateSaleAsync(int id, int tenantId, ProductSaleUpdateDto dto)
        {
            var sale = await _ctx.ProductSales
                .Include(s => s.Product)
                .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId && s.IsActive == true)
                ?? throw new KeyNotFoundException("Satış kaydı bulunamadı.");

            // Stok farkını hesapla
            var oldQty = sale.Quantity;
            var newQty = dto.Quantity;
            sale.Product.StockQuantity = Math.Max(0, sale.Product.StockQuantity + oldQty - newQty);

            sale.Quantity          = dto.Quantity;
            sale.TotalAmount       = sale.UnitPrice * dto.Quantity;
            sale.CurrencyId        = dto.CurrencyId;
            sale.ExchangeRateToTry = dto.ExchangeRateToTry;
            sale.AmountInTry       = sale.TotalAmount * dto.ExchangeRateToTry;
            sale.PaymentMethod     = dto.PaymentMethod;
            sale.SaleDate          = dto.SaleDate ?? sale.SaleDate;
            sale.Notes             = dto.Notes;
            sale.UDate             = DateTime.UtcNow;

            await _ctx.SaveChangesAsync();
        }

        public async Task DeleteSaleAsync(int id, int tenantId)
        {
            var sale = await _ctx.ProductSales
                .Include(s => s.Product)
                .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId && s.IsActive == true)
                ?? throw new KeyNotFoundException("Satış kaydı bulunamadı.");

            // Stok iade
            sale.Product.StockQuantity += sale.Quantity;
            sale.Product.UDate = DateTime.UtcNow;

            sale.IsActive = false;
            sale.UDate    = DateTime.UtcNow;
            await _ctx.SaveChangesAsync();
        }

        // ════════════════════════════════════════
        //  MAPPERS
        // ════════════════════════════════════════

        private static ProductListDto MapProduct(Product p) => new()
        {
            Id            = p.Id,
            Name          = p.Name,
            Description   = p.Description,
            Barcode       = p.Barcode,
            Price         = p.Price,
            StockQuantity = p.StockQuantity
        };

        private static string PaymentMethodDisplayName(PaymentMethod m) => m switch
        {
            PaymentMethod.Cash         => "Nakit",
            PaymentMethod.CreditCard   => "Kredi / Banka Kartı",
            PaymentMethod.BankTransfer => "Havale / EFT",
            PaymentMethod.Check        => "Çek",
            _                          => "Diğer"
        };

        private static ProductSaleListDto MapSale(ProductSale s) => new()
        {
            Id                   = s.Id,
            ProductId            = s.ProductId,
            ProductName          = s.Product?.Name ?? "",
            CustomerId           = s.CustomerId,
            CustomerFullName     = s.Customer != null ? $"{s.Customer.Name} {s.Customer.Surname}" : null,
            StaffId              = s.StaffId,
            StaffFullName        = s.Staff != null ? $"{s.Staff.Name} {s.Staff.Surname}" : "",
            Quantity             = s.Quantity,
            UnitPrice            = s.UnitPrice,
            TotalAmount          = s.TotalAmount,
            CurrencyCode         = s.Currency?.Code ?? "TRY",
            CurrencySymbol       = s.Currency?.Symbol ?? "₺",
            ExchangeRateToTry    = s.ExchangeRateToTry,
            AmountInTry          = s.AmountInTry,
            PaymentMethodValue   = (int)s.PaymentMethod,
            PaymentMethodDisplay = PaymentMethodDisplayName(s.PaymentMethod),
            SaleDate             = s.SaleDate,
            Notes                = s.Notes
        };
    }
}
