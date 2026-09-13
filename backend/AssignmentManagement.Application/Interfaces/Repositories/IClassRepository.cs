using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Application.Interfaces.Repositories;

public interface IClassRepository
{
    Task<Class?> GetByIdAsync(string id);
    Task<List<Class>> GetAllAsync();
    Task<Class> CreateAsync(Class entity);
    Task UpdateAsync(Class entity);
    Task DeleteAsync(string id);
    Task<bool> CodeExistsAsync(string code);
}
