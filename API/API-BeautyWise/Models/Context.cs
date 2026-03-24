using API_BeautyWise.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API_BeautyWise.Models
{
    public class Context : IdentityDbContext<AppUser, AppRole, int>
    {
        public Context(DbContextOptions<Context> options) : base(options) { }

        public DbSet<Tenant> Tenants { get; set; }
        public DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }
        public DbSet<TenantSubscription> TenantSubscriptions { get; set; }
        public DbSet<TenantPaymentIntegration> TenantPaymentIntegrations { get; set; }
        public DbSet<TenantPaymentHistory> TenantPaymentHistories { get; set; }
        public DbSet<TenantSMSIntegration> TenantSMSIntegrations { get; set; }
        public DbSet<TenantWhatsappIntegration> TenantWhatsappIntegrations { get; set; }
        public DbSet<TenantEmailIntegration> TenantEmailIntegrations { get; set; }
        public DbSet<TenantLogo> TenantLogos { get; set; }
        public DbSet<TenantInviteToken> TenantInviteTokens { get; set; }
        public DbSet<TenantNotificationRule> TenantNotificationRules { get; set; }
        public DbSet<TenantNotificationHistory> TenantNotificationHistories { get; set; }
        public DbSet<UserNotificationPreference> UserNotificationPreferences { get; set; }
        public DbSet<Coupon> Coupons { get; set; }
        public DbSet<CouponUsage> CouponUsages { get; set; }

        // Randevu Modülü
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Treatment> Treatments { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<StaffUnavailability> StaffUnavailabilities { get; set; }

        // Finansal Modül
        public DbSet<Currency>           Currencies          { get; set; }
        public DbSet<AppointmentPayment> AppointmentPayments { get; set; }
        public DbSet<ExpenseCategory>    ExpenseCategories   { get; set; }
        public DbSet<Expense>            Expenses            { get; set; }

        // Ürün Satış Modülü
        public DbSet<Product>     Products     { get; set; }
        public DbSet<ProductSale> ProductSales { get; set; }

        // Paket Satış Modülü
        public DbSet<PackageSale>        PackageSales        { get; set; }
        public DbSet<PackageSaleUsage>   PackageSaleUsages   { get; set; }
        public DbSet<PackageSalePayment> PackageSalePayments { get; set; }

        // Komisyon Modülü
        public DbSet<StaffTreatmentCommission> StaffTreatmentCommissions { get; set; }
        public DbSet<StaffCommissionRecord>    StaffCommissionRecords    { get; set; }

        // Şube Modülü
        public DbSet<Branch> Branches { get; set; }

        // Personel Vardiya / İzin / Özlük Modülü
        public DbSet<StaffShift>  StaffShifts  { get; set; }
        public DbSet<StaffLeave>  StaffLeaves  { get; set; }
        public DbSet<StaffHRInfo> StaffHRInfos { get; set; }

        // Rol Yönetimi Audit Log
        public DbSet<RoleChangeAuditLog> RoleChangeAuditLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<AppUser>(entity =>
            {
                entity.ToTable("Users");
                entity.Property(u => u.DefaultCommissionRate).HasColumnType("decimal(5,2)");

                entity.HasOne(u => u.Tenant)
                      .WithMany(t => t.Users)
                      .HasForeignKey(u => u.TenantId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(u => u.Branch)
                      .WithMany(b => b.Staff)
                      .HasForeignKey(u => u.BranchId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasMany(u => u.NotificationPreferences)
                      .WithOne(p => p.AppUser)
                      .HasForeignKey(p => p.AppUserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<AppUser>().ToTable("Users");
            builder.Entity<AppRole>(entity => entity.ToTable("Roles"));
            builder.Entity<IdentityUserRole<int>>().ToTable("UserRoles");
            builder.Entity<IdentityUserClaim<int>>().ToTable("UserClaims");
            builder.Entity<IdentityRoleClaim<int>>().ToTable("RoleClaims");
            builder.Entity<IdentityUserLogin<int>>().ToTable("UserLogins");
            builder.Entity<IdentityUserToken<int>>().ToTable("UserTokens");

            builder.Entity<Tenant>(entity =>
            {
                entity.ToTable("Tenants");
                entity.HasMany(t => t.Users)
                      .WithOne(u => u.Tenant)
                      .HasForeignKey(u => u.TenantId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(t => t.InviteTokens)
                      .WithOne(i => i.Tenant)
                      .HasForeignKey(i => i.TenantId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(t => t.Logos)
                      .WithOne(l => l.Tenant)
                      .HasForeignKey(l => l.TenantId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(t => t.PaymentHistories)
                      .WithOne(ph => ph.Tenant)
                      .HasForeignKey(ph => ph.TenantId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(t => t.Subscriptions)
                      .WithOne(s => s.Tenant)
                      .HasForeignKey(s => s.TenantId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(t => t.NotificationRules)
                      .WithOne(r => r.Tenant)
                      .HasForeignKey(r => r.TenantId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(t => t.NotificationHistories)
                      .WithOne()
                      .HasForeignKey(h => h.TenantId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ============================================================
            //  Şube Modülü
            // ============================================================
            builder.Entity<Branch>(entity =>
            {
                entity.ToTable("Branches");
                entity.Property(b => b.Name).IsRequired().HasMaxLength(200);
                entity.Property(b => b.Address).HasMaxLength(500);
                entity.Property(b => b.Phone).HasMaxLength(30);
                entity.Property(b => b.Email).HasMaxLength(150);
                entity.Property(b => b.WorkingHoursJson).HasMaxLength(2000);

                entity.HasOne(b => b.Tenant)
                      .WithMany(t => t.Branches)
                      .HasForeignKey(b => b.TenantId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            builder.Entity<SubscriptionPlan>(entity =>
            {
                entity.ToTable("SubscriptionPlans");
                entity.Property(p => p.MonthlyPrice).HasColumnType("decimal(18,2)");
                entity.Property(p => p.YearlyPrice).HasColumnType("decimal(18,2)");
            });

            builder.Entity<TenantSubscription>(entity =>
            {
                entity.ToTable("TenantSubscriptions");
                entity.Property(s => s.PriceSold).HasColumnType("decimal(18,2)");

                entity.HasOne(s => s.SubscriptionPlan)
                      .WithMany()
                      .HasForeignKey(s => s.SubscriptionPlanId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(s => s.Tenant)
                      .WithMany(t => t.Subscriptions)
                      .HasForeignKey(s => s.TenantId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<TenantPaymentHistory>(entity =>
            {
                entity.ToTable("TenantPaymentHistories");
                entity.Property(p => p.Amount).HasColumnType("decimal(18,2)");
                entity.HasOne(p => p.Tenant)
                      .WithMany(t => t.PaymentHistories)
                      .HasForeignKey(p => p.TenantId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<TenantLogo>(entity =>
            {
                entity.ToTable("TenantLogos");
                entity.HasOne(l => l.Tenant)
                      .WithMany(t => t.Logos)
                      .HasForeignKey(l => l.TenantId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<TenantInviteToken>(entity =>
            {
                entity.ToTable("TenantInviteTokens");
                entity.Property(i => i.TokenCode).HasMaxLength(10);
                entity.HasOne(i => i.Tenant)
                      .WithMany(t => t.InviteTokens)
                      .HasForeignKey(i => i.TenantId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<TenantNotificationRule>(entity =>
            {
                entity.ToTable("TenantNotificationRules");
                entity.Property(r => r.Channel).HasConversion<int>();
                entity.HasOne(r => r.Tenant)
                      .WithMany(t => t.NotificationRules)
                      .HasForeignKey(r => r.TenantId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<TenantNotificationHistory>(entity =>
            {
                entity.ToTable("TenantNotificationHistories");
                entity.Property(h => h.Channel).HasConversion<int>();
                entity.HasOne<Tenant>()
                      .WithMany(t => t.NotificationHistories)
                      .HasForeignKey(h => h.TenantId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<TenantPaymentIntegration>(entity =>
            {
                entity.ToTable("TenantPaymentIntegrations");
                entity.HasOne(pi => pi.Tenant)
                      .WithOne(t => t.PaymentIntegration)
                      .HasForeignKey<TenantPaymentIntegration>(pi => pi.TenantId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<TenantSMSIntegration>(entity =>
            {
                entity.ToTable("TenantSMSIntegrations");
                entity.HasOne(si => si.Tenant)
                      .WithOne(t => t.SMSIntegration)
                      .HasForeignKey<TenantSMSIntegration>(si => si.TenantId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<TenantWhatsappIntegration>(entity =>
            {
                entity.ToTable("TenantWhatsappIntegrations");
                entity.HasOne(w => w.Tenant)
                      .WithOne(t => t.WhatsappIntegration)
                      .HasForeignKey<TenantWhatsappIntegration>(w => w.TenantId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<TenantEmailIntegration>(entity =>
            {
                entity.ToTable("TenantEmailIntegrations");
                entity.HasOne(e => e.Tenant)
                      .WithOne(t => t.EmailIntegration)
                      .HasForeignKey<TenantEmailIntegration>(e => e.TenantId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<UserNotificationPreference>(entity =>
            {
                entity.ToTable("UserNotificationPreferences");
                entity.Property(p => p.Channel).HasConversion<int>();
                entity.HasOne(p => p.AppUser)
                      .WithMany(u => u.NotificationPreferences)
                      .HasForeignKey(p => p.AppUserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<Coupon>(entity =>
            {
                entity.ToTable("Coupons");
                entity.Property(c => c.Code).IsRequired().HasMaxLength(50);
                entity.Property(c => c.DiscountAmount).HasColumnType("decimal(18,2)");
                
                entity.HasOne(c => c.SpecificTenant)
                      .WithMany()
                      .HasForeignKey(c => c.SpecificTenantId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(c => c.CouponUsages)
                      .WithOne(cu => cu.Coupon)
                      .HasForeignKey(cu => cu.CouponId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<CouponUsage>(entity =>
            {
                entity.ToTable("CouponUsages");
                entity.Property(cu => cu.OriginalPrice).HasColumnType("decimal(18,2)");
                entity.Property(cu => cu.DiscountAmount).HasColumnType("decimal(18,2)");
                entity.Property(cu => cu.FinalPrice).HasColumnType("decimal(18,2)");

                entity.HasOne(cu => cu.Coupon)
                      .WithMany(c => c.CouponUsages)
                      .HasForeignKey(cu => cu.CouponId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(cu => cu.Tenant)
                      .WithMany()
                      .HasForeignKey(cu => cu.TenantId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(cu => cu.Subscription)
                      .WithMany()
                      .HasForeignKey(cu => cu.SubscriptionId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ============================================================
            //  Randevu Modülü
            // ============================================================
            builder.Entity<Customer>(entity =>
            {
                entity.ToTable("Customers");
                entity.HasOne(c => c.Tenant)
                      .WithMany()
                      .HasForeignKey(c => c.TenantId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<Treatment>(entity =>
            {
                entity.ToTable("Treatments");
                entity.Property(t => t.Price).HasColumnType("decimal(18,2)");
                entity.HasOne(t => t.Tenant)
                      .WithMany()
                      .HasForeignKey(t => t.TenantId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<Appointment>(entity =>
            {
                entity.ToTable("Appointments");
                entity.Property(a => a.Status).HasConversion<int>();

                entity.HasOne(a => a.Tenant)
                      .WithMany()
                      .HasForeignKey(a => a.TenantId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(a => a.Customer)
                      .WithMany(c => c.Appointments)
                      .HasForeignKey(a => a.CustomerId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(a => a.Staff)
                      .WithMany()
                      .HasForeignKey(a => a.StaffId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(a => a.Treatment)
                      .WithMany(t => t.Appointments)
                      .HasForeignKey(a => a.TreatmentId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Self-referencing (tekrarlayan seans zinciri)
                entity.HasOne(a => a.ParentAppointment)
                      .WithMany(a => a.ChildAppointments)
                      .HasForeignKey(a => a.ParentAppointmentId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            builder.Entity<StaffUnavailability>(entity =>
            {
                entity.ToTable("StaffUnavailabilities");

                entity.HasOne(u => u.Tenant)
                      .WithMany()
                      .HasForeignKey(u => u.TenantId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(u => u.Staff)
                      .WithMany()
                      .HasForeignKey(u => u.StaffId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ============================================================
            //  Finansal Modül
            // ============================================================

            builder.Entity<Currency>(entity =>
            {
                entity.ToTable("Currencies");
                entity.Property(c => c.Code).IsRequired().HasMaxLength(10);
                entity.Property(c => c.Symbol).IsRequired().HasMaxLength(5);
                entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
                entity.Property(c => c.ExchangeRateToTry).HasColumnType("decimal(18,6)");
                entity.Property(c => c.TcmbCurrencyCode).HasMaxLength(10);

                // Seed: TRY, USD, EUR, GBP
                entity.HasData(
                    new Currency { Id = 1, Code = "TRY", Symbol = "₺", Name = "Türk Lirası",    IsDefault = true,  IsActive = true, DisplayOrder = 1, TcmbCurrencyCode = null },
                    new Currency { Id = 2, Code = "USD", Symbol = "$", Name = "ABD Doları",       IsDefault = false, IsActive = true, DisplayOrder = 2, TcmbCurrencyCode = "USD" },
                    new Currency { Id = 3, Code = "EUR", Symbol = "€", Name = "Euro",             IsDefault = false, IsActive = true, DisplayOrder = 3, TcmbCurrencyCode = "EUR" },
                    new Currency { Id = 4, Code = "GBP", Symbol = "£", Name = "İngiliz Sterlini", IsDefault = false, IsActive = true, DisplayOrder = 4, TcmbCurrencyCode = "GBP" }
                );
            });

            builder.Entity<AppointmentPayment>(entity =>
            {
                entity.ToTable("AppointmentPayments");
                entity.Property(p => p.Amount).HasColumnType("decimal(18,2)");
                entity.Property(p => p.ExchangeRateToTry).HasColumnType("decimal(18,6)");
                entity.Property(p => p.AmountInTry).HasColumnType("decimal(18,2)");
                entity.Property(p => p.PaymentMethod).HasConversion<int>();

                entity.HasOne(p => p.Tenant)
                      .WithMany()
                      .HasForeignKey(p => p.TenantId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.Appointment)
                      .WithMany()
                      .HasForeignKey(p => p.AppointmentId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.Currency)
                      .WithMany(c => c.AppointmentPayments)
                      .HasForeignKey(p => p.CurrencyId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            builder.Entity<ExpenseCategory>(entity =>
            {
                entity.ToTable("ExpenseCategories");
                entity.Property(c => c.Name).IsRequired().HasMaxLength(100);

                entity.HasOne(c => c.Tenant)
                      .WithMany()
                      .HasForeignKey(c => c.TenantId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<Expense>(entity =>
            {
                entity.ToTable("Expenses");
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.ExchangeRateToTry).HasColumnType("decimal(18,6)");
                entity.Property(e => e.AmountInTry).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Description).IsRequired().HasMaxLength(500);

                entity.HasOne(e => e.Tenant)
                      .WithMany()
                      .HasForeignKey(e => e.TenantId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.ExpenseCategory)
                      .WithMany(c => c.Expenses)
                      .HasForeignKey(e => e.ExpenseCategoryId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(e => e.Currency)
                      .WithMany(c => c.Expenses)
                      .HasForeignKey(e => e.CurrencyId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ============================================================
            //  Komisyon Modülü
            // ============================================================

            builder.Entity<StaffTreatmentCommission>(entity =>
            {
                entity.ToTable("StaffTreatmentCommissions");
                entity.Property(c => c.CommissionRate).HasColumnType("decimal(5,2)");

                entity.HasIndex(c => new { c.TenantId, c.StaffId, c.TreatmentId })
                      .IsUnique()
                      .HasFilter("[IsActive] = 1");

                entity.HasOne(c => c.Tenant)
                      .WithMany()
                      .HasForeignKey(c => c.TenantId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(c => c.Staff)
                      .WithMany()
                      .HasForeignKey(c => c.StaffId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(c => c.Treatment)
                      .WithMany()
                      .HasForeignKey(c => c.TreatmentId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            builder.Entity<StaffCommissionRecord>(entity =>
            {
                entity.ToTable("StaffCommissionRecords");
                entity.Property(r => r.CommissionRate).HasColumnType("decimal(5,2)");
                entity.Property(r => r.PaymentAmountInTry).HasColumnType("decimal(18,2)");
                entity.Property(r => r.CommissionAmountInTry).HasColumnType("decimal(18,2)");
                entity.Property(r => r.SalonShareInTry).HasColumnType("decimal(18,2)");

                entity.HasIndex(r => new { r.TenantId, r.StaffId });

                entity.HasOne(r => r.Tenant)
                      .WithMany()
                      .HasForeignKey(r => r.TenantId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(r => r.Staff)
                      .WithMany()
                      .HasForeignKey(r => r.StaffId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(r => r.AppointmentPayment)
                      .WithMany()
                      .HasForeignKey(r => r.AppointmentPaymentId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ============================================================
            //  Paket Satış Modülü
            // ============================================================

            builder.Entity<PackageSale>(entity =>
            {
                entity.ToTable("PackageSales_Packages");
                entity.Property(s => s.TotalPrice).HasColumnType("decimal(18,2)");
                entity.Property(s => s.PaidAmount).HasColumnType("decimal(18,2)");
                entity.Property(s => s.Status).HasConversion<int>();
                entity.Property(s => s.PaymentMethod).HasConversion<int>();

                entity.HasOne(s => s.Tenant)
                      .WithMany()
                      .HasForeignKey(s => s.TenantId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(s => s.Customer)
                      .WithMany()
                      .HasForeignKey(s => s.CustomerId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(s => s.Treatment)
                      .WithMany()
                      .HasForeignKey(s => s.TreatmentId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(s => s.Staff)
                      .WithMany()
                      .HasForeignKey(s => s.StaffId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(s => s.Usages)
                      .WithOne(u => u.PackageSale)
                      .HasForeignKey(u => u.PackageSaleId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(s => s.Payments)
                      .WithOne(p => p.PackageSale)
                      .HasForeignKey(p => p.PackageSaleId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<PackageSaleUsage>(entity =>
            {
                entity.ToTable("PackageSales_Usages");

                entity.HasOne(u => u.PackageSale)
                      .WithMany(s => s.Usages)
                      .HasForeignKey(u => u.PackageSaleId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(u => u.Tenant)
                      .WithMany()
                      .HasForeignKey(u => u.TenantId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(u => u.Staff)
                      .WithMany()
                      .HasForeignKey(u => u.StaffId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            builder.Entity<PackageSalePayment>(entity =>
            {
                entity.ToTable("PackageSales_Payments");
                entity.Property(p => p.Amount).HasColumnType("decimal(18,2)");
                entity.Property(p => p.PaymentMethod).HasConversion<int>();

                entity.HasOne(p => p.PackageSale)
                      .WithMany(s => s.Payments)
                      .HasForeignKey(p => p.PackageSaleId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(p => p.Tenant)
                      .WithMany()
                      .HasForeignKey(p => p.TenantId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ============================================================
            //  Ürün Satış Modülü
            // ============================================================

            // ============================================================
            //  Personel Vardiya / İzin / Özlük Modülü
            // ============================================================

            builder.Entity<StaffShift>(entity =>
            {
                entity.ToTable("StaffShifts");

                entity.HasIndex(s => new { s.TenantId, s.StaffId, s.DayOfWeek })
                      .HasFilter("[IsActive] = 1");

                entity.HasOne(s => s.Tenant)
                      .WithMany()
                      .HasForeignKey(s => s.TenantId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(s => s.Staff)
                      .WithMany()
                      .HasForeignKey(s => s.StaffId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            builder.Entity<StaffLeave>(entity =>
            {
                entity.ToTable("StaffLeaves");
                entity.Property(l => l.LeaveType).IsRequired().HasMaxLength(50);
                entity.Property(l => l.Status).IsRequired().HasMaxLength(20);
                entity.Property(l => l.Reason).HasMaxLength(500);

                entity.HasIndex(l => new { l.TenantId, l.StaffId, l.StartDate });

                entity.HasOne(l => l.Tenant)
                      .WithMany()
                      .HasForeignKey(l => l.TenantId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(l => l.Staff)
                      .WithMany()
                      .HasForeignKey(l => l.StaffId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(l => l.ApprovedBy)
                      .WithMany()
                      .HasForeignKey(l => l.ApprovedById)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            builder.Entity<StaffHRInfo>(entity =>
            {
                entity.ToTable("StaffHRInfos");
                entity.Property(h => h.Salary).HasColumnType("decimal(18,2)");
                entity.Property(h => h.SalaryCurrency).HasMaxLength(10);
                entity.Property(h => h.Position).HasMaxLength(100);
                entity.Property(h => h.IdentityNumber).HasMaxLength(20);
                entity.Property(h => h.EmergencyContactName).HasMaxLength(100);
                entity.Property(h => h.EmergencyContactPhone).HasMaxLength(30);
                entity.Property(h => h.Notes).HasMaxLength(1000);

                entity.HasIndex(h => new { h.TenantId, h.StaffId })
                      .IsUnique()
                      .HasFilter("[IsActive] = 1");

                entity.HasOne(h => h.Tenant)
                      .WithMany()
                      .HasForeignKey(h => h.TenantId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(h => h.Staff)
                      .WithMany()
                      .HasForeignKey(h => h.StaffId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ============================================================
            //  Rol Yönetimi Audit Log
            // ============================================================
            builder.Entity<RoleChangeAuditLog>(entity =>
            {
                entity.ToTable("RoleChangeAuditLogs");
                entity.Property(l => l.ActionType).IsRequired().HasMaxLength(50);
                entity.Property(l => l.OldRole).HasMaxLength(50);
                entity.Property(l => l.NewRole).HasMaxLength(50);
                entity.Property(l => l.Reason).HasMaxLength(500);
                entity.Property(l => l.TargetUserName).HasMaxLength(200);
                entity.Property(l => l.PerformedByUserName).HasMaxLength(200);
                entity.Property(l => l.TenantName).HasMaxLength(250);

                entity.HasOne(l => l.Tenant)
                      .WithMany()
                      .HasForeignKey(l => l.TenantId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(l => l.TargetUser)
                      .WithMany()
                      .HasForeignKey(l => l.TargetUserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(l => l.PerformedByUser)
                      .WithMany()
                      .HasForeignKey(l => l.PerformedByUserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(l => new { l.TenantId, l.CreatedAt });
                entity.HasIndex(l => l.TargetUserId);
                entity.HasIndex(l => l.PerformedByUserId);
            });

            builder.Entity<Product>(entity =>
            {
                entity.ToTable("Products");
                entity.Property(p => p.Name).IsRequired().HasMaxLength(200);
                entity.Property(p => p.Description).HasMaxLength(1000);
                entity.Property(p => p.Barcode).HasMaxLength(50);
                entity.Property(p => p.Price).HasColumnType("decimal(18,2)");

                entity.HasOne(p => p.Tenant)
                      .WithMany()
                      .HasForeignKey(p => p.TenantId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            builder.Entity<ProductSale>(entity =>
            {
                entity.ToTable("ProductSales");
                entity.Property(s => s.UnitPrice).HasColumnType("decimal(18,2)");
                entity.Property(s => s.TotalAmount).HasColumnType("decimal(18,2)");
                entity.Property(s => s.ExchangeRateToTry).HasColumnType("decimal(18,6)");
                entity.Property(s => s.AmountInTry).HasColumnType("decimal(18,2)");

                entity.HasOne(s => s.Tenant)
                      .WithMany()
                      .HasForeignKey(s => s.TenantId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(s => s.Product)
                      .WithMany(p => p.ProductSales)
                      .HasForeignKey(s => s.ProductId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(s => s.Customer)
                      .WithMany()
                      .HasForeignKey(s => s.CustomerId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(s => s.Staff)
                      .WithMany()
                      .HasForeignKey(s => s.StaffId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(s => s.Currency)
                      .WithMany()
                      .HasForeignKey(s => s.CurrencyId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
