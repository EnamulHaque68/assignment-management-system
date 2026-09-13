using AssignmentManagement.Application.DTOs.Assignments;

namespace AssignmentManagement.Application.Interfaces.Services;

public interface IAssignmentService
{
    Task<List<AssignmentResponse>> GetForCallerAsync(string callerId, string callerRole, string? callerClassId);
    Task<AssignmentResponse> GetByIdAsync(string id, string callerId, string callerRole, string? callerClassId);
    Task<AssignmentResponse> CreateAsync(CreateAssignmentRequest request, string teacherId);
    Task<AssignmentResponse> UpdateAsync(string id, UpdateAssignmentRequest request, string teacherId);
    Task DeleteAsync(string id, string teacherId);
    Task<AssignmentResponse> SetStatusAsync(string id, string teacherId, bool publish);
}
