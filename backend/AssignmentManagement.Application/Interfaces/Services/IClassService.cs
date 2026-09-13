using AssignmentManagement.Application.DTOs.Classes;

namespace AssignmentManagement.Application.Interfaces.Services;

public interface IClassService
{
    Task<List<ClassResponse>> GetAllAsync();
    Task<ClassResponse> GetByIdAsync(string id);
    Task<ClassResponse> CreateAsync(UpsertClassRequest request);
    Task<ClassResponse> UpdateAsync(string id, UpsertClassRequest request);
    Task DeleteAsync(string id);
}
