using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartDevCo.SchoolSales.Contracts.Common;
using SmartDevCo.SchoolSales.Contracts.DTOs;
using SmartDevCo.SchoolSales.Core.Interfaces;

namespace SmartDevCo.SchoolSales.Api.Controllers;

[ApiController]
[Route("api/v1/assignments")]
[Authorize]
public class AssignmentsController : ControllerBase
{
    private readonly IAssignmentService _assignmentService;

    public AssignmentsController(IAssignmentService assignmentService)
    {
        _assignmentService = assignmentService;
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<bool>>> AssignSchool([FromBody] AssignSchoolRequest request)
    {
        var result = await _assignmentService.AssignSchoolAsync(request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<ApiResponse<int>>> BulkAssign([FromBody] BulkAssignRequest request)
    {
        var result = await _assignmentService.BulkAssignAsync(request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpGet("history/{schoolId:guid}")]
    public async Task<ActionResult<ApiResponse<List<SchoolAssignmentHistoryDto>>>> GetHistory(Guid schoolId)
    {
        var result = await _assignmentService.GetAssignmentHistoryAsync(schoolId);
        return Ok(result);
    }

    [HttpGet("unassigned")]
    public async Task<ActionResult<ApiResponse<List<SchoolDto>>>> GetUnassigned()
    {
        var result = await _assignmentService.GetUnassignedSchoolsAsync();
        return Ok(result);
    }
}

[ApiController]
[Route("api/v1/visits")]
[Authorize]
public class VisitsController : ControllerBase
{
    private readonly IVisitService _visitService;

    public VisitsController(IVisitService visitService)
    {
        _visitService = visitService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<VisitSummaryDto>>>> GetVisits([FromQuery] VisitFilterRequest filter)
    {
        var result = await _visitService.GetVisitsAsync(filter);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<VisitDto>>> GetVisitById(Guid id)
    {
        var result = await _visitService.GetVisitByIdAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<VisitDto>>> CreateVisit([FromBody] CreateVisitRequest request)
    {
        var result = await _visitService.CreateVisitAsync(request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return CreatedAtAction(nameof(GetVisitById), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<VisitDto>>> UpdateVisit(Guid id, [FromBody] UpdateVisitRequest request)
    {
        var result = await _visitService.UpdateVisitAsync(id, request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteVisit(Guid id)
    {
        var result = await _visitService.DeleteVisitAsync(id);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }
}
