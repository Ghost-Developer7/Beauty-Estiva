using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API_BeautyWise.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationDebtSmsModules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CreditBalance",
                table: "TenantSMSIntegrations",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreditBalanceUpdatedAt",
                table: "TenantSMSIntegrations",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SmsApiHash",
                table: "TenantSMSIntegrations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CustomerDebts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    CustomerId = table.Column<int>(type: "int", nullable: true),
                    PersonName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaidAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    RelatedAppointmentId = table.Column<int>(type: "int", nullable: true),
                    RelatedPackageSaleId = table.Column<int>(type: "int", nullable: true),
                    Source = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CUser = table.Column<int>(type: "int", nullable: true),
                    UUser = table.Column<int>(type: "int", nullable: true),
                    CDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerDebts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomerDebts_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CustomerDebts_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InAppNotifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    EntityType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    EntityId = table.Column<int>(type: "int", nullable: true),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ActionUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Icon = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DeduplicationKey = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CUser = table.Column<int>(type: "int", nullable: true),
                    UUser = table.Column<int>(type: "int", nullable: true),
                    CDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InAppNotifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InAppNotifications_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InAppNotifications_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "CustomerDebtPayments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    CustomerDebtId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentMethod = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    PaymentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CUser = table.Column<int>(type: "int", nullable: true),
                    UUser = table.Column<int>(type: "int", nullable: true),
                    CDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerDebtPayments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomerDebtPayments_CustomerDebts_CustomerDebtId",
                        column: x => x.CustomerDebtId,
                        principalTable: "CustomerDebts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerDebtPayments_CustomerDebtId",
                table: "CustomerDebtPayments",
                column: "CustomerDebtId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerDebtPayments_TenantId_PaymentDate",
                table: "CustomerDebtPayments",
                columns: new[] { "TenantId", "PaymentDate" });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerDebts_CustomerId",
                table: "CustomerDebts",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerDebts_TenantId_Type_Status",
                table: "CustomerDebts",
                columns: new[] { "TenantId", "Type", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_InAppNotifications_DeduplicationKey",
                table: "InAppNotifications",
                column: "DeduplicationKey",
                filter: "[DeduplicationKey] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_InAppNotifications_TenantId_CDate",
                table: "InAppNotifications",
                columns: new[] { "TenantId", "CDate" },
                filter: "[IsActive] = 1");

            migrationBuilder.CreateIndex(
                name: "IX_InAppNotifications_TenantId_UserId_IsRead",
                table: "InAppNotifications",
                columns: new[] { "TenantId", "UserId", "IsRead" },
                filter: "[IsActive] = 1");

            migrationBuilder.CreateIndex(
                name: "IX_InAppNotifications_UserId",
                table: "InAppNotifications",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CustomerDebtPayments");

            migrationBuilder.DropTable(
                name: "InAppNotifications");

            migrationBuilder.DropTable(
                name: "CustomerDebts");

            migrationBuilder.DropColumn(
                name: "CreditBalance",
                table: "TenantSMSIntegrations");

            migrationBuilder.DropColumn(
                name: "CreditBalanceUpdatedAt",
                table: "TenantSMSIntegrations");

            migrationBuilder.DropColumn(
                name: "SmsApiHash",
                table: "TenantSMSIntegrations");
        }
    }
}
