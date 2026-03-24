using System.ComponentModel.DataAnnotations;

namespace API_BeautyWise.DTO
{
    // ─── Product ───

    public class ProductCreateDto
    {
        [Required(ErrorMessage = "Ürün adı zorunludur.")]
        [StringLength(200)]
        public string Name { get; set; } = "";

        [StringLength(1000)]
        public string? Description { get; set; }

        [StringLength(50)]
        public string? Barcode { get; set; }

        [Range(0, 999999.99, ErrorMessage = "Fiyat geçerli bir değer olmalıdır.")]
        public decimal Price { get; set; }

        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; } = 0;
    }

    public class ProductUpdateDto
    {
        [Required(ErrorMessage = "Ürün adı zorunludur.")]
        [StringLength(200)]
        public string Name { get; set; } = "";

        [StringLength(1000)]
        public string? Description { get; set; }

        [StringLength(50)]
        public string? Barcode { get; set; }

        [Range(0, 999999.99)]
        public decimal Price { get; set; }

        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; }
    }

    public class ProductListDto
    {
        public int     Id            { get; set; }
        public string  Name          { get; set; } = "";
        public string? Description   { get; set; }
        public string? Barcode       { get; set; }
        public decimal Price         { get; set; }
        public int     StockQuantity { get; set; }
    }

    // ─── ProductSale ───

    public class ProductSaleCreateDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Ürün seçimi zorunludur.")]
        public int ProductId { get; set; }

        public int? CustomerId { get; set; }

        [Range(1, 9999, ErrorMessage = "Adet en az 1 olmalıdır.")]
        public int Quantity { get; set; } = 1;

        public int     CurrencyId        { get; set; } = 1;
        public decimal ExchangeRateToTry { get; set; } = 1m;

        public API_BeautyWise.Enums.PaymentMethod PaymentMethod { get; set; } = API_BeautyWise.Enums.PaymentMethod.Cash;

        public DateTime? SaleDate { get; set; }

        [StringLength(1000)]
        public string? Notes { get; set; }
    }

    public class ProductSaleUpdateDto
    {
        [Range(1, 9999)]
        public int Quantity { get; set; } = 1;

        public int     CurrencyId        { get; set; }
        public decimal ExchangeRateToTry { get; set; } = 1m;

        public API_BeautyWise.Enums.PaymentMethod PaymentMethod { get; set; }

        public DateTime? SaleDate { get; set; }

        [StringLength(1000)]
        public string? Notes { get; set; }
    }

    public class ProductSaleListDto
    {
        public int      Id                    { get; set; }
        public int      ProductId             { get; set; }
        public string   ProductName           { get; set; } = "";
        public int?     CustomerId            { get; set; }
        public string?  CustomerFullName      { get; set; }
        public int      StaffId               { get; set; }
        public string   StaffFullName         { get; set; } = "";
        public int      Quantity              { get; set; }
        public decimal  UnitPrice             { get; set; }
        public decimal  TotalAmount           { get; set; }
        public string   CurrencyCode          { get; set; } = "";
        public string   CurrencySymbol        { get; set; } = "";
        public decimal  ExchangeRateToTry     { get; set; }
        public decimal  AmountInTry           { get; set; }
        public int      PaymentMethodValue    { get; set; }
        public string   PaymentMethodDisplay  { get; set; } = "";
        public DateTime SaleDate              { get; set; }
        public string?  Notes                 { get; set; }
    }
}
