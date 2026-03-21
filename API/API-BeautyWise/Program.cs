using API_BeautyWise.Data;
using API_BeautyWise.Helpers;
using API_BeautyWise.Helpers.Interface;
using API_BeautyWise.Models;
using API_BeautyWise.Services;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Data;
using System.Text;

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
var builder = WebApplication.CreateBuilder(args);

// ================================================================
//  CORS
// ================================================================
builder.Services.AddCors(options =>
{
    options.AddPolicy(MyAllowSpecificOrigins, policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "http://localhost:5173",
                "https://localhost:5001"
                // Production domain'leri buraya ekleyin: "https://yourdomain.com"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ================================================================
//  Veritabani
// ================================================================
builder.Services.AddDbContext<Context>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("SqlServerConnection")));

// ================================================================
//  Identity (Kullanici / Rol yonetimi)
// ================================================================
builder.Services.AddIdentity<AppUser, AppRole>()
    .AddEntityFrameworkStores<Context>()
    .AddRoleManager<RoleManager<AppRole>>()
    .AddDefaultTokenProviders();

builder.Services.Configure<IdentityOptions>(options =>
{
    // Sifre kurallari
    options.Password.RequiredLength        = 8;
    options.Password.RequireNonAlphanumeric= true;
    options.Password.RequireDigit          = true;
    options.Password.RequireLowercase      = true;
    options.Password.RequireUppercase      = true;

    // Kullanici ayarlari
    options.User.RequireUniqueEmail        = true;
    options.User.AllowedUserNameCharacters =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";

    // Kilitlenme ayarlari
    options.Lockout.DefaultLockoutTimeSpan  = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
});

// ================================================================
//  JWT Kimlik Dogrulama
// ================================================================
builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer           = false,
        ValidateAudience         = false,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey         = new SymmetricSecurityKey(
            Encoding.ASCII.GetBytes(builder.Configuration["AppSettings:Secret"] ?? "")),
        ValidateLifetime         = true,
    };
});

// ================================================================
//  HTTP Client (PayTR API istekleri icin)
// ================================================================
builder.Services.AddHttpClient("PayTR", client =>
{
    client.DefaultRequestHeaders.Add("Accept", "application/json");
    client.Timeout = TimeSpan.FromSeconds(30);
});

// ================================================================
//  Dapper (loglama icin ham SQL)
// ================================================================
builder.Services.AddScoped<IDbConnection>(sp =>
    new SqlConnection(builder.Configuration.GetConnectionString("SqlServerConnection")));

// ================================================================
//  Uygulama Servisleri
// ================================================================
builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();
builder.Services.AddScoped<ICouponService, CouponService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<ITenantOnboardingService, TenantOnboardingService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITenantIdentifierGenerator, TenantIdentifierGenerator>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<LogService>();

// Randevu Modülü
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<ITreatmentService, TreatmentService>();
builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<IStaffScheduleService, StaffScheduleService>();

// Finansal Modül
builder.Services.AddScoped<ICurrencyService, CurrencyService>();
builder.Services.AddScoped<IAppointmentPaymentService, AppointmentPaymentService>();
builder.Services.AddScoped<IExpenseService, ExpenseService>();
builder.Services.AddScoped<IFinancialReportService, FinancialReportService>();

// ================================================================
//  Controllers & Swagger
// ================================================================
builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title       = "BeautyWise API",
        Version     = "v1",
        Description = "Guzellik merkezi SaaS yonetim sistemi"
    });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In          = ParameterLocation.Header,
        Description = "JWT token giriniz: Bearer {token}",
        Name        = "Authorization",
        Type        = SecuritySchemeType.Http,
        BearerFormat= "JWT",
        Scheme      = "Bearer"
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id   = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// ================================================================
//  Build
// ================================================================
var app = builder.Build();

// ================================================================
//  Seed Data (uygulama baslarken calisir)
// ================================================================
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<Context>();
        await SeedData.InitializeAsync(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Veritabani seed islemi sirasinda hata olustu.");
    }
}

// ================================================================
//  Middleware Pipeline
// ================================================================
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "BeautyWise API V1");
    c.RoutePrefix = "swagger";
});

app.UseStaticFiles();
app.UseHttpsRedirection();
app.UseRouting();
app.UseCors(MyAllowSpecificOrigins);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
