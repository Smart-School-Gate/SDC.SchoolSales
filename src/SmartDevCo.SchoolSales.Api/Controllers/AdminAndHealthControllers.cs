using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartDevCo.SchoolSales.Contracts.Common;
using SmartDevCo.SchoolSales.Contracts.DTOs;
using SmartDevCo.SchoolSales.Core.Interfaces;
using SmartDevCo.SchoolSales.Infrastructure.Data;

namespace SmartDevCo.SchoolSales.Api.Controllers;

[ApiController]
[Route("api/v1/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<TeamMemberDto>>>> GetUsers()
    {
        var result = await _userService.GetUsersAsync();
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<TeamMemberDto>>> GetUserById(Guid id)
    {
        var result = await _userService.GetUserByIdAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<TeamMemberDto>>> CreateUser([FromBody] CreateUserRequest request)
    {
        var result = await _userService.CreateUserAsync(request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return CreatedAtAction(nameof(GetUserById), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<TeamMemberDto>>> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
    {
        var result = await _userService.UpdateUserAsync(id, request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPost("{id:guid}/set-active")]
    public async Task<ActionResult<ApiResponse<bool>>> SetActiveStatus(Guid id, [FromBody] bool isActive)
    {
        var result = await _userService.SetActiveStatusAsync(id, isActive);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }
}

[ApiController]
[Route("api/v1/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<DashboardStatsDto>>> GetStats()
    {
        var result = await _dashboardService.GetDashboardStatsAsync();
        return Ok(result);
    }
}

[ApiController]
[Route("api/v1/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("performance")]
    public async Task<ActionResult<ApiResponse<PerformanceReportDto>>> GetPerformanceReport([FromQuery] PerformanceReportRequest request)
    {
        var result = await _reportService.GetPerformanceReportAsync(request);
        return Ok(result);
    }
}

[ApiController]
[Route("api/v1/health")]
public class HealthController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public HealthController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<object>>> CheckHealth()
    {
        try
        {
            bool canConnect = await _db.Database.CanConnectAsync();
            return Ok(ApiResponse<object>.Ok(new
            {
                Status = "Healthy",
                DatabaseConnected = canConnect,
                TimestampUtc = DateTime.UtcNow,
                ServerTimezone = "Africa/Cairo (UTC+2)"
            }, "SDC.SchoolSales API is healthy and operational."));
        }
        catch (Exception ex)
        {
            return StatusCode(503, ApiResponse<object>.Fail("Health check failed", new List<string> { ex.Message }));
        }
    }
}
