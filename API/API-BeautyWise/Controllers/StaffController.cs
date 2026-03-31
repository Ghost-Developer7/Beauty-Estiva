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
        private readonly IRoleManagementService _roleManagementService;

        public StaffController(IStaffService staffService, IRoleManagementService roleManagementService)
        {
            _staffService = staffService;
            _roleManagementService = roleManagementService;
        }

        private int GetTenantId() => int.Parse(User.FindFirstValue("tenantId")!);
        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        /// <summary>
        /// List all staff members (users) belonging to the current tenant
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Owner,Admin,Staff")]
        public async Task<IActionResult> GetAll(
            [FromQuery] int? pageNumber = null,
            [FromQuery] int? pageSize   = null)
        {
            try
            {
                if (pageNumber.HasValue || pageSize.HasValue)
                {
                    var pn = pageNumber ?? 1;
                    var ps = pageSize ?? 20;
                    var result = await _staffService.GetStaffListPaginatedAsync(GetTenantId(), pn, ps);
                    return Ok(ApiResponse<PaginatedResponse<StaffListDto>>.Ok(result));
                }
                else
                {
                    var staff = await _staffService.GetStaffListAsync(GetTenantId());
                    return Ok(ApiResponse<List<StaffListDto>>.Ok(staff));
                }
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

        /// <summary>
        /// Bir personelin rolünü değiştirir (SuperAdmin veya Owner yetkisi gerekir)
        /// </summary>
        [HttpPut("{id}/role")]
        [Authorize(Roles = "SuperAdmin,Owner")]
        public async Task<IActionResult> ChangeRole(int id, [FromBody] ChangeRoleRequestDto dto)
        {
            try
            {
                dto.TargetUserId = id;
                var result = await _roleManagementService.ChangeUserRoleAsync(GetTenantId(), GetUserId(), dto);
                return Ok(ApiResponse<StaffListDto>.Ok(result));
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, ApiResponse<object>.Fail(
                    ex.Message == "CANNOT_ASSIGN_THIS_ROLE"
                        ? "Bu rolü atama yetkiniz yok."
                        : "Bu işlem için yetkiniz yok.",
                    ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                var message = ex.Message switch
                {
                    "INVALID_ROLE" => "Geçersiz rol.",
                    "USER_NOT_FOUND" => "Kullanıcı bulunamadı.",
                    "CANNOT_CHANGE_OWN_ROLE" => "Kendi rolünüzü değiştiremezsiniz.",
                    "ALREADY_HAS_ROLE" => "Kullanıcı zaten bu role sahip.",
                    "LAST_OWNER_CANNOT_BE_CHANGED" => "Mağazanın son sahibinin rolü değiştirilemez.",
                    _ => "Rol değişikliği sırasında bir hata oluştu."
                };
                return BadRequest(ApiResponse<object>.Fail(message, ex.Message));
            }
            catch (Exception)
            {
                return BadRequest(ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Bir personele rol ekler veya kaldırır (toggle). Çoklu rol desteği.
        /// </summary>
        [HttpPost("{id}/role/toggle")]
        [Authorize(Roles = "SuperAdmin,Owner")]
        public async Task<IActionResult> ToggleRole(int id, [FromBody] ToggleRoleRequestDto dto)
        {
            try
            {
                var result = await _roleManagementService.ToggleRoleAsync(GetTenantId(), GetUserId(), id, dto);
                return Ok(ApiResponse<StaffListDto>.Ok(result));
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, ApiResponse<object>.Fail(
                    ex.Message == "CANNOT_ASSIGN_THIS_ROLE"
                        ? "Bu rolü atama yetkiniz yok."
                        : "Bu işlem için yetkiniz yok.",
                    ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                var message = ex.Message switch
                {
                    "INVALID_ROLE" => "Geçersiz rol.",
                    "USER_NOT_FOUND" => "Kullanıcı bulunamadı.",
                    "CANNOT_CHANGE_OWN_ROLE" => "Kendi rolünüzü değiştiremezsiniz.",
                    "LAST_OWNER_CANNOT_BE_CHANGED" => "Mağazanın son sahibinin rolü değiştirilemez.",
                    "MUST_HAVE_AT_LEAST_ONE_ROLE" => "Kullanıcının en az bir rolü olmalıdır.",
                    _ => "Rol değişikliği sırasında bir hata oluştu."
                };
                return BadRequest(ApiResponse<object>.Fail(message, ex.Message));
            }
            catch (Exception)
            {
                return BadRequest(ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }
    }
}
