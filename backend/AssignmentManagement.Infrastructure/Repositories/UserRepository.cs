using AssignmentManagement.Application.Interfaces.Repositories;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Infrastructure.Data;
using MongoDB.Driver;

namespace AssignmentManagement.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly MongoDbContext _context;

    public UserRepository(MongoDbContext context) => _context = context;

    public async Task<User?> GetByIdAsync(string id) =>
        await _context.Users.Find(u => u.Id == id).FirstOrDefaultAsync();

    public async Task<User?> GetByEmailAsync(string email) =>
        await _context.Users.Find(u => u.Email.ToLower() == email.ToLower()).FirstOrDefaultAsync();

    public async Task<List<User>> GetAllAsync() =>
        await _context.Users.Find(_ => true).SortByDescending(u => u.CreatedAt).ToListAsync();

    public async Task<User> CreateAsync(User user)
    {
        await _context.Users.InsertOneAsync(user);
        return user;
    }

    public async Task UpdateAsync(User user) =>
        await _context.Users.ReplaceOneAsync(u => u.Id == user.Id, user);

    public async Task DeleteAsync(string id) =>
        await _context.Users.DeleteOneAsync(u => u.Id == id);

    public async Task<bool> EmailExistsAsync(string email) =>
        await _context.Users.Find(u => u.Email.ToLower() == email.ToLower()).AnyAsync();

    public async Task EnsureIndexesAsync()
    {
        var indexKeys = Builders<User>.IndexKeys.Ascending(u => u.Email);
        var indexModel = new CreateIndexModel<User>(indexKeys, new CreateIndexOptions { Unique = true });
        await _context.Users.Indexes.CreateOneAsync(indexModel);
    }
}
