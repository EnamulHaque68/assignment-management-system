namespace AssignmentManagement.Domain.Entities;

/// <summary>
/// Links a Teacher to a Class + Subject pair they are allowed to teach.
/// This is what Assignment creation is validated against (RULE 9).
/// </summary>
public class TeacherAssignment : BaseEntity
{
    public string TeacherId { get; set; } = string.Empty;
    public string ClassId { get; set; } = string.Empty;
    public string SubjectId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
