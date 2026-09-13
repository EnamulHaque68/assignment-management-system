using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Application.DTOs.Assignments;

public class AssignmentResponse
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ClassId { get; set; } = string.Empty;
    public string ClassName { get; set; } = string.Empty;
    public string SubjectId { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public string TeacherId { get; set; } = string.Empty;
    public string TeacherName { get; set; } = string.Empty;
    public DateTime Deadline { get; set; }
    public int MaximumMarks { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    /// Populated only for a Student caller - null means "not yet submitted".
    public string? MySubmissionStatus { get; set; }
    public int? MySubmissionMarks { get; set; }
}

public class CreateAssignmentRequest
{
    [Required] public string Title { get; set; } = string.Empty;
    [Required] public string Description { get; set; } = string.Empty;
    [Required] public string ClassId { get; set; } = string.Empty;
    [Required] public string SubjectId { get; set; } = string.Empty;
    [Required] public DateTime Deadline { get; set; }
    [Range(1, int.MaxValue)] public int MaximumMarks { get; set; }

    /// If true, creates directly as Published; otherwise saved as Draft.
    public bool PublishNow { get; set; } = false;
}

public class UpdateAssignmentRequest
{
    [Required] public string Title { get; set; } = string.Empty;
    [Required] public string Description { get; set; } = string.Empty;
    [Required] public string ClassId { get; set; } = string.Empty;
    [Required] public string SubjectId { get; set; } = string.Empty;
    [Required] public DateTime Deadline { get; set; }
    [Range(1, int.MaxValue)] public int MaximumMarks { get; set; }
}
