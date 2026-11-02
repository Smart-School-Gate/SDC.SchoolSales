using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartDevCo.SchoolSales.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSchoolDiscoveryAnswers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DiscoveryAnswersJson",
                table: "schools",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DiscoveryAnswersJson",
                table: "schools");
        }
    }
}
