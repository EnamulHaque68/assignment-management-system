using AssignmentManagement.Application.Interfaces.Services;

namespace AssignmentManagement.Infrastructure.Services;

public class PasswordHasher : IPasswordHasher
{
    public string Hash(string plainPassword) => BCrypt.Net.BCrypt.HashPassword(plainPassword);

    public bool Verify(string plainPassword, string hash) => BCrypt.Net.BCrypt.Verify(plainPassword, hash);
}
