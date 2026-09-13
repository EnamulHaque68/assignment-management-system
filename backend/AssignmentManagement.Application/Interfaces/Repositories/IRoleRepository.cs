using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Application.Interfaces.Repositories;

public interface IRoleRepository
{
    Task<Role?> GetByIdAsync(string id);
    Task<Role?> GetByNameAsync(string name);
    Task<List<Role>> GetAllAsync();
    Task<Role> CreateAsync(Role role);
}
