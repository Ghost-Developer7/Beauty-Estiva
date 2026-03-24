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
    public class BranchController : ControllerBase
    {
        private readonly IBranchService _branchService;

        public BranchController(IBranchService branchService)
        {
            _branchService = branchService;
        }

        private int GetTenantId() => int.Parse(User.FindFirstValue("tenantId")!);
        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        /// <summary>
        /// List all branches for the current tenant
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Owner,Admin,Staff")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var branches = await _branchService.GetBranchesAsync(GetTenantId());
                return Ok(ApiResponse<List<BranchListDto>>.Ok(branches));
            }
            catch (Exception)
            {
                return BadRequest(ApiResponse<object>.Fail("Subeler yuklenirken bir hata olustu."));
            }
        }

        /// <summary>
        /// Get branch details including assigned staff
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Roles = "Owner,Admin,Staff")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var branch = await _branchService.GetBranchByIdAsync(GetTenantId(), id);
                if (branch == null)
                    return NotFound(ApiResponse<object>.Fail("Sube bulunamadi.", "NOT_FOUND"));

                return Ok(ApiResponse<BranchDetailDto>.Ok(branch));
            }
            catch (Exception)
            {
                return BadRequest(ApiResponse<object>.Fail("Islem sirasinda bir hata olustu."));
            }
        }

        /// <summary>
        /// Create a new branch (checks subscription limit)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> Create([FromBody] CreateBranchDto dto)
        {
            try
            {
                var branch = await _branchService.CreateBranchAsync(GetTenantId(), dto, GetUserId());
                return Ok(ApiResponse<BranchListDto>.Ok(branch, "Sube basariyla olusturuldu."));
            }
            catch (InvalidOperationException ex) when (ex.Message == "BRANCH_LIMIT_REACHED")
            {
                return BadRequest(ApiResponse<object>.Fail(
                    "Paket limitinize ulastiniz. Daha fazla sube eklemek icin paketinizi yukseltmeniz gerekmektedir.",
                    "BRANCH_LIMIT_REACHED"));
            }
            catch (Exception)
            {
                return BadRequest(ApiResponse<object>.Fail("Sube olusturulurken bir hata olustu."));
            }
        }

        /// <summary>
        /// Update an existing branch
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateBranchDto dto)
        {
            try
            {
                var branch = await _branchService.UpdateBranchAsync(GetTenantId(), id, dto, GetUserId());
                if (branch == null)
                    return NotFound(ApiResponse<object>.Fail("Sube bulunamadi.", "NOT_FOUND"));

                return Ok(ApiResponse<BranchListDto>.Ok(branch, "Sube basariyla guncellendi."));
            }
            catch (Exception)
            {
                return BadRequest(ApiResponse<object>.Fail("Sube guncellenirken bir hata olustu."));
            }
        }

        /// <summary>
        /// Deactivate a branch (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> Deactivate(int id)
        {
            try
            {
                var result = await _branchService.DeactivateBranchAsync(GetTenantId(), id, GetUserId());
                if (!result)
                    return NotFound(ApiResponse<object>.Fail("Sube bulunamadi.", "NOT_FOUND"));

                return Ok(ApiResponse<object>.Ok(null!, "Sube basariyla pasife alindi."));
            }
            catch (InvalidOperationException ex) when (ex.Message == "CANNOT_DEACTIVATE_MAIN_BRANCH")
            {
                return BadRequest(ApiResponse<object>.Fail(
                    "Ana sube pasife alinamaz. Oncelikle baska bir subeyi ana sube olarak atayin.",
                    "CANNOT_DEACTIVATE_MAIN_BRANCH"));
            }
            catch (Exception)
            {
                return BadRequest(ApiResponse<object>.Fail("Sube silinirken bir hata olustu."));
            }
        }

        /// <summary>
        /// Assign a staff member to a branch
        /// </summary>
        [HttpPost("{id}/assign-staff")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> AssignStaff(int id, [FromBody] AssignStaffToBranchDto dto)
        {
            try
            {
                var result = await _branchService.AssignStaffAsync(GetTenantId(), id, dto.StaffId, GetUserId());
                if (!result)
                    return NotFound(ApiResponse<object>.Fail("Sube veya personel bulunamadi.", "NOT_FOUND"));

                return Ok(ApiResponse<object>.Ok(null!, "Personel subeye basariyla atandi."));
            }
            catch (Exception)
            {
                return BadRequest(ApiResponse<object>.Fail("Personel atanirken bir hata olustu."));
            }
        }

        /// <summary>
        /// Remove a staff member from a branch
        /// </summary>
        [HttpDelete("{id}/remove-staff/{staffId}")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> RemoveStaff(int id, int staffId)
        {
            try
            {
                var result = await _branchService.RemoveStaffAsync(GetTenantId(), id, staffId, GetUserId());
                if (!result)
                    return NotFound(ApiResponse<object>.Fail("Personel bu subede bulunamadi.", "NOT_FOUND"));

                return Ok(ApiResponse<object>.Ok(null!, "Personel subeden basariyla cikarildi."));
            }
            catch (Exception)
            {
                return BadRequest(ApiResponse<object>.Fail("Personel cikarilirken bir hata olustu."));
            }
        }

        /// <summary>
        /// Get branch count limit info for the current tenant
        /// </summary>
        [HttpGet("limit")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> GetLimit()
        {
            try
            {
                var limit = await _branchService.GetBranchLimitAsync(GetTenantId());
                return Ok(ApiResponse<BranchLimitDto>.Ok(limit));
            }
            catch (Exception)
            {
                return BadRequest(ApiResponse<object>.Fail("Limit bilgisi alinirken bir hata olustu."));
            }
        }
    }
}
