using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Application.Interfaces.Repositories;

public interface ITeacherAssignmentRepository
{
    Task<TeacherAssignment?> GetByIdAsync(string id);
    Task<List<TeacherAssignment>> GetAllAsync();
    Task<List<TeacherAssignment>> GetByTeacherIdAsync(string teacherId);
    Task<bool> ExistsAsync(string teacherId, string classId, string subjectId);
    Task<TeacherAssignment> CreateAsync(TeacherAssignment entity);
    Task DeleteAsync(string id);
}
