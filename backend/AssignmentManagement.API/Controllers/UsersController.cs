using AssignmentManagement.Application.DTOs.Common;
using AssignmentManagement.Application.DTOs.Users;
using AssignmentManagement.Application.Interfaces.Services;
using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = RoleName.Admin)]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService) => _userService = userService;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(ApiResponse<List<UserResponse>>.Ok(await _userService.GetAllAsync()));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id) =>
        Ok(ApiResponse<UserResponse>.Ok(await _userService.GetByIdAsync(id)));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        var result = await _userService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<UserResponse>.Ok(result, "User created."));
    }

    [HttpPost("batch")]
    public async Task<IActionResult> BatchCreate([FromBody] BatchCreateUsersRequest request)
    {
        var result = await _userService.BatchCreateAsync(request);
        return Ok(ApiResponse<BatchCreateUsersResult>.Ok(result, $"Created {result.CreatedCount} users."));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateUserRequest request) =>
        Ok(ApiResponse<UserResponse>.Ok(await _userService.UpdateAsync(id, request), "User updated."));

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        await _userService.DeleteAsync(id);
        return Ok(ApiResponse<object>.Ok(new { }, "User deleted."));
    }
}
