using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Application.Interfaces.Repositories;

public interface IAssignmentRepository
{
    Task<Assignment?> GetByIdAsync(string id);
    Task<List<Assignment>> GetAllAsync();
    Task<List<Assignment>> GetByTeacherIdAsync(string teacherId);
    Task<List<Assignment>> GetPublishedByClassIdAsync(string classId);
    Task<Assignment> CreateAsync(Assignment entity);
    Task UpdateAsync(Assignment entity);
    Task DeleteAsync(string id);
    Task EnsureIndexesAsync();
}
