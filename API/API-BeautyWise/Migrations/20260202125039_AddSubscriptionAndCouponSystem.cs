using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API_BeautyWise.Migrations
{
    /// <inheritdoc />
    public partial class AddSubscriptionAndCouponSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AutoRenew",
                table: "TenantSubscriptions",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "CancelledDate",
                table: "TenantSubscriptions",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CouponId",
                table: "TenantSubscriptions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountAmount",
                table: "TenantSubscriptions",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FailedPaymentAttempts",
                table: "TenantSubscriptions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "GracePeriodEndDate",
                table: "TenantSubscriptions",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsCancelled",
                table: "TenantSubscriptions",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsInGracePeriod",
                table: "TenantSubscriptions",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsRefunded",
                table: "TenantSubscriptions",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsTrialPeriod",
                table: "TenantSubscriptions",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "NextRenewalDate",
                table: "TenantSubscriptions",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentStatus",
                table: "TenantSubscriptions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PaymentToken",
                table: "TenantSubscriptions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentTransactionId",
                table: "TenantSubscriptions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "RefundAmount",
                table: "TenantSubscriptions",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RefundDate",
                table: "TenantSubscriptions",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "TrialEndDate",
                table: "TenantSubscriptions",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TransactionId",
                table: "TenantPaymentHistories",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "ConversationId",
                table: "TenantPaymentHistories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsRefunded",
                table: "TenantPaymentHistories",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PaymentId",
                table: "TenantPaymentHistories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethod",
                table: "TenantPaymentHistories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentToken",
                table: "TenantPaymentHistories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "RefundAmount",
                table: "TenantPaymentHistories",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RefundDate",
                table: "TenantPaymentHistories",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RefundReason",
                table: "TenantPaymentHistories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SubscriptionId",
                table: "TenantPaymentHistories",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Coupons",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IsPercentage = table.Column<bool>(type: "bit", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MaxUsageCount = table.Column<int>(type: "int", nullable: true),
                    CurrentUsageCount = table.Column<int>(type: "int", nullable: false),
                    IsGlobal = table.Column<bool>(type: "bit", nullable: false),
                    SpecificTenantId = table.Column<int>(type: "int", nullable: true),
                    CUser = table.Column<int>(type: "int", nullable: true),
                    UUser = table.Column<int>(type: "int", nullable: true),
                    CDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Coupons", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Coupons_Tenants_SpecificTenantId",
                        column: x => x.SpecificTenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CouponUsages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CouponId = table.Column<int>(type: "int", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    SubscriptionId = table.Column<int>(type: "int", nullable: false),
                    OriginalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FinalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UsedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CUser = table.Column<int>(type: "int", nullable: true),
                    UUser = table.Column<int>(type: "int", nullable: true),
                    CDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CouponUsages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CouponUsages_Coupons_CouponId",
                        column: x => x.CouponId,
                        principalTable: "Coupons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CouponUsages_TenantSubscriptions_SubscriptionId",
                        column: x => x.SubscriptionId,
                        principalTable: "TenantSubscriptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CouponUsages_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TenantSubscriptions_CouponId",
                table: "TenantSubscriptions",
                column: "CouponId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantPaymentHistories_SubscriptionId",
                table: "TenantPaymentHistories",
                column: "SubscriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_Coupons_SpecificTenantId",
                table: "Coupons",
                column: "SpecificTenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CouponUsages_CouponId",
                table: "CouponUsages",
                column: "CouponId");

            migrationBuilder.CreateIndex(
                name: "IX_CouponUsages_SubscriptionId",
                table: "CouponUsages",
                column: "SubscriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_CouponUsages_TenantId",
                table: "CouponUsages",
                column: "TenantId");

            migrationBuilder.AddForeignKey(
                name: "FK_TenantPaymentHistories_TenantSubscriptions_SubscriptionId",
                table: "TenantPaymentHistories",
                column: "SubscriptionId",
                principalTable: "TenantSubscriptions",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TenantSubscriptions_Coupons_CouponId",
                table: "TenantSubscriptions",
                column: "CouponId",
                principalTable: "Coupons",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TenantPaymentHistories_TenantSubscriptions_SubscriptionId",
                table: "TenantPaymentHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_TenantSubscriptions_Coupons_CouponId",
                table: "TenantSubscriptions");

            migrationBuilder.DropTable(
                name: "CouponUsages");

            migrationBuilder.DropTable(
                name: "Coupons");

            migrationBuilder.DropIndex(
                name: "IX_TenantSubscriptions_CouponId",
                table: "TenantSubscriptions");

            migrationBuilder.DropIndex(
                name: "IX_TenantPaymentHistories_SubscriptionId",
                table: "TenantPaymentHistories");

            migrationBuilder.DropColumn(
                name: "AutoRenew",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "CancelledDate",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "CouponId",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "DiscountAmount",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "FailedPaymentAttempts",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "GracePeriodEndDate",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "IsCancelled",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "IsInGracePeriod",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "IsRefunded",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "IsTrialPeriod",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "NextRenewalDate",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "PaymentStatus",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "PaymentToken",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "PaymentTransactionId",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "RefundAmount",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "RefundDate",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "TrialEndDate",
                table: "TenantSubscriptions");

            migrationBuilder.DropColumn(
                name: "ConversationId",
                table: "TenantPaymentHistories");

            migrationBuilder.DropColumn(
                name: "IsRefunded",
                table: "TenantPaymentHistories");

            migrationBuilder.DropColumn(
                name: "PaymentId",
                table: "TenantPaymentHistories");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "TenantPaymentHistories");

            migrationBuilder.DropColumn(
                name: "PaymentToken",
                table: "TenantPaymentHistories");

            migrationBuilder.DropColumn(
                name: "RefundAmount",
                table: "TenantPaymentHistories");

            migrationBuilder.DropColumn(
                name: "RefundDate",
                table: "TenantPaymentHistories");

            migrationBuilder.DropColumn(
                name: "RefundReason",
                table: "TenantPaymentHistories");

            migrationBuilder.DropColumn(
                name: "SubscriptionId",
                table: "TenantPaymentHistories");

            migrationBuilder.AlterColumn<string>(
                name: "TransactionId",
                table: "TenantPaymentHistories",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);
        }
    }
}
