using System.Reflection;
using AssignmentManagement.API.Controllers;
using AssignmentManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace AssignmentManagement.Tests;

/// <summary>
/// These tests do not spin up the full HTTP pipeline; instead they assert
/// that the [Authorize(Roles = ...)] contract on each controller/action is
/// exactly what the spec requires. This is what actually prevents, e.g.,
/// a Student calling POST /api/assignments or a non-Admin calling
/// /api/users - enforcement happens in ASP.NET Core's authorization
/// middleware, which reads these attributes.
/// </summary>
public class AuthorizationTests
{
    private static AuthorizeAttribute? GetMethodAuthorize(Type controller, string methodName) =>
        controller.GetMethod(methodName)?.GetCustomAttribute<AuthorizeAttribute>();

    private static AuthorizeAttribute? GetClassAuthorize(Type controller) =>
        controller.GetCustomAttribute<AuthorizeAttribute>();

    // TEST 3: Student cannot create assignment - POST /api/assignments requires Teacher role.
    [Fact]
    public void CreateAssignment_RequiresTeacherRole()
    {
        var attribute = GetMethodAuthorize(typeof(AssignmentsController), nameof(AssignmentsController.Create));

        Assert.NotNull(attribute);
        Assert.Equal(RoleName.Teacher, attribute!.Roles);
    }

    // TEST 17 / 18: Admin-only endpoints reject non-admins.
    [Fact]
    public void UsersController_RequiresAdminRole()
    {
        var attribute = GetClassAuthorize(typeof(UsersController));

        Assert.NotNull(attribute);
        Assert.Equal(RoleName.Admin, attribute!.Roles);
    }

    [Fact]
    public void TeacherAssignmentsController_RequiresAdminRole()
    {
        var attribute = GetClassAuthorize(typeof(TeacherAssignmentsController));

        Assert.NotNull(attribute);
        Assert.Equal(RoleName.Admin, attribute!.Roles);
    }

    [Fact]
    public void ReviewSubmission_RequiresTeacherRole()
    {
        var attribute = GetMethodAuthorize(typeof(SubmissionsController), nameof(SubmissionsController.Review));

        Assert.NotNull(attribute);
        Assert.Equal(RoleName.Teacher, attribute!.Roles);
    }

    [Fact]
    public void CreateSubmission_RequiresStudentRole()
    {
        var attribute = GetMethodAuthorize(typeof(SubmissionsController), nameof(SubmissionsController.Create));

        Assert.NotNull(attribute);
        Assert.Equal(RoleName.Student, attribute!.Roles);
    }
}
