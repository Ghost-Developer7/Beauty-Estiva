using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API_BeautyWise.Migrations
{
    /// <inheritdoc />
    public partial class AddProfilePictureAndPackageSalesAndSubscriptionUpdates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProfilePicturePath",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "SubscriptionPlans",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Features",
                table: "SubscriptionPlans",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "HasSocialMediaIntegration",
                table: "SubscriptionPlans",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HasWhatsappIntegration",
                table: "SubscriptionPlans",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "ValidityMonths",
                table: "SubscriptionPlans",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "PackageSales_Packages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    TreatmentId = table.Column<int>(type: "int", nullable: false),
                    StaffId = table.Column<int>(type: "int", nullable: false),
                    TotalSessions = table.Column<int>(type: "int", nullable: false),
                    UsedSessions = table.Column<int>(type: "int", nullable: false),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaidAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentMethod = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CUser = table.Column<int>(type: "int", nullable: true),
                    UUser = table.Column<int>(type: "int", nullable: true),
                    CDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PackageSales_Packages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PackageSales_Packages_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PackageSales_Packages_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PackageSales_Packages_Treatments_TreatmentId",
                        column: x => x.TreatmentId,
                        principalTable: "Treatments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PackageSales_Packages_Users_StaffId",
                        column: x => x.StaffId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PackageSales_Payments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PackageSaleId = table.Column<int>(type: "int", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentMethod = table.Column<int>(type: "int", nullable: false),
                    PaidAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CUser = table.Column<int>(type: "int", nullable: true),
                    UUser = table.Column<int>(type: "int", nullable: true),
                    CDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PackageSales_Payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PackageSales_Payments_PackageSales_Packages_PackageSaleId",
                        column: x => x.PackageSaleId,
                        principalTable: "PackageSales_Packages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PackageSales_Payments_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PackageSales_Usages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PackageSaleId = table.Column<int>(type: "int", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    UsageDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    StaffId = table.Column<int>(type: "int", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CUser = table.Column<int>(type: "int", nullable: true),
                    UUser = table.Column<int>(type: "int", nullable: true),
                    CDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PackageSales_Usages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PackageSales_Usages_PackageSales_Packages_PackageSaleId",
                        column: x => x.PackageSaleId,
                        principalTable: "PackageSales_Packages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PackageSales_Usages_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PackageSales_Usages_Users_StaffId",
                        column: x => x.StaffId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PackageSales_Packages_CustomerId",
                table: "PackageSales_Packages",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_PackageSales_Packages_StaffId",
                table: "PackageSales_Packages",
                column: "StaffId");

            migrationBuilder.CreateIndex(
                name: "IX_PackageSales_Packages_TenantId",
                table: "PackageSales_Packages",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_PackageSales_Packages_TreatmentId",
                table: "PackageSales_Packages",
                column: "TreatmentId");

            migrationBuilder.CreateIndex(
                name: "IX_PackageSales_Payments_PackageSaleId",
                table: "PackageSales_Payments",
                column: "PackageSaleId");

            migrationBuilder.CreateIndex(
                name: "IX_PackageSales_Payments_TenantId",
                table: "PackageSales_Payments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_PackageSales_Usages_PackageSaleId",
                table: "PackageSales_Usages",
                column: "PackageSaleId");

            migrationBuilder.CreateIndex(
                name: "IX_PackageSales_Usages_StaffId",
                table: "PackageSales_Usages",
                column: "StaffId");

            migrationBuilder.CreateIndex(
                name: "IX_PackageSales_Usages_TenantId",
                table: "PackageSales_Usages",
                column: "TenantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PackageSales_Payments");

            migrationBuilder.DropTable(
                name: "PackageSales_Usages");

            migrationBuilder.DropTable(
                name: "PackageSales_Packages");

            migrationBuilder.DropColumn(
                name: "ProfilePicturePath",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "Features",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "HasSocialMediaIntegration",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "HasWhatsappIntegration",
                table: "SubscriptionPlans");

            migrationBuilder.DropColumn(
                name: "ValidityMonths",
                table: "SubscriptionPlans");
        }
    }
}
