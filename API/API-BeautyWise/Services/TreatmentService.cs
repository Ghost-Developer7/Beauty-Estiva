using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace API_BeautyWise.Services
{
    public class TreatmentService : ITreatmentService
    {
        private readonly Context _context;

        public TreatmentService(Context context)
        {
            _context = context;
        }

        public async Task<List<TreatmentListDto>> GetAllAsync(int tenantId)
        {
            return await _context.Treatments
                .Where(t => t.TenantId == tenantId && t.IsActive == true)
                .OrderBy(t => t.Name)
                .Select(t => new TreatmentListDto
                {
                    Id              = t.Id,
                    Name            = t.Name,
                    Description     = t.Description,
                    DurationMinutes = t.DurationMinutes,
                    Price           = t.Price,
                    Color           = t.Color
                })
                .ToListAsync();
        }

        public async Task<PaginatedResponse<TreatmentListDto>> GetAllPaginatedAsync(int tenantId, int pageNumber, int pageSize)
        {
            var query = _context.Treatments
                .Where(t => t.TenantId == tenantId && t.IsActive == true);

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderBy(t => t.Name)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(t => new TreatmentListDto
                {
                    Id              = t.Id,
                    Name            = t.Name,
                    Description     = t.Description,
                    DurationMinutes = t.DurationMinutes,
                    Price           = t.Price,
                    Color           = t.Color
                })
                .ToListAsync();

            return new PaginatedResponse<TreatmentListDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<TreatmentListDto?> GetByIdAsync(int id, int tenantId)
        {
            return await _context.Treatments
                .Where(t => t.Id == id && t.TenantId == tenantId && t.IsActive == true)
                .Select(t => new TreatmentListDto
                {
                    Id              = t.Id,
                    Name            = t.Name,
                    Description     = t.Description,
                    DurationMinutes = t.DurationMinutes,
                    Price           = t.Price,
                    Color           = t.Color
                })
                .FirstOrDefaultAsync();
        }

        public async Task<int> CreateAsync(int tenantId, TreatmentCreateDto dto)
        {
            if (dto.DurationMinutes <= 0)
                throw new Exception("INVALID_DURATION|Süre 0'dan büyük olmalıdır.");

            var treatment = new Treatment
            {
                TenantId        = tenantId,
                Name            = dto.Name,
                Description     = dto.Description,
                DurationMinutes = dto.DurationMinutes,
                Price           = dto.Price,
                Color           = dto.Color,
                IsActive        = true,
                CDate           = DateTime.Now
            };

            _context.Treatments.Add(treatment);
            await _context.SaveChangesAsync();
            return treatment.Id;
        }

        public async Task<bool> UpdateAsync(int id, int tenantId, TreatmentUpdateDto dto)
        {
            var treatment = await _context.Treatments
                .FirstOrDefaultAsync(t => t.Id == id && t.TenantId == tenantId && t.IsActive == true);

            if (treatment == null)
                throw new Exception("NOT_FOUND|Hizmet bulunamadı.");

            if (dto.DurationMinutes <= 0)
                throw new Exception("INVALID_DURATION|Süre 0'dan büyük olmalıdır.");

            treatment.Name            = dto.Name;
            treatment.Description     = dto.Description;
            treatment.DurationMinutes = dto.DurationMinutes;
            treatment.Price           = dto.Price;
            treatment.Color           = dto.Color;
            treatment.UDate           = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id, int tenantId)
        {
            var treatment = await _context.Treatments
                .FirstOrDefaultAsync(t => t.Id == id && t.TenantId == tenantId && t.IsActive == true);

            if (treatment == null)
                throw new Exception("NOT_FOUND|Hizmet bulunamadı.");

            // Gelecekte bu hizmetle randevu var mı?
            var hasActiveAppointments = await _context.Appointments
                .AnyAsync(a => a.TreatmentId == id && a.TenantId == tenantId
                            && a.IsActive == true && a.StartTime > DateTime.Now
                            && a.Status != Enums.AppointmentStatus.Cancelled);

            if (hasActiveAppointments)
                throw new Exception("HAS_ACTIVE_APPOINTMENTS|Bu hizmetle planlanmış randevular var. Önce randevuları iptal edin.");

            treatment.IsActive = false;
            treatment.UDate    = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
