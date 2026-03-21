namespace API_BeautyWise.DTO
{
    public class StaffRegisterDto
    {
        public string InviteToken { get; init; } = default!;
        public string Email { get; init; } = default!;
        public string Password { get; init; } = default!;
        public string ConfirmPassword { get; init; } = default!;
        public string Name { get; init; } = default!;
        public string Surname { get; init; } = default!;
        public DateTime? BirthDate { get; init; }
    }
}
