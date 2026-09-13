using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Application.Interfaces.Services;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user, string roleName);
}
