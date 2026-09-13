using AssignmentManagement.Application.DTOs.Common;
using AssignmentManagement.Application.DTOs.Subjects;
using AssignmentManagement.Application.Interfaces.Services;
using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.API.Controllers;

[ApiController]
[Route("api/subjects")]
[Authorize]
public class SubjectsController : ControllerBase
{
    private readonly ISubjectService _subjectService;

    public SubjectsController(ISubjectService subjectService) => _subjectService = subjectService;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(ApiResponse<List<SubjectResponse>>.Ok(await _subjectService.GetAllAsync()));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id) =>
        Ok(ApiResponse<SubjectResponse>.Ok(await _subjectService.GetByIdAsync(id)));

    [HttpPost]
    [Authorize(Roles = RoleName.Admin)]
    public async Task<IActionResult> Create([FromBody] UpsertSubjectRequest request)
    {
        var result = await _subjectService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<SubjectResponse>.Ok(result, "Subject created."));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = RoleName.Admin)]
    public async Task<IActionResult> Update(string id, [FromBody] UpsertSubjectRequest request) =>
        Ok(ApiResponse<SubjectResponse>.Ok(await _subjectService.UpdateAsync(id, request), "Subject updated."));

    [HttpDelete("{id}")]
    [Authorize(Roles = RoleName.Admin)]
    public async Task<IActionResult> Delete(string id)
    {
        await _subjectService.DeleteAsync(id);
        return Ok(ApiResponse<object>.Ok(new { }, "Subject deleted."));
    }
}
