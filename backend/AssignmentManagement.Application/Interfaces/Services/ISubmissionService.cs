using AssignmentManagement.Application.DTOs.Submissions;

namespace AssignmentManagement.Application.Interfaces.Services;

public interface ISubmissionService
{
    Task<SubmissionResponse> CreateAsync(CreateSubmissionRequest request, string studentId);
    Task<SubmissionResponse> UpdateAsync(string id, UpdateSubmissionRequest request, string studentId);
    Task<List<SubmissionResponse>> GetMyAsync(string studentId);
    Task<List<SubmissionResponse>> GetByAssignmentAsync(string assignmentId, string teacherId);
    Task<SubmissionResponse> ReviewAsync(string id, ReviewSubmissionRequest request, string teacherId);
}
