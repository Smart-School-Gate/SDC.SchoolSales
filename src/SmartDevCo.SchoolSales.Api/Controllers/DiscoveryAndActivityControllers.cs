using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartDevCo.SchoolSales.Contracts.Common;
using SmartDevCo.SchoolSales.Contracts.DTOs;
using SmartDevCo.SchoolSales.Contracts.Enums;
using SmartDevCo.SchoolSales.Core.Interfaces;

namespace SmartDevCo.SchoolSales.Api.Controllers;

[ApiController]
[Route("api/v1/discovery")]
[Authorize]
public class DiscoveryController : ControllerBase
{
    private readonly IDiscoveryService _discoveryService;

    public DiscoveryController(IDiscoveryService discoveryService)
    {
        _discoveryService = discoveryService;
    }

    [HttpGet("questions")]
    public async Task<ActionResult<ApiResponse<List<QuestionCategoryDto>>>> GetQuestions([FromQuery] ProductInterest? product)
    {
        var result = await _discoveryService.GetCategoriesAndQuestionsAsync(product);
        return Ok(result);
    }

    [HttpPost("questions")]
    public async Task<ActionResult<ApiResponse<QuestionTemplateDto>>> CreateQuestionTemplate([FromBody] CreateQuestionTemplateRequest request)
    {
        var result = await _discoveryService.CreateQuestionTemplateAsync(request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPut("questions/{id:guid}")]
    public async Task<ActionResult<ApiResponse<QuestionTemplateDto>>> UpdateQuestionTemplate(Guid id, [FromBody] UpdateQuestionTemplateRequest request)
    {
        var result = await _discoveryService.UpdateQuestionTemplateAsync(id, request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpDelete("questions/{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteQuestionTemplate(Guid id)
    {
        var result = await _discoveryService.DeleteQuestionTemplateAsync(id);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpGet("visits/{visitId:guid}/answers")]
    public async Task<ActionResult<ApiResponse<List<VisitAnswerDto>>>> GetVisitAnswers(Guid visitId)
    {
        var result = await _discoveryService.GetVisitAnswersAsync(visitId);
        return Ok(result);
    }

    [HttpGet("schools/{schoolId:guid}/answers")]
    public async Task<ActionResult<ApiResponse<List<VisitAnswerDto>>>> GetSchoolLatestAnswers(Guid schoolId)
    {
        var result = await _discoveryService.GetSchoolLatestAnswersAsync(schoolId);
        return Ok(result);
    }
}

[ApiController]
[Route("api/v1/activities")]
[Authorize]
public class ActivitiesController : ControllerBase
{
    private readonly IActivityService _activityService;

    public ActivitiesController(IActivityService activityService)
    {
        _activityService = activityService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<ActivityDto>>>> GetActivities([FromQuery] Guid? schoolId, [FromQuery] Guid? userId)
    {
        var result = await _activityService.GetActivitiesAsync(schoolId, userId);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ActivityDto>>> CreateActivity([FromBody] CreateActivityRequest request)
    {
        var result = await _activityService.CreateActivityAsync(request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPost("{id:guid}/toggle-complete")]
    public async Task<ActionResult<ApiResponse<ActivityDto>>> ToggleComplete(Guid id)
    {
        var result = await _activityService.ToggleCompleteAsync(id);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteActivity(Guid id)
    {
        var result = await _activityService.DeleteActivityAsync(id);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }
}

[ApiController]
[Route("api/v1/follow-ups")]
[Authorize]
public class FollowUpsController : ControllerBase
{
    private readonly IFollowUpService _followUpService;

    public FollowUpsController(IFollowUpService followUpService)
    {
        _followUpService = followUpService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<FollowUpDto>>>> GetFollowUps([FromQuery] Guid? schoolId, [FromQuery] Guid? userId, [FromQuery] bool? onlyPending)
    {
        var result = await _followUpService.GetFollowUpsAsync(schoolId, userId, onlyPending);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<FollowUpDto>>> CreateFollowUp([FromBody] CreateFollowUpRequest request)
    {
        var result = await _followUpService.CreateFollowUpAsync(request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<FollowUpDto>>> UpdateFollowUp(Guid id, [FromBody] UpdateFollowUpRequest request)
    {
        var result = await _followUpService.UpdateFollowUpAsync(id, request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteFollowUp(Guid id)
    {
        var result = await _followUpService.DeleteFollowUpAsync(id);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }
}
