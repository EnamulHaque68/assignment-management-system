using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AssignmentManagement.Domain.Entities;

public abstract class BaseEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();
}
