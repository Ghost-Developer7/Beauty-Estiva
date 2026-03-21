namespace API_BeautyWise.Models
{
    /// <summary>
    /// Gider kategorisi. Tenant başına özelleştirilebilir.
    /// Örnek: Kira, Malzeme, Elektrik, Personel Maaşı, Reklam...
    /// </summary>
    public class ExpenseCategory : BaseEntity
    {
        public int     Id       { get; set; }
        public int     TenantId { get; set; }
        public string  Name     { get; set; } = null!;  // Kategori adı
        public string? Color    { get; set; }           // UI renk kodu: #FF5733

        // Navigation
        public Tenant             Tenant   { get; set; } = null!;
        public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    }
}
