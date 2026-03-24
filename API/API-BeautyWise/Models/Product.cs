namespace API_BeautyWise.Models
{
    /// <summary>
    /// Salonda satılan ürün (şampuan, krem, bakım seti vb.)
    /// </summary>
    public class Product : BaseEntity
    {
        public int    Id          { get; set; }
        public int    TenantId    { get; set; }

        public string  Name        { get; set; } = "";
        public string? Description { get; set; }
        public string? Barcode     { get; set; }

        public decimal Price          { get; set; }       // Birim fiyat
        public int     StockQuantity  { get; set; } = 0;  // Stok adedi

        // Navigation
        public virtual Tenant Tenant { get; set; } = null!;
        public virtual ICollection<ProductSale> ProductSales { get; set; } = new List<ProductSale>();
    }
}
