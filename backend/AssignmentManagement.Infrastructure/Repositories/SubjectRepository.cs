using AssignmentManagement.Application.Interfaces.Repositories;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Infrastructure.Data;
using MongoDB.Driver;

namespace AssignmentManagement.Infrastructure.Repositories;

public class SubjectRepository : ISubjectRepository
{
    private readonly MongoDbContext _context;

    public SubjectRepository(MongoDbContext context) => _context = context;

    public async Task<Subject?> GetByIdAsync(string id) =>
        await _context.Subjects.Find(s => s.Id == id).FirstOrDefaultAsync();

    public async Task<List<Subject>> GetAllAsync() =>
        await _context.Subjects.Find(_ => true).SortBy(s => s.Name).ToListAsync();

    public async Task<Subject> CreateAsync(Subject entity)
    {
        await _context.Subjects.InsertOneAsync(entity);
        return entity;
    }

    public async Task UpdateAsync(Subject entity) =>
        await _context.Subjects.ReplaceOneAsync(s => s.Id == entity.Id, entity);

    public async Task DeleteAsync(string id) =>
        await _context.Subjects.DeleteOneAsync(s => s.Id == id);

    public async Task<bool> CodeExistsAsync(string code) =>
        await _context.Subjects.Find(s => s.Code.ToLower() == code.ToLower()).AnyAsync();
}
