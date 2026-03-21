namespace API_BeautyWise.Models
{
    /// <summary>
    /// İşletme gider kaydı.
    /// Kira, malzeme, elektrik, personel ödemeleri vb.
    /// </summary>
    public class Expense : BaseEntity
    {
        public int      Id                 { get; set; }
        public int      TenantId           { get; set; }
        public int?     ExpenseCategoryId  { get; set; }   // null = kategorisiz

        public decimal  Amount             { get; set; }               // Gider tutarı (orijinal para birimi)
        public int      CurrencyId         { get; set; }
        public decimal  ExchangeRateToTry  { get; set; } = 1m;        // Kur
        public decimal  AmountInTry        { get; set; }               // Amount * ExchangeRateToTry

        public string   Description        { get; set; } = null!;     // Gider açıklaması
        public DateTime ExpenseDate        { get; set; }               // Giderin gerçekleştiği tarih
        public string?  ReceiptNumber      { get; set; }               // Fiş / fatura numarası
        public string?  Notes              { get; set; }

        // Navigation
        public Tenant           Tenant          { get; set; } = null!;
        public ExpenseCategory? ExpenseCategory { get; set; }
        public Currency         Currency        { get; set; } = null!;
    }
}
