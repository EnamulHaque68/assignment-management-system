using AssignmentManagement.Application.Interfaces.Repositories;
using AssignmentManagement.Domain.Enums;
using AssignmentManagement.Infrastructure.Data;
using MongoDB.Driver;
using DomainAssignment = AssignmentManagement.Domain.Entities.Assignment;

namespace AssignmentManagement.Infrastructure.Repositories;

public class AssignmentRepository : IAssignmentRepository
{
    private readonly MongoDbContext _context;

    public AssignmentRepository(MongoDbContext context) => _context = context;

    public async Task<DomainAssignment?> GetByIdAsync(string id) =>
        await _context.Assignments.Find(a => a.Id == id).FirstOrDefaultAsync();

    public async Task<List<DomainAssignment>> GetAllAsync() =>
        await _context.Assignments.Find(_ => true).SortByDescending(a => a.CreatedAt).ToListAsync();

    public async Task<List<DomainAssignment>> GetByTeacherIdAsync(string teacherId) =>
        await _context.Assignments.Find(a => a.TeacherId == teacherId)
            .SortByDescending(a => a.CreatedAt).ToListAsync();

    public async Task<List<DomainAssignment>> GetPublishedByClassIdAsync(string classId) =>
        await _context.Assignments
            .Find(a => a.ClassId == classId && a.Status == AssignmentStatus.Published)
            .SortByDescending(a => a.CreatedAt).ToListAsync();

    public async Task<DomainAssignment> CreateAsync(DomainAssignment entity)
    {
        await _context.Assignments.InsertOneAsync(entity);
        return entity;
    }

    public async Task UpdateAsync(DomainAssignment entity) =>
        await _context.Assignments.ReplaceOneAsync(a => a.Id == entity.Id, entity);

    public async Task DeleteAsync(string id) =>
        await _context.Assignments.DeleteOneAsync(a => a.Id == id);

    public async Task EnsureIndexesAsync()
    {
        var models = new List<CreateIndexModel<DomainAssignment>>
        {
            new(Builders<DomainAssignment>.IndexKeys.Ascending(a => a.ClassId)),
            new(Builders<DomainAssignment>.IndexKeys.Ascending(a => a.SubjectId)),
            new(Builders<DomainAssignment>.IndexKeys.Ascending(a => a.TeacherId)),
            new(Builders<DomainAssignment>.IndexKeys.Ascending(a => a.Deadline)),
            new(Builders<DomainAssignment>.IndexKeys.Ascending(a => a.Status)),
        };
        await _context.Assignments.Indexes.CreateManyAsync(models);
    }
}
