using API_BeautyWise.Models;
using Microsoft.EntityFrameworkCore;

namespace API_BeautyWise.Data
{
    public static class SeedData
    {
        public static async Task InitializeAsync(Context context)
        {
            // Migration'ları uygula
            await context.Database.MigrateAsync();

            // Abonelik paketleri var mı kontrol et
            if (!await context.SubscriptionPlans.AnyAsync())
            {
                var plans = new List<SubscriptionPlan>
                {
                    new SubscriptionPlan
                    {
                        Name = "Başlangıç Paketi",
                        MonthlyPrice = 500,
                        YearlyPrice = 5000,
                        MaxStaffCount = 5,
                        MaxBranchCount = 1,
                        HasSmsIntegration = false,
                        HasAiFeatures = false,
                        CDate = DateTime.Now,
                        IsActive = true
                    },
                    new SubscriptionPlan
                    {
                        Name = "Gold Paketi",
                        MonthlyPrice = 1000,
                        YearlyPrice = 10000,
                        MaxStaffCount = 15,
                        MaxBranchCount = 3,
                        HasSmsIntegration = true,
                        HasAiFeatures = false,
                        CDate = DateTime.Now,
                        IsActive = true
                    },
                    new SubscriptionPlan
                    {
                        Name = "Platinum Paketi",
                        MonthlyPrice = 2000,
                        YearlyPrice = 20000,
                        MaxStaffCount = -1, // Sınırsız
                        MaxBranchCount = -1, // Sınırsız
                        HasSmsIntegration = true,
                        HasAiFeatures = true,
                        CDate = DateTime.Now,
                        IsActive = true
                    }
                };

                await context.SubscriptionPlans.AddRangeAsync(plans);
                await context.SaveChangesAsync();
            }

            // Test kuponu var mı kontrol et
            if (!await context.Coupons.AnyAsync())
            {
                var coupons = new List<Coupon>
                {
                    new Coupon
                    {
                        Code = "HOSGELDIN2026",
                        Description = "Hoş geldin kuponu - %20 indirim",
                        IsPercentage = true,
                        DiscountAmount = 20,
                        StartDate = DateTime.Now,
                        EndDate = DateTime.Now.AddMonths(3),
                        MaxUsageCount = 100,
                        CurrentUsageCount = 0,
                        IsGlobal = true,
                        SpecificTenantId = null,
                        CDate = DateTime.Now,
                        IsActive = true
                    },
                    new Coupon
                    {
                        Code = "YILBASI50",
                        Description = "Yılbaşı kampanyası - 50 TL indirim",
                        IsPercentage = false,
                        DiscountAmount = 50,
                        StartDate = DateTime.Now,
                        EndDate = DateTime.Now.AddMonths(1),
                        MaxUsageCount = 50,
                        CurrentUsageCount = 0,
                        IsGlobal = true,
                        SpecificTenantId = null,
                        CDate = DateTime.Now,
                        IsActive = true
                    }
                };

                await context.Coupons.AddRangeAsync(coupons);
                await context.SaveChangesAsync();
            }
        }
    }
}
