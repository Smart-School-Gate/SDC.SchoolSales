using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartDevCo.SchoolSales.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSchoolIntelligenceProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IntelligenceProfileJson",
                table: "schools",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IntelligenceProfileJson",
                table: "schools");
        }
    }
}
