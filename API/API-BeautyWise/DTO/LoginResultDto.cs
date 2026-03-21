namespace API_BeautyWise.DTO
{
    public class LoginResultDto
    {
        public string Token { get; set; } = "";
        public string Name { get; set; } = "";
        public string Surname { get; set; } = "";
        public string Email { get; set; } = "";
        public List<string> Roles { get; set; } = new();
    }
}
