using AssignmentManagement.Application.DTOs.Users;

namespace AssignmentManagement.Application.Interfaces.Services;

public interface IProfileService
{
    Task<UserProfileResponse> GetProfileAsync(string userId);
    Task<UserProfileResponse> UpdateProfileAsync(string userId, UpdateProfileRequest request);
    Task ChangePasswordAsync(string userId, ChangePasswordRequest request);
}
