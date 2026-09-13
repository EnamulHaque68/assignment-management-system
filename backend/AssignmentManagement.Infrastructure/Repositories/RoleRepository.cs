using AssignmentManagement.Application.Interfaces.Repositories;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Infrastructure.Data;
using MongoDB.Driver;

namespace AssignmentManagement.Infrastructure.Repositories;

public class RoleRepository : IRoleRepository
{
    private readonly MongoDbContext _context;

    public RoleRepository(MongoDbContext context) => _context = context;

    public async Task<Role?> GetByIdAsync(string id) =>
        await _context.Roles.Find(r => r.Id == id).FirstOrDefaultAsync();

    public async Task<Role?> GetByNameAsync(string name) =>
        await _context.Roles.Find(r => r.Name == name).FirstOrDefaultAsync();

    public async Task<List<Role>> GetAllAsync() =>
        await _context.Roles.Find(_ => true).ToListAsync();

    public async Task<Role> CreateAsync(Role role)
    {
        await _context.Roles.InsertOneAsync(role);
        return role;
    }
}
