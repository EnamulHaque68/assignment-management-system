using AssignmentManagement.Application.DTOs.Common;
using AssignmentManagement.Application.DTOs.Users;
using AssignmentManagement.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.API.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;

    public ProfileController(IProfileService profileService)
    {
        _profileService = profileService;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = this.GetUserId();
        var profile = await _profileService.GetProfileAsync(userId);
        return Ok(ApiResponse<UserProfileResponse>.Ok(profile));
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = this.GetUserId();
        var updated = await _profileService.UpdateProfileAsync(userId, request);
        return Ok(ApiResponse<UserProfileResponse>.Ok(updated, "Profile updated successfully."));
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = this.GetUserId();
        await _profileService.ChangePasswordAsync(userId, request);
        return Ok(ApiResponse<object>.Ok(new { }, "Password changed successfully."));
    }
}
