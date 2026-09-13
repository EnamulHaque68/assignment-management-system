using AssignmentManagement.Application.DTOs.Users;

namespace AssignmentManagement.Application.Interfaces.Services;

public interface IUserService
{
    Task<List<UserResponse>> GetAllAsync();
    Task<UserResponse> GetByIdAsync(string id);
    Task<UserResponse> CreateAsync(CreateUserRequest request);
    Task<BatchCreateUsersResult> BatchCreateAsync(BatchCreateUsersRequest request);
    Task<UserResponse> UpdateAsync(string id, UpdateUserRequest request);
    Task DeleteAsync(string id);
}
