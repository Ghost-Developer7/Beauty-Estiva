using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API_BeautyWise.Migrations
{
    /// <inheritdoc />
    public partial class AddDefaultCommissionRate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "DefaultCommissionRate",
                table: "Users",
                type: "decimal(5,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ExchangeRateToTry",
                table: "Currencies",
                type: "decimal(18,6)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RateLastUpdated",
                table: "Currencies",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TcmbCurrencyCode",
                table: "Currencies",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "StaffCommissionRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    StaffId = table.Column<int>(type: "int", nullable: false),
                    AppointmentPaymentId = table.Column<int>(type: "int", nullable: false),
                    CommissionRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    PaymentAmountInTry = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CommissionAmountInTry = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SalonShareInTry = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsPaid = table.Column<bool>(type: "bit", nullable: false),
                    PaidAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CUser = table.Column<int>(type: "int", nullable: true),
                    UUser = table.Column<int>(type: "int", nullable: true),
                    CDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StaffCommissionRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StaffCommissionRecords_AppointmentPayments_AppointmentPaymentId",
                        column: x => x.AppointmentPaymentId,
                        principalTable: "AppointmentPayments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StaffCommissionRecords_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StaffCommissionRecords_Users_StaffId",
                        column: x => x.StaffId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StaffTreatmentCommissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    StaffId = table.Column<int>(type: "int", nullable: false),
                    TreatmentId = table.Column<int>(type: "int", nullable: false),
                    CommissionRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    CUser = table.Column<int>(type: "int", nullable: true),
                    UUser = table.Column<int>(type: "int", nullable: true),
                    CDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StaffTreatmentCommissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StaffTreatmentCommissions_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StaffTreatmentCommissions_Treatments_TreatmentId",
                        column: x => x.TreatmentId,
                        principalTable: "Treatments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StaffTreatmentCommissions_Users_StaffId",
                        column: x => x.StaffId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.UpdateData(
                table: "Currencies",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ExchangeRateToTry", "RateLastUpdated", "TcmbCurrencyCode" },
                values: new object[] { null, null, null });

            migrationBuilder.UpdateData(
                table: "Currencies",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "ExchangeRateToTry", "RateLastUpdated", "TcmbCurrencyCode" },
                values: new object[] { null, null, "USD" });

            migrationBuilder.UpdateData(
                table: "Currencies",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "ExchangeRateToTry", "RateLastUpdated", "TcmbCurrencyCode" },
                values: new object[] { null, null, "EUR" });

            migrationBuilder.UpdateData(
                table: "Currencies",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "ExchangeRateToTry", "RateLastUpdated", "TcmbCurrencyCode" },
                values: new object[] { null, null, "GBP" });

            migrationBuilder.CreateIndex(
                name: "IX_StaffCommissionRecords_AppointmentPaymentId",
                table: "StaffCommissionRecords",
                column: "AppointmentPaymentId");

            migrationBuilder.CreateIndex(
                name: "IX_StaffCommissionRecords_StaffId",
                table: "StaffCommissionRecords",
                column: "StaffId");

            migrationBuilder.CreateIndex(
                name: "IX_StaffCommissionRecords_TenantId_StaffId",
                table: "StaffCommissionRecords",
                columns: new[] { "TenantId", "StaffId" });

            migrationBuilder.CreateIndex(
                name: "IX_StaffTreatmentCommissions_StaffId",
                table: "StaffTreatmentCommissions",
                column: "StaffId");

            migrationBuilder.CreateIndex(
                name: "IX_StaffTreatmentCommissions_TenantId_StaffId_TreatmentId",
                table: "StaffTreatmentCommissions",
                columns: new[] { "TenantId", "StaffId", "TreatmentId" },
                unique: true,
                filter: "[IsActive] = 1");

            migrationBuilder.CreateIndex(
                name: "IX_StaffTreatmentCommissions_TreatmentId",
                table: "StaffTreatmentCommissions",
                column: "TreatmentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StaffCommissionRecords");

            migrationBuilder.DropTable(
                name: "StaffTreatmentCommissions");

            migrationBuilder.DropColumn(
                name: "DefaultCommissionRate",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ExchangeRateToTry",
                table: "Currencies");

            migrationBuilder.DropColumn(
                name: "RateLastUpdated",
                table: "Currencies");

            migrationBuilder.DropColumn(
                name: "TcmbCurrencyCode",
                table: "Currencies");
        }
    }
}
