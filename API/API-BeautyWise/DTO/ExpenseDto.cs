using System.ComponentModel.DataAnnotations;

namespace API_BeautyWise.DTO
{
    // ─── Expense Category ────────────────────────────────────────────────────────

    public class ExpenseCategoryCreateDto
    {
        [Required(ErrorMessage = "Kategori adı gereklidir.")]
        [StringLength(100, ErrorMessage = "Kategori adı en fazla 100 karakter olabilir.")]
        public string  Name  { get; set; } = null!;

        [StringLength(7)]
        public string? Color { get; set; }   // #FF5733
    }

    public class ExpenseCategoryUpdateDto
    {
        [Required(ErrorMessage = "Kategori adı gereklidir.")]
        [StringLength(100)]
        public string  Name  { get; set; } = null!;

        [StringLength(7)]
        public string? Color { get; set; }
    }

    public class ExpenseCategoryListDto
    {
        public int     Id               { get; set; }
        public string  Name             { get; set; } = null!;
        public string? Color            { get; set; }
        public int     ExpenseCount     { get; set; }
        public decimal TotalAmountInTry { get; set; }
    }

    // ─── Expense ─────────────────────────────────────────────────────────────────

    public class ExpenseCreateDto
    {
        public int?     ExpenseCategoryId  { get; set; }

        [Range(0.01, 99999999.99, ErrorMessage = "Tutar geçerli bir değer olmalıdır.")]
        public decimal  Amount             { get; set; }

        public int      CurrencyId         { get; set; } = 1;
        public decimal  ExchangeRateToTry  { get; set; } = 1m;

        [StringLength(500)]
        public string   Description        { get; set; } = null!;

        public DateTime ExpenseDate        { get; set; }

        [StringLength(50)]
        public string?  ReceiptNumber      { get; set; }

        [StringLength(1000)]
        public string?  Notes              { get; set; }
    }

    public class ExpenseUpdateDto
    {
        public int?     ExpenseCategoryId  { get; set; }

        [Range(0.01, 99999999.99, ErrorMessage = "Tutar geçerli bir değer olmalıdır.")]
        public decimal  Amount             { get; set; }

        public int      CurrencyId         { get; set; }
        public decimal  ExchangeRateToTry  { get; set; } = 1m;

        [StringLength(500)]
        public string   Description        { get; set; } = null!;

        public DateTime ExpenseDate        { get; set; }

        [StringLength(50)]
        public string?  ReceiptNumber      { get; set; }

        [StringLength(1000)]
        public string?  Notes              { get; set; }
    }

    public class ExpenseListDto
    {
        public int      Id                { get; set; }
        public int?     ExpenseCategoryId { get; set; }
        public string?  CategoryName      { get; set; }
        public string?  CategoryColor     { get; set; }
        public decimal  Amount            { get; set; }
        public string   CurrencyCode      { get; set; } = null!;
        public string   CurrencySymbol    { get; set; } = null!;
        public decimal  ExchangeRateToTry { get; set; }
        public decimal  AmountInTry       { get; set; }
        public string   Description       { get; set; } = null!;
        public DateTime ExpenseDate       { get; set; }
        public string?  ReceiptNumber     { get; set; }
        public string?  Notes             { get; set; }
    }
}
