using AssignmentManagement.Application.DTOs.Common;
using AssignmentManagement.Application.DTOs.Submissions;
using AssignmentManagement.Application.Interfaces.Services;
using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.API.Controllers;

[ApiController]
[Route("api/submissions")]
[Authorize]
public class SubmissionsController : ControllerBase
{
    private readonly ISubmissionService _submissionService;

    public SubmissionsController(ISubmissionService submissionService) => _submissionService = submissionService;

    [HttpPost]
    [Authorize(Roles = RoleName.Student)]
    public async Task<IActionResult> Create([FromBody] CreateSubmissionRequest request)
    {
        var result = await _submissionService.CreateAsync(request, this.GetUserId());
        return Ok(ApiResponse<SubmissionResponse>.Ok(result, "Submission created."));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = RoleName.Student)]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateSubmissionRequest request) =>
        Ok(ApiResponse<SubmissionResponse>.Ok(await _submissionService.UpdateAsync(id, request, this.GetUserId()), "Submission updated."));

    [HttpGet("my")]
    [Authorize(Roles = RoleName.Student)]
    public async Task<IActionResult> GetMy() =>
        Ok(ApiResponse<List<SubmissionResponse>>.Ok(await _submissionService.GetMyAsync(this.GetUserId())));

    [HttpGet("assignment/{assignmentId}")]
    [Authorize(Roles = RoleName.Teacher)]
    public async Task<IActionResult> GetByAssignment(string assignmentId) =>
        Ok(ApiResponse<List<SubmissionResponse>>.Ok(await _submissionService.GetByAssignmentAsync(assignmentId, this.GetUserId())));

    [HttpPut("{id}/review")]
    [Authorize(Roles = RoleName.Teacher)]
    public async Task<IActionResult> Review(string id, [FromBody] ReviewSubmissionRequest request) =>
        Ok(ApiResponse<SubmissionResponse>.Ok(await _submissionService.ReviewAsync(id, request, this.GetUserId()), "Submission reviewed."));
}
