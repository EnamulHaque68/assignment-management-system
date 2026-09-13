using AssignmentManagement.Application.DTOs.Assignments;
using AssignmentManagement.Application.DTOs.Common;
using AssignmentManagement.Application.Interfaces.Services;
using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.API.Controllers;

[ApiController]
[Route("api/assignments")]
[Authorize]
public class AssignmentsController : ControllerBase
{
    private readonly IAssignmentService _assignmentService;

    public AssignmentsController(IAssignmentService assignmentService) => _assignmentService = assignmentService;

    /// Admin: all. Teacher: own. Student: published + own class. (Part 18)
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _assignmentService.GetForCallerAsync(this.GetUserId(), this.GetRole(), this.GetClassId());
        return Ok(ApiResponse<List<AssignmentResponse>>.Ok(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var result = await _assignmentService.GetByIdAsync(id, this.GetUserId(), this.GetRole(), this.GetClassId());
        return Ok(ApiResponse<AssignmentResponse>.Ok(result));
    }

    [HttpPost]
    [Authorize(Roles = RoleName.Teacher)]
    public async Task<IActionResult> Create([FromBody] CreateAssignmentRequest request)
    {
        var result = await _assignmentService.CreateAsync(request, this.GetUserId());
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<AssignmentResponse>.Ok(result, "Assignment created."));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = RoleName.Teacher)]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateAssignmentRequest request) =>
        Ok(ApiResponse<AssignmentResponse>.Ok(await _assignmentService.UpdateAsync(id, request, this.GetUserId()), "Assignment updated."));

    [HttpDelete("{id}")]
    [Authorize(Roles = RoleName.Teacher)]
    public async Task<IActionResult> Delete(string id)
    {
        await _assignmentService.DeleteAsync(id, this.GetUserId());
        return Ok(ApiResponse<object>.Ok(new { }, "Assignment deleted."));
    }

    [HttpPatch("{id}/publish")]
    [Authorize(Roles = RoleName.Teacher)]
    public async Task<IActionResult> Publish(string id) =>
        Ok(ApiResponse<AssignmentResponse>.Ok(await _assignmentService.SetStatusAsync(id, this.GetUserId(), true), "Assignment published."));

    [HttpPatch("{id}/draft")]
    [Authorize(Roles = RoleName.Teacher)]
    public async Task<IActionResult> Draft(string id) =>
        Ok(ApiResponse<AssignmentResponse>.Ok(await _assignmentService.SetStatusAsync(id, this.GetUserId(), false), "Assignment set to draft."));
}
