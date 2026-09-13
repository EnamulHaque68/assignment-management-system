using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Application.DTOs.Users;

public class UserResponse
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? ClassId { get; set; }
    public string? ClassName { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? AvatarUrl { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Bio { get; set; }
    public string? Address { get; set; }
    public string? Department { get; set; }
}

public class UserProfileResponse : UserResponse
{
    // Academic & role stats
    public int TotalAssignments { get; set; }
    public int CompletedSubmissions { get; set; }
    public int PendingSubmissions { get; set; }
    public double AverageScore { get; set; }
    public int AssignedClassesCount { get; set; }
    public int AssignedSubjectsCount { get; set; }
    public int TotalStudentsCount { get; set; }
    public List<string> AssignedClassNames { get; set; } = new();
    public List<string> AssignedSubjectNames { get; set; } = new();
}

public class CreateUserRequest
{
    [Required] public string FullName { get; set; } = string.Empty;
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
    [Required, MinLength(6)] public string Password { get; set; } = string.Empty;

    /// Admin | Teacher | Student
    [Required] public string Role { get; set; } = string.Empty;

    /// Required when Role == Student
    public string? ClassId { get; set; }
    public string? AvatarUrl { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Bio { get; set; }
    public string? Address { get; set; }
    public string? Department { get; set; }
}

public class UpdateUserRequest
{
    [Required] public string FullName { get; set; } = string.Empty;
    public string? ClassId { get; set; }
    public bool IsActive { get; set; } = true;

    /// Optional - only set when an admin wants to reset the password.
    public string? Password { get; set; }
    public string? AvatarUrl { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Bio { get; set; }
    public string? Address { get; set; }
    public string? Department { get; set; }
}

public class UpdateProfileRequest
{
    [Required] public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Bio { get; set; }
    public string? Address { get; set; }
    public string? Department { get; set; }
}

public class ChangePasswordRequest
{
    [Required] public string CurrentPassword { get; set; } = string.Empty;
    [Required, MinLength(6)] public string NewPassword { get; set; } = string.Empty;
}

public class BatchCreateUsersRequest
{
    public List<CreateUserRequest> Users { get; set; } = new();
}

public class BatchCreateUsersResult
{
    public int CreatedCount { get; set; }
    public List<UserResponse> CreatedUsers { get; set; } = new();
    public List<string> Errors { get; set; } = new();
}
