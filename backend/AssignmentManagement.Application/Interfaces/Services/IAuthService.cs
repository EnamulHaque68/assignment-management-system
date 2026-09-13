using AssignmentManagement.Application.DTOs.Auth;

namespace AssignmentManagement.Application.Interfaces.Services;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
}
