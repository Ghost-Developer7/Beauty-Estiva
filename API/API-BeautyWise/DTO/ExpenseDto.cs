namespace API_BeautyWise.DTO
{
    // ─── Expense Category ────────────────────────────────────────────────────────

    public class ExpenseCategoryCreateDto
    {
        public string  Name  { get; set; } = null!;
        public string? Color { get; set; }   // #FF5733
    }

    public class ExpenseCategoryUpdateDto
    {
        public string  Name  { get; set; } = null!;
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
        public decimal  Amount             { get; set; }
        public int      CurrencyId         { get; set; } = 1;   // Varsayılan: TRY
        public decimal  ExchangeRateToTry  { get; set; } = 1m;
        public string   Description        { get; set; } = null!;
        public DateTime ExpenseDate        { get; set; }
        public string?  ReceiptNumber      { get; set; }
        public string?  Notes              { get; set; }
    }

    public class ExpenseUpdateDto
    {
        public int?     ExpenseCategoryId  { get; set; }
        public decimal  Amount             { get; set; }
        public int      CurrencyId         { get; set; }
        public decimal  ExchangeRateToTry  { get; set; } = 1m;
        public string   Description        { get; set; } = null!;
        public DateTime ExpenseDate        { get; set; }
        public string?  ReceiptNumber      { get; set; }
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
