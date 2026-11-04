using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartDevCo.SchoolSales.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPresentationPublishingAndAnalytics : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPublished",
                table: "presentations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "PublishedAtUtc",
                table: "presentations",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PublishedSnapshotJson",
                table: "presentations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PublishedVersionNumber",
                table: "presentations",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShareToken",
                table: "presentations",
                type: "character varying(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ShareTokenExpiresAtUtc",
                table: "presentations",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "presentation_public_inquiries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PresentationId = table.Column<Guid>(type: "uuid", nullable: false),
                    SchoolId = table.Column<Guid>(type: "uuid", nullable: true),
                    ShareToken = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    SchoolName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    ContactName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ContactPhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ContactEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    JobTitle = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    Message = table.Column<string>(type: "text", nullable: true),
                    InterestedProduct = table.Column<int>(type: "integer", nullable: false),
                    IsReviewed = table.Column<bool>(type: "boolean", nullable: false),
                    ReviewedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    ReviewedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_presentation_public_inquiries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_presentation_public_inquiries_presentations_PresentationId",
                        column: x => x.PresentationId,
                        principalTable: "presentations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_presentation_public_inquiries_schools_SchoolId",
                        column: x => x.SchoolId,
                        principalTable: "schools",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "presentation_view_events",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PresentationId = table.Column<Guid>(type: "uuid", nullable: false),
                    ShareToken = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    SessionId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    SlideIndex = table.Column<int>(type: "integer", nullable: true),
                    DurationSeconds = table.Column<int>(type: "integer", nullable: false),
                    IsDemoCtaClick = table.Column<bool>(type: "boolean", nullable: false),
                    Language = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: true),
                    ReferrerDomain = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_presentation_view_events", x => x.Id);
                    table.ForeignKey(
                        name: "FK_presentation_view_events_presentations_PresentationId",
                        column: x => x.PresentationId,
                        principalTable: "presentations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_presentations_ShareToken",
                table: "presentations",
                column: "ShareToken");

            migrationBuilder.CreateIndex(
                name: "IX_presentation_public_inquiries_CreatedAtUtc",
                table: "presentation_public_inquiries",
                column: "CreatedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_presentation_public_inquiries_PresentationId",
                table: "presentation_public_inquiries",
                column: "PresentationId");

            migrationBuilder.CreateIndex(
                name: "IX_presentation_public_inquiries_SchoolId",
                table: "presentation_public_inquiries",
                column: "SchoolId");

            migrationBuilder.CreateIndex(
                name: "IX_presentation_public_inquiries_ShareToken",
                table: "presentation_public_inquiries",
                column: "ShareToken");

            migrationBuilder.CreateIndex(
                name: "IX_presentation_view_events_CreatedAtUtc",
                table: "presentation_view_events",
                column: "CreatedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_presentation_view_events_PresentationId",
                table: "presentation_view_events",
                column: "PresentationId");

            migrationBuilder.CreateIndex(
                name: "IX_presentation_view_events_SessionId",
                table: "presentation_view_events",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_presentation_view_events_ShareToken",
                table: "presentation_view_events",
                column: "ShareToken");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "presentation_public_inquiries");

            migrationBuilder.DropTable(
                name: "presentation_view_events");

            migrationBuilder.DropIndex(
                name: "IX_presentations_ShareToken",
                table: "presentations");

            migrationBuilder.DropColumn(
                name: "IsPublished",
                table: "presentations");

            migrationBuilder.DropColumn(
                name: "PublishedAtUtc",
                table: "presentations");

            migrationBuilder.DropColumn(
                name: "PublishedSnapshotJson",
                table: "presentations");

            migrationBuilder.DropColumn(
                name: "PublishedVersionNumber",
                table: "presentations");

            migrationBuilder.DropColumn(
                name: "ShareToken",
                table: "presentations");

            migrationBuilder.DropColumn(
                name: "ShareTokenExpiresAtUtc",
                table: "presentations");
        }
    }
}
