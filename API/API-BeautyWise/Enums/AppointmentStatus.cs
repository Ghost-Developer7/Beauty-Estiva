namespace API_BeautyWise.Enums
{
    public enum AppointmentStatus
    {
        Scheduled = 1,  // Planlandı
        Confirmed = 2,  // Onaylandı
        Completed = 3,  // Tamamlandı
        Cancelled = 4,  // İptal Edildi
        NoShow    = 5   // Müşteri Gelmedi
    }
}
