using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Application.DTOs.Submissions;

public class SubmissionResponse
{
    public string Id { get; set; } = string.Empty;
    public string AssignmentId { get; set; } = string.Empty;
    public string AssignmentTitle { get; set; } = string.Empty;
    public string StudentId { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int? Marks { get; set; }
    public int MaximumMarks { get; set; }
    public string? Feedback { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class CreateSubmissionRequest
{
    [Required] public string AssignmentId { get; set; } = string.Empty;
    [Required, MinLength(1)] public string Answer { get; set; } = string.Empty;
}

public class UpdateSubmissionRequest
{
    [Required, MinLength(1)] public string Answer { get; set; } = string.Empty;
}

public class ReviewSubmissionRequest
{
    [Required, Range(0, int.MaxValue)] public int Marks { get; set; }
    public string? Feedback { get; set; }

    /// Reviewed | Rejected - defaults to Reviewed when omitted.
    public string? Status { get; set; }
}
