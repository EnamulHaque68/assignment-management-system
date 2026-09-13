using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Application.Interfaces.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(string id);
    Task<User?> GetByEmailAsync(string email);
    Task<List<User>> GetAllAsync();
    Task<User> CreateAsync(User user);
    Task UpdateAsync(User user);
    Task DeleteAsync(string id);
    Task<bool> EmailExistsAsync(string email);
    Task EnsureIndexesAsync();
}
