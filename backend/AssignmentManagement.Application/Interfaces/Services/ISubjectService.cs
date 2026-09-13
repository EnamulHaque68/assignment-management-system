using AssignmentManagement.Application.DTOs.Subjects;

namespace AssignmentManagement.Application.Interfaces.Services;

public interface ISubjectService
{
    Task<List<SubjectResponse>> GetAllAsync();
    Task<SubjectResponse> GetByIdAsync(string id);
    Task<SubjectResponse> CreateAsync(UpsertSubjectRequest request);
    Task<SubjectResponse> UpdateAsync(string id, UpsertSubjectRequest request);
    Task DeleteAsync(string id);
}
