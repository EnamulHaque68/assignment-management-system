using AssignmentManagement.Application.Interfaces.Repositories;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Infrastructure.Data;
using MongoDB.Driver;

namespace AssignmentManagement.Infrastructure.Repositories;

public class ClassRepository : IClassRepository
{
    private readonly MongoDbContext _context;

    public ClassRepository(MongoDbContext context) => _context = context;

    public async Task<Class?> GetByIdAsync(string id) =>
        await _context.Classes.Find(c => c.Id == id).FirstOrDefaultAsync();

    public async Task<List<Class>> GetAllAsync() =>
        await _context.Classes.Find(_ => true).SortBy(c => c.Name).ToListAsync();

    public async Task<Class> CreateAsync(Class entity)
    {
        await _context.Classes.InsertOneAsync(entity);
        return entity;
    }

    public async Task UpdateAsync(Class entity) =>
        await _context.Classes.ReplaceOneAsync(c => c.Id == entity.Id, entity);

    public async Task DeleteAsync(string id) =>
        await _context.Classes.DeleteOneAsync(c => c.Id == id);

    public async Task<bool> CodeExistsAsync(string code) =>
        await _context.Classes.Find(c => c.Code.ToLower() == code.ToLower()).AnyAsync();
}
