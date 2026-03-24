using API_BeautyWise.DTO;
using API_BeautyWise.Enums;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace API_BeautyWise.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly Context _context;

        // 1 point per 100 TL spent
        private const decimal LoyaltyPointsPerTL = 0.01m;

        public CustomerService(Context context)
        {
            _context = context;
        }

        /* ════════════════════════════════════════════
           HELPERS
           ════════════════════════════════════════════ */

        private static List<string> ParseTags(string? tagsJson)
        {
            if (string.IsNullOrWhiteSpace(tagsJson)) return new List<string>();
            try { return JsonSerializer.Deserialize<List<string>>(tagsJson) ?? new List<string>(); }
            catch { return new List<string>(); }
        }

        private static string SerializeTags(List<string>? tags)
        {
            if (tags == null || tags.Count == 0) return "[]";
            return JsonSerializer.Serialize(tags);
        }

        private static string DetermineSegment(int totalVisits, decimal totalSpent, DateTime? lastVisitDate)
        {
            if (totalVisits == 0) return "New";

            // Lost: no visit in 90+ days
            if (lastVisitDate.HasValue && (DateTime.Now - lastVisitDate.Value).TotalDays > 90)
                return "Lost";

            // VIP: 10+ visits or 5000+ TL spent
            if (totalVisits >= 10 || totalSpent >= 5000m)
                return "VIP";

            // Regular: 3+ visits
            if (totalVisits >= 3)
                return "Regular";

            return "New";
        }

        private IQueryable<Customer> ActiveCustomers(int tenantId) =>
            _context.Customers.Where(c => c.TenantId == tenantId && c.IsActive == true);

        /* ════════════════════════════════════════════
           LIST
           ════════════════════════════════════════════ */

        public async Task<List<CustomerListDto>> GetAllAsync(int tenantId, string? search = null)
        {
            var query = ActiveCustomers(tenantId);

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
                .Select(c => new
                {
                    c.Id, c.Name, c.Surname, c.Phone, c.Email,
                    c.LoyaltyPoints, c.TotalSpent, c.TotalVisits,
                    c.LastVisitDate, c.CustomerSince, c.Tags,
                    TotalAppointments = c.Appointments.Count(a => a.IsActive == true),
                    LastAppointmentDate = c.Appointments
                        .Where(a => a.IsActive == true)
                        .OrderByDescending(a => a.StartTime)
                        .Select(a => (DateTime?)a.StartTime)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return customers.Select(c => new CustomerListDto
            {
                Id       = c.Id,
                Name     = c.Name,
                Surname  = c.Surname,
                Phone    = c.Phone,
                Email    = c.Email,
                TotalAppointments = c.TotalAppointments,
                LastAppointmentDate = c.LastAppointmentDate,
                LoyaltyPoints = c.LoyaltyPoints,
                TotalSpent    = c.TotalSpent,
                TotalVisits   = c.TotalVisits,
                Segment       = DetermineSegment(c.TotalVisits, c.TotalSpent, c.LastVisitDate),
                Tags          = ParseTags(c.Tags),
                CustomerSince = c.CustomerSince,
            }).ToList();
        }

        public async Task<PaginatedResponse<CustomerListDto>> GetAllPaginatedAsync(int tenantId, int pageNumber, int pageSize, string? search = null)
        {
            var query = ActiveCustomers(tenantId);

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.ToLower();
                query = query.Where(c =>
                    c.Name.ToLower().Contains(search) ||
                    c.Surname.ToLower().Contains(search) ||
                    c.Phone.Contains(search));
            }

            var totalCount = await query.CountAsync();

            var customers = await query
                .OrderBy(c => c.Name).ThenBy(c => c.Surname)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new
                {
                    c.Id, c.Name, c.Surname, c.Phone, c.Email,
                    c.LoyaltyPoints, c.TotalSpent, c.TotalVisits,
                    c.LastVisitDate, c.CustomerSince, c.Tags,
                    TotalAppointments = c.Appointments.Count(a => a.IsActive == true),
                    LastAppointmentDate = c.Appointments
                        .Where(a => a.IsActive == true)
                        .OrderByDescending(a => a.StartTime)
                        .Select(a => (DateTime?)a.StartTime)
                        .FirstOrDefault()
                })
                .ToListAsync();

            var items = customers.Select(c => new CustomerListDto
            {
                Id       = c.Id,
                Name     = c.Name,
                Surname  = c.Surname,
                Phone    = c.Phone,
                Email    = c.Email,
                TotalAppointments = c.TotalAppointments,
                LastAppointmentDate = c.LastAppointmentDate,
                LoyaltyPoints = c.LoyaltyPoints,
                TotalSpent    = c.TotalSpent,
                TotalVisits   = c.TotalVisits,
                Segment       = DetermineSegment(c.TotalVisits, c.TotalSpent, c.LastVisitDate),
                Tags          = ParseTags(c.Tags),
                CustomerSince = c.CustomerSince,
            }).ToList();

            return new PaginatedResponse<CustomerListDto>
            {
                Items      = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize   = pageSize,
            };
        }

        /* ════════════════════════════════════════════
           DETAIL
           ════════════════════════════════════════════ */

        public async Task<CustomerDetailDto?> GetByIdAsync(int id, int tenantId)
        {
            var c = await ActiveCustomers(tenantId)
                .Where(c => c.Id == id)
                .Select(c => new
                {
                    c.Id, c.Name, c.Surname, c.Phone, c.Email, c.BirthDate, c.Notes, c.CDate,
                    c.LoyaltyPoints, c.TotalSpent, c.TotalVisits, c.LastVisitDate,
                    c.CustomerSince, c.PreferredStaffId, c.Allergies, c.Preferences,
                    c.Tags, c.ReferralSource,
                    PreferredStaffName = c.PreferredStaff != null
                        ? c.PreferredStaff.Name + " " + c.PreferredStaff.Surname : null,
                    TotalAppointments = c.Appointments.Count(a => a.IsActive == true),
                    RecentAppointments = c.Appointments
                        .Where(a => a.IsActive == true)
                        .OrderByDescending(a => a.StartTime)
                        .Take(10)
                        .Select(a => new CustomerAppointmentSummaryDto
                        {
                            Id            = a.Id,
                            StartTime     = a.StartTime,
                            TreatmentName = a.Treatment.Name,
                            StaffName     = a.Staff.Name + " " + a.Staff.Surname,
                            Status        = a.Status.ToString(),
                            DurationMinutes = (int)(a.EndTime - a.StartTime).TotalMinutes,
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync();

            if (c == null) return null;

            var segment = DetermineSegment(c.TotalVisits, c.TotalSpent, c.LastVisitDate);
            var avgSpend = c.TotalVisits > 0 ? c.TotalSpent / c.TotalVisits : 0;

            return new CustomerDetailDto
            {
                Id      = c.Id,
                Name    = c.Name,
                Surname = c.Surname,
                Phone   = c.Phone,
                Email   = c.Email,
                BirthDate = c.BirthDate,
                Notes   = c.Notes,
                CDate   = c.CDate,
                TotalAppointments = c.TotalAppointments,
                RecentAppointments = c.RecentAppointments,
                LoyaltyPoints = c.LoyaltyPoints,
                TotalSpent    = c.TotalSpent,
                TotalVisits   = c.TotalVisits,
                LastVisitDate = c.LastVisitDate,
                CustomerSince = c.CustomerSince,
                PreferredStaffId   = c.PreferredStaffId,
                PreferredStaffName = c.PreferredStaffName,
                Allergies   = c.Allergies,
                Preferences = c.Preferences,
                Tags        = ParseTags(c.Tags),
                ReferralSource = c.ReferralSource,
                Segment     = segment,
                AverageSpendPerVisit = avgSpend,
            };
        }

        /* ════════════════════════════════════════════
           CREATE
           ════════════════════════════════════════════ */

        public async Task<int> CreateAsync(int tenantId, CustomerCreateDto dto)
        {
            var exists = await _context.Customers
                .AnyAsync(c => c.TenantId == tenantId && c.Phone == dto.Phone && c.IsActive == true);

            if (exists)
                throw new Exception("DUPLICATE_PHONE|Bu telefon numarasıyla kayıtlı bir müşteri zaten var.");

            var customer = new Customer
            {
                TenantId      = tenantId,
                Name          = dto.Name,
                Surname       = dto.Surname,
                Phone         = dto.Phone,
                Email         = dto.Email,
                BirthDate     = dto.BirthDate,
                Notes         = dto.Notes,
                Allergies     = dto.Allergies,
                Preferences   = dto.Preferences,
                ReferralSource = dto.ReferralSource,
                PreferredStaffId = dto.PreferredStaffId,
                Tags          = SerializeTags(dto.Tags),
                CustomerSince = DateTime.Now,
                IsActive      = true,
                CDate         = DateTime.Now
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();
            return customer.Id;
        }

        /* ════════════════════════════════════════════
           UPDATE
           ════════════════════════════════════════════ */

        public async Task<bool> UpdateAsync(int id, int tenantId, CustomerUpdateDto dto)
        {
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId && c.IsActive == true);

            if (customer == null)
                throw new Exception("NOT_FOUND|Müşteri bulunamadı.");

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
            customer.Allergies     = dto.Allergies;
            customer.Preferences   = dto.Preferences;
            customer.ReferralSource = dto.ReferralSource;
            customer.PreferredStaffId = dto.PreferredStaffId;
            if (dto.Tags != null) customer.Tags = SerializeTags(dto.Tags);
            customer.UDate     = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }

        /* ════════════════════════════════════════════
           DELETE
           ════════════════════════════════════════════ */

        public async Task<bool> DeleteAsync(int id, int tenantId)
        {
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId && c.IsActive == true);

            if (customer == null)
                throw new Exception("NOT_FOUND|Müşteri bulunamadı.");

            var hasFutureAppointments = await _context.Appointments
                .AnyAsync(a => a.CustomerId == id && a.TenantId == tenantId
                            && a.IsActive == true && a.StartTime > DateTime.Now
                            && a.Status != AppointmentStatus.Cancelled);

            if (hasFutureAppointments)
                throw new Exception("HAS_FUTURE_APPOINTMENTS|Bu müşterinin gelecek randevuları var. Önce randevuları iptal edin.");

            customer.IsActive = false;
            customer.UDate    = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }

        /* ════════════════════════════════════════════
           HISTORY
           ════════════════════════════════════════════ */

        public async Task<CustomerHistoryDto> GetHistoryAsync(int id, int tenantId)
        {
            var customer = await ActiveCustomers(tenantId)
                .Where(c => c.Id == id)
                .Select(c => new { c.Name, c.Surname })
                .FirstOrDefaultAsync()
                ?? throw new Exception("NOT_FOUND|Müşteri bulunamadı.");

            var timeline = new List<CustomerTimelineItem>();

            // Appointments
            var appointments = await _context.Appointments
                .Where(a => a.CustomerId == id && a.TenantId == tenantId && a.IsActive == true)
                .OrderByDescending(a => a.StartTime)
                .Select(a => new CustomerTimelineItem
                {
                    Id          = a.Id,
                    Type        = "appointment",
                    Date        = a.StartTime,
                    Title       = a.Treatment.Name,
                    Description = a.Notes,
                    StaffName   = a.Staff.Name + " " + a.Staff.Surname,
                    Status      = a.Status.ToString(),
                    DurationMinutes = (int)(a.EndTime - a.StartTime).TotalMinutes,
                    Amount      = _context.AppointmentPayments
                        .Where(p => p.AppointmentId == a.Id && p.IsActive == true)
                        .Sum(p => (decimal?)p.AmountInTry) ?? 0
                })
                .ToListAsync();
            timeline.AddRange(appointments);

            // Product purchases
            var products = await _context.ProductSales
                .Where(ps => ps.CustomerId == id && ps.TenantId == tenantId && ps.IsActive == true)
                .OrderByDescending(ps => ps.SaleDate)
                .Select(ps => new CustomerTimelineItem
                {
                    Id          = ps.Id,
                    Type        = "product_purchase",
                    Date        = ps.SaleDate,
                    Title       = ps.Product.Name,
                    Description = ps.Notes,
                    StaffName   = ps.Staff.Name + " " + ps.Staff.Surname,
                    Amount      = ps.AmountInTry,
                    Status      = "Completed"
                })
                .ToListAsync();
            timeline.AddRange(products);

            // Package purchases
            var packages = await _context.PackageSales
                .Where(pk => pk.CustomerId == id && pk.TenantId == tenantId && pk.IsActive == true)
                .OrderByDescending(pk => pk.StartDate)
                .Select(pk => new CustomerTimelineItem
                {
                    Id          = pk.Id,
                    Type        = "package_purchase",
                    Date        = pk.StartDate,
                    Title       = pk.Treatment.Name + " (" + pk.TotalSessions + " seans)",
                    Description = pk.Notes,
                    StaffName   = pk.Staff.Name + " " + pk.Staff.Surname,
                    Amount      = pk.TotalPrice,
                    Status      = pk.Status.ToString()
                })
                .ToListAsync();
            timeline.AddRange(packages);

            timeline = timeline.OrderByDescending(t => t.Date).ToList();

            return new CustomerHistoryDto
            {
                CustomerId       = id,
                CustomerFullName = $"{customer.Name} {customer.Surname}",
                Timeline         = timeline
            };
        }

        /* ════════════════════════════════════════════
           STATS
           ════════════════════════════════════════════ */

        public async Task<CustomerStatsDto> GetStatsAsync(int id, int tenantId)
        {
            var customer = await ActiveCustomers(tenantId)
                .Where(c => c.Id == id)
                .Select(c => new
                {
                    c.Name, c.Surname, c.LoyaltyPoints, c.TotalSpent, c.TotalVisits,
                    c.LastVisitDate, c.CustomerSince, c.PreferredStaffId,
                    PreferredStaffName = c.PreferredStaff != null
                        ? c.PreferredStaff.Name + " " + c.PreferredStaff.Surname : null,
                })
                .FirstOrDefaultAsync()
                ?? throw new Exception("NOT_FOUND|Müşteri bulunamadı.");

            // Most used treatment
            var mostUsed = await _context.Appointments
                .Where(a => a.CustomerId == id && a.TenantId == tenantId && a.IsActive == true
                         && a.Status == AppointmentStatus.Completed)
                .GroupBy(a => a.Treatment.Name)
                .Select(g => new { Name = g.Key, Count = g.Count() })
                .OrderByDescending(g => g.Count)
                .FirstOrDefaultAsync();

            // Visit frequency
            var completedDates = await _context.Appointments
                .Where(a => a.CustomerId == id && a.TenantId == tenantId && a.IsActive == true
                         && a.Status == AppointmentStatus.Completed)
                .OrderBy(a => a.StartTime)
                .Select(a => a.StartTime)
                .ToListAsync();

            double visitFrequency = 0;
            if (completedDates.Count > 1)
            {
                var totalDays = (completedDates.Last() - completedDates.First()).TotalDays;
                visitFrequency = totalDays / (completedDates.Count - 1);
            }

            // Next appointment
            var nextAppointment = await _context.Appointments
                .Where(a => a.CustomerId == id && a.TenantId == tenantId && a.IsActive == true
                         && a.StartTime > DateTime.Now
                         && a.Status != AppointmentStatus.Cancelled)
                .OrderBy(a => a.StartTime)
                .Select(a => (DateTime?)a.StartTime)
                .FirstOrDefaultAsync();

            var segment = DetermineSegment(customer.TotalVisits, customer.TotalSpent, customer.LastVisitDate);
            var avgSpend = customer.TotalVisits > 0 ? customer.TotalSpent / customer.TotalVisits : 0;

            return new CustomerStatsDto
            {
                CustomerId       = id,
                CustomerFullName = $"{customer.Name} {customer.Surname}",
                TotalVisits      = customer.TotalVisits,
                TotalSpent       = customer.TotalSpent,
                LoyaltyPoints    = customer.LoyaltyPoints,
                CustomerSince    = customer.CustomerSince,
                AverageSpendPerVisit = avgSpend,
                VisitFrequencyDays   = Math.Round(visitFrequency, 1),
                Segment              = segment,
                PreferredStaffName   = customer.PreferredStaffName,
                MostUsedTreatment    = mostUsed?.Name,
                MostUsedTreatmentCount = mostUsed?.Count ?? 0,
                LastVisitDate        = customer.LastVisitDate,
                NextAppointmentDate  = nextAppointment,
            };
        }

        /* ════════════════════════════════════════════
           LOYALTY POINTS
           ════════════════════════════════════════════ */

        public async Task<bool> UpdateLoyaltyPointsAsync(int id, int tenantId, UpdateLoyaltyPointsDto dto)
        {
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId && c.IsActive == true)
                ?? throw new Exception("NOT_FOUND|Müşteri bulunamadı.");

            customer.LoyaltyPoints += dto.Points;
            if (customer.LoyaltyPoints < 0) customer.LoyaltyPoints = 0;
            customer.UDate = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }

        /* ════════════════════════════════════════════
           TAGS
           ════════════════════════════════════════════ */

        public async Task<bool> UpdateTagsAsync(int id, int tenantId, UpdateCustomerTagsDto dto)
        {
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId && c.IsActive == true)
                ?? throw new Exception("NOT_FOUND|Müşteri bulunamadı.");

            customer.Tags = SerializeTags(dto.Tags);
            customer.UDate = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }

        /* ════════════════════════════════════════════
           VIP / TOP CUSTOMERS
           ════════════════════════════════════════════ */

        public async Task<List<CustomerListDto>> GetVipCustomersAsync(int tenantId)
        {
            var customers = await ActiveCustomers(tenantId)
                .Where(c => c.TotalVisits >= 10 || c.TotalSpent >= 5000m
                         || (c.Tags != null && c.Tags.Contains("VIP")))
                .OrderByDescending(c => c.TotalSpent)
                .Select(c => new
                {
                    c.Id, c.Name, c.Surname, c.Phone, c.Email,
                    c.LoyaltyPoints, c.TotalSpent, c.TotalVisits,
                    c.LastVisitDate, c.CustomerSince, c.Tags,
                    TotalAppointments = c.Appointments.Count(a => a.IsActive == true),
                    LastAppointmentDate = c.Appointments
                        .Where(a => a.IsActive == true)
                        .OrderByDescending(a => a.StartTime)
                        .Select(a => (DateTime?)a.StartTime)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return customers.Select(c => new CustomerListDto
            {
                Id       = c.Id,
                Name     = c.Name,
                Surname  = c.Surname,
                Phone    = c.Phone,
                Email    = c.Email,
                TotalAppointments = c.TotalAppointments,
                LastAppointmentDate = c.LastAppointmentDate,
                LoyaltyPoints = c.LoyaltyPoints,
                TotalSpent    = c.TotalSpent,
                TotalVisits   = c.TotalVisits,
                Segment       = "VIP",
                Tags          = ParseTags(c.Tags),
                CustomerSince = c.CustomerSince,
            }).ToList();
        }
    }
}
