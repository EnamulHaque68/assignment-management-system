using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.API.Controllers;

/// <summary>
/// Small helpers for reading the authenticated user's claims (set at JWT
/// generation time in JwtTokenGenerator) from any controller.
/// </summary>
public static class ControllerBaseExtensions
{
    public static string GetUserId(this ControllerBase controller) =>
        controller.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;

    public static string GetRole(this ControllerBase controller) =>
        controller.User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

    public static string? GetClassId(this ControllerBase controller)
    {
        var value = controller.User.FindFirstValue("classId");
        return string.IsNullOrWhiteSpace(value) ? null : value;
    }
}
