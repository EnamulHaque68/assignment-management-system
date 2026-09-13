using AssignmentManagement.Domain.Entities;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace AssignmentManagement.Infrastructure.Data;

/// <summary>
/// Central place that exposes every MongoDB collection used by the app.
/// Repositories depend on this instead of touching IMongoDatabase directly.
/// </summary>
public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IOptions<MongoDbSettings> settings)
    {
        var client = new MongoClient(settings.Value.ConnectionString);
        _database = client.GetDatabase(settings.Value.DatabaseName);
    }

    public IMongoCollection<User> Users => _database.GetCollection<User>("users");
    public IMongoCollection<Role> Roles => _database.GetCollection<Role>("roles");
    public IMongoCollection<Class> Classes => _database.GetCollection<Class>("classes");
    public IMongoCollection<Subject> Subjects => _database.GetCollection<Subject>("subjects");
    public IMongoCollection<TeacherAssignment> TeacherAssignments => _database.GetCollection<TeacherAssignment>("teacherAssignments");
    public IMongoCollection<Assignment> Assignments => _database.GetCollection<Assignment>("assignments");
    public IMongoCollection<Submission> Submissions => _database.GetCollection<Submission>("submissions");
}
