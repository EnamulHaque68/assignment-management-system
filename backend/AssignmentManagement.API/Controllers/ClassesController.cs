using AssignmentManagement.Application.DTOs.Classes;
using AssignmentManagement.Application.DTOs.Common;
using AssignmentManagement.Application.Interfaces.Services;
using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.API.Controllers;

[ApiController]
[Route("api/classes")]
[Authorize]
public class ClassesController : ControllerBase
{
    private readonly IClassService _classService;

    public ClassesController(IClassService classService) => _classService = classService;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(ApiResponse<List<ClassResponse>>.Ok(await _classService.GetAllAsync()));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id) =>
        Ok(ApiResponse<ClassResponse>.Ok(await _classService.GetByIdAsync(id)));

    [HttpPost]
    [Authorize(Roles = RoleName.Admin)]
    public async Task<IActionResult> Create([FromBody] UpsertClassRequest request)
    {
        var result = await _classService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<ClassResponse>.Ok(result, "Class created."));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = RoleName.Admin)]
    public async Task<IActionResult> Update(string id, [FromBody] UpsertClassRequest request) =>
        Ok(ApiResponse<ClassResponse>.Ok(await _classService.UpdateAsync(id, request), "Class updated."));

    [HttpDelete("{id}")]
    [Authorize(Roles = RoleName.Admin)]
    public async Task<IActionResult> Delete(string id)
    {
        await _classService.DeleteAsync(id);
        return Ok(ApiResponse<object>.Ok(new { }, "Class deleted."));
    }
}
