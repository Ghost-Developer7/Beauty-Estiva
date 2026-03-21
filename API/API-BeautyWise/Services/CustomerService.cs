using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace API_BeautyWise.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly Context _context;

        public CustomerService(Context context)
        {
            _context = context;
        }

        public async Task<List<CustomerListDto>> GetAllAsync(int tenantId, string? search = null)
        {
            var query = _context.Customers
                .Where(c => c.TenantId == tenantId && c.IsActive == true);

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.ToLower();
                query = query.Where(c =>
                    c.Name.ToLower().Contains(search) ||
                    c.Surname.ToLower().Contains(search) ||
                    c.Phone.Contains(search));
            }

            var customers = await query
                .OrderBy(c => c.Name).ThenBy(c => c.Surname)
                .Select(c => new CustomerListDto
                {
                    Id       = c.Id,
                    Name     = c.Name,
                    Surname  = c.Surname,
                    Phone    = c.Phone,
                    Email    = c.Email,
                    TotalAppointments = c.Appointments.Count(a => a.IsActive == true),
                    LastAppointmentDate = c.Appointments
                        .Where(a => a.IsActive == true)
                        .OrderByDescending(a => a.StartTime)
                        .Select(a => (DateTime?)a.StartTime)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return customers;
        }

        public async Task<CustomerDetailDto?> GetByIdAsync(int id, int tenantId)
        {
            var customer = await _context.Customers
                .Where(c => c.Id == id && c.TenantId == tenantId && c.IsActive == true)
                .Select(c => new CustomerDetailDto
                {
                    Id      = c.Id,
                    Name    = c.Name,
                    Surname = c.Surname,
                    Phone   = c.Phone,
                    Email   = c.Email,
                    BirthDate = c.BirthDate,
                    Notes   = c.Notes,
                    CDate   = c.CDate,
                    TotalAppointments = c.Appointments.Count(a => a.IsActive == true),
                    RecentAppointments = c.Appointments
                        .Where(a => a.IsActive == true)
                        .OrderByDescending(a => a.StartTime)
                        .Take(5)
                        .Select(a => new CustomerAppointmentSummaryDto
                        {
                            Id            = a.Id,
                            StartTime     = a.StartTime,
                            TreatmentName = a.Treatment.Name,
                            StaffName     = a.Staff.Name + " " + a.Staff.Surname,
                            Status        = a.Status.ToString()
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync();

            return customer;
        }

        public async Task<int> CreateAsync(int tenantId, CustomerCreateDto dto)
        {
            // Aynı telefon numarasıyla kayıt var mı kontrol et
            var exists = await _context.Customers
                .AnyAsync(c => c.TenantId == tenantId && c.Phone == dto.Phone && c.IsActive == true);

            if (exists)
                throw new Exception("DUPLICATE_PHONE|Bu telefon numarasıyla kayıtlı bir müşteri zaten var.");

            var customer = new Customer
            {
                TenantId  = tenantId,
                Name      = dto.Name,
                Surname   = dto.Surname,
                Phone     = dto.Phone,
                Email     = dto.Email,
                BirthDate = dto.BirthDate,
                Notes     = dto.Notes,
                IsActive  = true,
                CDate     = DateTime.Now
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();
            return customer.Id;
        }

        public async Task<bool> UpdateAsync(int id, int tenantId, CustomerUpdateDto dto)
        {
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId && c.IsActive == true);

            if (customer == null)
                throw new Exception("NOT_FOUND|Müşteri bulunamadı.");

            // Farklı bir müşteride aynı tel no var mı?
            var duplicate = await _context.Customers
                .AnyAsync(c => c.TenantId == tenantId && c.Phone == dto.Phone && c.Id != id && c.IsActive == true);

            if (duplicate)
                throw new Exception("DUPLICATE_PHONE|Bu telefon numarasıyla kayıtlı başka bir müşteri var.");

            customer.Name      = dto.Name;
            customer.Surname   = dto.Surname;
            customer.Phone     = dto.Phone;
            customer.Email     = dto.Email;
            customer.BirthDate = dto.BirthDate;
            customer.Notes     = dto.Notes;
            customer.UDate     = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id, int tenantId)
        {
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId && c.IsActive == true);

            if (customer == null)
                throw new Exception("NOT_FOUND|Müşteri bulunamadı.");

            // Gelecekte randevusu var mı?
            var hasFutureAppointments = await _context.Appointments
                .AnyAsync(a => a.CustomerId == id && a.TenantId == tenantId
                            && a.IsActive == true && a.StartTime > DateTime.Now
                            && a.Status != Enums.AppointmentStatus.Cancelled);

            if (hasFutureAppointments)
                throw new Exception("HAS_FUTURE_APPOINTMENTS|Bu müşterinin gelecek randevuları var. Önce randevuları iptal edin.");

            customer.IsActive = false;
            customer.UDate    = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
