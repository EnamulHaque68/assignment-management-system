using AssignmentManagement.Application.Interfaces.Repositories;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Infrastructure.Data;
using MongoDB.Driver;

namespace AssignmentManagement.Infrastructure.Repositories;

public class SubmissionRepository : ISubmissionRepository
{
    private readonly MongoDbContext _context;

    public SubmissionRepository(MongoDbContext context) => _context = context;

    public async Task<Submission?> GetByIdAsync(string id) =>
        await _context.Submissions.Find(s => s.Id == id).FirstOrDefaultAsync();

    public async Task<Submission?> GetByAssignmentAndStudentAsync(string assignmentId, string studentId) =>
        await _context.Submissions
            .Find(s => s.AssignmentId == assignmentId && s.StudentId == studentId)
            .FirstOrDefaultAsync();

    public async Task<List<Submission>> GetByAssignmentIdAsync(string assignmentId) =>
        await _context.Submissions.Find(s => s.AssignmentId == assignmentId)
            .SortByDescending(s => s.SubmittedAt).ToListAsync();

    public async Task<List<Submission>> GetByStudentIdAsync(string studentId) =>
        await _context.Submissions.Find(s => s.StudentId == studentId)
            .SortByDescending(s => s.SubmittedAt).ToListAsync();

    public async Task<Submission> CreateAsync(Submission entity)
    {
        await _context.Submissions.InsertOneAsync(entity);
        return entity;
    }

    public async Task UpdateAsync(Submission entity) =>
        await _context.Submissions.ReplaceOneAsync(s => s.Id == entity.Id, entity);

    public async Task EnsureIndexesAsync()
    {
        var models = new List<CreateIndexModel<Submission>>
        {
            new(Builders<Submission>.IndexKeys.Ascending(s => s.AssignmentId)),
            new(Builders<Submission>.IndexKeys.Ascending(s => s.StudentId)),
            new(Builders<Submission>.IndexKeys.Ascending(s => s.Status)),
            // RULE 11: one student can have only one submission per assignment.
            new(
                Builders<Submission>.IndexKeys
                    .Ascending(s => s.AssignmentId)
                    .Ascending(s => s.StudentId),
                new CreateIndexOptions { Unique = true }
            ),
        };
        await _context.Submissions.Indexes.CreateManyAsync(models);
    }
}
