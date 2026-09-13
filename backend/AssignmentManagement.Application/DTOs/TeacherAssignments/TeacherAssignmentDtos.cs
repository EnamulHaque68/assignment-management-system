using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Application.DTOs.TeacherAssignments;

public class TeacherAssignmentResponse
{
    public string Id { get; set; } = string.Empty;
    public string TeacherId { get; set; } = string.Empty;
    public string TeacherName { get; set; } = string.Empty;
    public string ClassId { get; set; } = string.Empty;
    public string ClassName { get; set; } = string.Empty;
    public string SubjectId { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CreateTeacherAssignmentRequest
{
    [Required] public string TeacherId { get; set; } = string.Empty;
    [Required] public string ClassId { get; set; } = string.Empty;
    [Required] public string SubjectId { get; set; } = string.Empty;
}
