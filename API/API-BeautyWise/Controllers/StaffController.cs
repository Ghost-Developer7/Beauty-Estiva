using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API_BeautyWise.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class StaffController : ControllerBase
    {
        private readonly IStaffService _staffService;

        public StaffController(IStaffService staffService)
        {
            _staffService = staffService;
        }

        private int GetTenantId() => int.Parse(User.FindFirstValue("tenantId")!);

        /// <summary>
        /// List all staff members (users) belonging to the current tenant
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Owner,Admin,Staff")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var staff = await _staffService.GetStaffListAsync(GetTenantId());
                return Ok(ApiResponse<List<StaffListDto>>.Ok(staff));
            }
            catch (Exception)
            {
                return BadRequest(ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Get a specific staff member by ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Roles = "Owner,Admin,Staff")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var staff = await _staffService.GetStaffByIdAsync(GetTenantId(), id);
                if (staff == null)
                    return NotFound(ApiResponse<object>.Fail("Personel bulunamadı.", "NOT_FOUND"));

                return Ok(ApiResponse<StaffListDto>.Ok(staff));
            }
            catch (Exception)
            {
                return BadRequest(ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }
    }
}
