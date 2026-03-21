namespace API_BeautyWise.DTO
{
    public class TreatmentCreateDto
    {
        public string Name { get; set; } = "";
        public string? Description { get; set; }
        public int DurationMinutes { get; set; }
        public decimal? Price { get; set; }
        public string? Color { get; set; }
    }

    public class TreatmentUpdateDto
    {
        public string Name { get; set; } = "";
        public string? Description { get; set; }
        public int DurationMinutes { get; set; }
        public decimal? Price { get; set; }
        public string? Color { get; set; }
    }

    public class TreatmentListDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string? Description { get; set; }
        public int DurationMinutes { get; set; }
        public decimal? Price { get; set; }
        public string? Color { get; set; }
    }
}
