using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AssignmentManagement.Domain.Entities;

public class User : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;

    [BsonRepresentation(BsonType.ObjectId)]
    public string RoleId { get; set; } = string.Empty;

    // Not stored in Mongo directly as an FK - just an id reference.
    [BsonIgnoreIfNull]
    public string? ClassId { get; set; }

    [BsonIgnoreIfNull]
    public string? AvatarUrl { get; set; }

    [BsonIgnoreIfNull]
    public string? PhoneNumber { get; set; }

    [BsonIgnoreIfNull]
    public string? Bio { get; set; }

    [BsonIgnoreIfNull]
    public string? Address { get; set; }

    [BsonIgnoreIfNull]
    public string? Department { get; set; }

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Populated at read time only (not persisted) so controllers/services
    // can reason about role by name instead of re-querying every time.
    [BsonIgnore]
    public string? RoleName { get; set; }
}
