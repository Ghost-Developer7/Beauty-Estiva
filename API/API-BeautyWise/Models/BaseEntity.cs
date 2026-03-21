namespace API_BeautyWise.Models
{
    public class BaseEntity
    {
        public int? CUser { get; set; }
        public int? UUser { get; set; }
        public DateTime? CDate { get; set; }
        public DateTime? UDate { get; set; }
        public bool? IsActive { get; set; }
    }
}
