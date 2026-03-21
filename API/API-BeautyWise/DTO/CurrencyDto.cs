namespace API_BeautyWise.DTO
{
    public class CurrencyListDto
    {
        public int    Id           { get; set; }
        public string Code         { get; set; } = null!;   // TRY
        public string Symbol       { get; set; } = null!;   // ₺
        public string Name         { get; set; } = null!;   // Türk Lirası
        public bool   IsDefault    { get; set; }
        public int    DisplayOrder { get; set; }
    }
}
