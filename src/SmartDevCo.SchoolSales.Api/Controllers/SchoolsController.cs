using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartDevCo.SchoolSales.Contracts.Common;
using SmartDevCo.SchoolSales.Contracts.DTOs;
using SmartDevCo.SchoolSales.Core.Interfaces;

namespace SmartDevCo.SchoolSales.Api.Controllers;

[ApiController]
[Route("api/v1/schools")]
[Authorize]
public class SchoolsController : ControllerBase
{
    private readonly ISchoolService _schoolService;

    public SchoolsController(ISchoolService schoolService)
    {
        _schoolService = schoolService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<SchoolDto>>>> GetSchools([FromQuery] SchoolFilterRequest filter)
    {
        var result = await _schoolService.GetSchoolsAsync(filter);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<SchoolDetailDto>>> GetSchoolById(Guid id)
    {
        var result = await _schoolService.GetSchoolByIdAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<SchoolDto>>> CreateSchool([FromBody] CreateSchoolRequest request)
    {
        var result = await _schoolService.CreateSchoolAsync(request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return CreatedAtAction(nameof(GetSchoolById), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<SchoolDto>>> UpdateSchool(Guid id, [FromBody] UpdateSchoolRequest request)
    {
        var result = await _schoolService.UpdateSchoolAsync(id, request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPut("{id:guid}/intelligence")]
    public async Task<ActionResult<ApiResponse<SchoolDetailDto>>> UpdateSchoolIntelligence(Guid id, [FromBody] UpdateSchoolIntelligenceRequest request)
    {
        var result = await _schoolService.UpdateSchoolIntelligenceAsync(id, request.IntelligenceProfileJson);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPut("{id:guid}/discovery-answers")]
    public async Task<ActionResult<ApiResponse<SchoolDetailDto>>> UpdateSchoolDiscoveryAnswers(Guid id, [FromBody] UpdateSchoolDiscoveryAnswersRequest request)
    {
        var result = await _schoolService.UpdateSchoolDiscoveryAnswersAsync(id, request.DiscoveryAnswersJson);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteSchool(Guid id)
    {
        var result = await _schoolService.DeleteSchoolAsync(id);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }
}

[ApiController]
[Route("api/v1/schools/{schoolId:guid}/contacts")]
[Authorize]
public class SchoolContactsController : ControllerBase
{
    private readonly ISchoolContactService _contactService;

    public SchoolContactsController(ISchoolContactService contactService)
    {
        _contactService = contactService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<SchoolContactDto>>>> GetContacts(Guid schoolId)
    {
        var result = await _contactService.GetContactsBySchoolIdAsync(schoolId);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<SchoolContactDto>>> AddContact(Guid schoolId, [FromBody] CreateContactRequest request)
    {
        var result = await _contactService.AddContactAsync(schoolId, request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPut("{contactId:guid}")]
    public async Task<ActionResult<ApiResponse<SchoolContactDto>>> UpdateContact(Guid schoolId, Guid contactId, [FromBody] UpdateContactRequest request)
    {
        var result = await _contactService.UpdateContactAsync(contactId, request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpDelete("{contactId:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteContact(Guid schoolId, Guid contactId)
    {
        var result = await _contactService.DeleteContactAsync(contactId);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }
}
