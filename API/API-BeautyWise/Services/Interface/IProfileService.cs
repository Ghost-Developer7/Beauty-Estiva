using API_BeautyWise.DTO;

namespace API_BeautyWise.Services.Interface
{
    public interface IProfileService
    {
        Task<ProfileDto> GetProfileAsync(int userId);
        Task<ProfileDto> UpdateProfileAsync(int userId, UpdateProfileDto dto);
        Task ChangePasswordAsync(int userId, ChangePasswordDto dto);
        Task<string> UploadProfilePictureAsync(int userId, IFormFile file);
        Task RemoveProfilePictureAsync(int userId);
    }
}
