using API_BeautyWise.Enums;

namespace API_BeautyWise.Models
{
    /// <summary>
    /// Ürün satış kaydı.
    /// </summary>
    public class ProductSale : BaseEntity
    {
        public int Id       { get; set; }
        public int TenantId { get; set; }

        public int  ProductId  { get; set; }
        public int? CustomerId { get; set; }   // null = isimsiz müşteri
        public int  StaffId    { get; set; }   // Satışı yapan personel

        public int     Quantity   { get; set; } = 1;
        public decimal UnitPrice  { get; set; }        // Satış anındaki birim fiyat (snapshot)
        public decimal TotalAmount { get; set; }       // Quantity * UnitPrice

        public int     CurrencyId        { get; set; }
        public decimal ExchangeRateToTry { get; set; } = 1m;
        public decimal AmountInTry       { get; set; }  // TotalAmount * ExchangeRateToTry

        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
        public DateTime      SaleDate      { get; set; } = DateTime.UtcNow;
        public string?       Notes         { get; set; }

        // Navigation
        public virtual Tenant    Tenant   { get; set; } = null!;
        public virtual Product   Product  { get; set; } = null!;
        public virtual Customer? Customer { get; set; }
        public virtual AppUser   Staff    { get; set; } = null!;
        public virtual Currency  Currency { get; set; } = null!;
    }
}
