using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartDevCo.SchoolSales.Contracts.Common;
using SmartDevCo.SchoolSales.Contracts.DTOs;
using SmartDevCo.SchoolSales.Contracts.Enums;
using SmartDevCo.SchoolSales.Core.Interfaces;

namespace SmartDevCo.SchoolSales.Api.Controllers;

[ApiController]
[Route("api/v1/sales-targets")]
[Authorize]
public class SalesTargetsController : ControllerBase
{
    private readonly ISalesTargetService _targetService;

    public SalesTargetsController(ISalesTargetService targetService)
    {
        _targetService = targetService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<SalesTargetDto>>>> GetTargets([FromQuery] int? year, [FromQuery] PeriodType? periodType, [FromQuery] Guid? userId)
    {
        var result = await _targetService.GetTargetsAsync(year, periodType, userId);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<SalesTargetDto>>> GetTargetById(Guid id)
    {
        var result = await _targetService.GetTargetByIdAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<SalesTargetDto>>> CreateTarget([FromBody] CreateSalesTargetRequest request)
    {
        var result = await _targetService.CreateTargetAsync(request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return CreatedAtAction(nameof(GetTargetById), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<SalesTargetDto>>> UpdateTarget(Guid id, [FromBody] UpdateSalesTargetRequest request)
    {
        var result = await _targetService.UpdateTargetAsync(id, request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteTarget(Guid id)
    {
        var result = await _targetService.DeleteTargetAsync(id);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }
}

[ApiController]
[Route("api/v1/presentations")]
[Authorize]
public class PresentationsController : ControllerBase
{
    private readonly IPresentationService _presentationService;

    public PresentationsController(IPresentationService presentationService)
    {
        _presentationService = presentationService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<PresentationDto>>>> GetPresentations([FromQuery] Guid? schoolId, [FromQuery] bool? templatesOnly)
    {
        var result = await _presentationService.GetPresentationsAsync(schoolId, templatesOnly);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<PresentationDto>>> GetPresentationById(Guid id)
    {
        var result = await _presentationService.GetPresentationByIdAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<PresentationDto>>> CreatePresentation([FromBody] CreatePresentationRequest request)
    {
        var result = await _presentationService.CreatePresentationAsync(request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return CreatedAtAction(nameof(GetPresentationById), new { id = result.Data!.Id }, result);
    }

    [HttpPost("{templateId:guid}/duplicate-for-school/{schoolId:guid}")]
    public async Task<ActionResult<ApiResponse<PresentationDto>>> DuplicateForSchool(Guid templateId, Guid schoolId)
    {
        var result = await _presentationService.DuplicateForSchoolAsync(templateId, schoolId);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPost("{presentationId:guid}/slides")]
    public async Task<ActionResult<ApiResponse<PresentationSlideDto>>> AddSlide(Guid presentationId, [FromBody] CreateSlideRequest request)
    {
        var result = await _presentationService.AddSlideAsync(presentationId, request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPut("slides/{slideId:guid}")]
    public async Task<ActionResult<ApiResponse<PresentationSlideDto>>> UpdateSlide(Guid slideId, [FromBody] UpdateSlideRequest request)
    {
        var result = await _presentationService.UpdateSlideAsync(slideId, request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpDelete("slides/{slideId:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteSlide(Guid slideId)
    {
        var result = await _presentationService.DeleteSlideAsync(slideId);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPost("{presentationId:guid}/reorder-slides")]
    public async Task<ActionResult<ApiResponse<bool>>> ReorderSlides(Guid presentationId, [FromBody] ReorderSlidesRequest request)
    {
        var result = await _presentationService.ReorderSlidesAsync(presentationId, request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPost("{presentationId:guid}/save-version")]
    public async Task<ActionResult<ApiResponse<bool>>> SaveVersion(Guid presentationId)
    {
        var result = await _presentationService.SaveVersionAsync(presentationId);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }
}

[ApiController]
[Route("api/v1/knowledge-base")]
[Authorize]
public class KnowledgeBaseController : ControllerBase
{
    private readonly IKnowledgeBaseService _kbService;

    public KnowledgeBaseController(IKnowledgeBaseService kbService)
    {
        _kbService = kbService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<QACategoryDto>>>> GetQA([FromQuery] ProductInterest? product)
    {
        var result = await _kbService.GetCategoriesAndQAAsync(product);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<QATemplateDto>>> CreateQA([FromBody] CreateQARequest request)
    {
        var result = await _kbService.CreateQAAsync(request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<QATemplateDto>>> UpdateQA(Guid id, [FromBody] UpdateQARequest request)
    {
        var result = await _kbService.UpdateQAAsync(id, request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteQA(Guid id)
    {
        var result = await _kbService.DeleteQAAsync(id);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }
}
