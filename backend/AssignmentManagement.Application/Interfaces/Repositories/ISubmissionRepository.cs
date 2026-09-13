using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Application.Interfaces.Repositories;

public interface ISubmissionRepository
{
    Task<Submission?> GetByIdAsync(string id);
    Task<Submission?> GetByAssignmentAndStudentAsync(string assignmentId, string studentId);
    Task<List<Submission>> GetByAssignmentIdAsync(string assignmentId);
    Task<List<Submission>> GetByStudentIdAsync(string studentId);
    Task<Submission> CreateAsync(Submission entity);
    Task UpdateAsync(Submission entity);
    Task EnsureIndexesAsync();
}
