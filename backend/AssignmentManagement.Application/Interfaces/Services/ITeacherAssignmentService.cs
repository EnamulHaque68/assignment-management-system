using AssignmentManagement.Application.DTOs.TeacherAssignments;

namespace AssignmentManagement.Application.Interfaces.Services;

public interface ITeacherAssignmentService
{
    Task<List<TeacherAssignmentResponse>> GetAllAsync();
    Task<TeacherAssignmentResponse> CreateAsync(CreateTeacherAssignmentRequest request);
    Task DeleteAsync(string id);
}
