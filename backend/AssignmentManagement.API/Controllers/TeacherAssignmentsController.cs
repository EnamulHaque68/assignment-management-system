using AssignmentManagement.Application.DTOs.Common;
using AssignmentManagement.Application.DTOs.TeacherAssignments;
using AssignmentManagement.Application.Interfaces.Services;
using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.API.Controllers;

[ApiController]
[Route("api/teacher-assignments")]
[Authorize(Roles = RoleName.Admin)]
public class TeacherAssignmentsController : ControllerBase
{
    private readonly ITeacherAssignmentService _service;

    public TeacherAssignmentsController(ITeacherAssignmentService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(ApiResponse<List<TeacherAssignmentResponse>>.Ok(await _service.GetAllAsync()));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTeacherAssignmentRequest request) =>
        Ok(ApiResponse<TeacherAssignmentResponse>.Ok(await _service.CreateAsync(request), "Teacher assigned."));

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse<object>.Ok(new { }, "Teacher assignment removed."));
    }
}
