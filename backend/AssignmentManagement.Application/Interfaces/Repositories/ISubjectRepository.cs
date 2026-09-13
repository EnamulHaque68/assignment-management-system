using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Application.Interfaces.Repositories;

public interface ISubjectRepository
{
    Task<Subject?> GetByIdAsync(string id);
    Task<List<Subject>> GetAllAsync();
    Task<Subject> CreateAsync(Subject entity);
    Task UpdateAsync(Subject entity);
    Task DeleteAsync(string id);
    Task<bool> CodeExistsAsync(string code);
}
