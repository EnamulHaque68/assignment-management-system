using AssignmentManagement.Application.DTOs.Auth;
using AssignmentManagement.Application.Exceptions;
using AssignmentManagement.Application.Interfaces.Repositories;
using AssignmentManagement.Application.Interfaces.Services;
using Microsoft.Extensions.Logging;

namespace AssignmentManagement.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        IRoleRepository roleRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _logger = logger;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        _logger.LogInformation("Login attempt for {Email}", request.Email);

        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user is null)
        {
            _logger.LogWarning("Login failed - user not found: {Email}", request.Email);
            throw new UnauthorizedAppException("Invalid email or password.");
        }

        // RULE 12: inactive users cannot login.
        if (!user.IsActive)
        {
            _logger.LogWarning("Login failed - inactive user: {Email}", request.Email);
            throw new UnauthorizedAppException("This account has been deactivated.");
        }

        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            _logger.LogWarning("Login failed - bad password: {Email}", request.Email);
            throw new UnauthorizedAppException("Invalid email or password.");
        }

        var role = await _roleRepository.GetByIdAsync(user.RoleId);
        if (role is null)
        {
            throw new AppException("User has no valid role assigned.", 500);
        }

        var token = _jwtTokenGenerator.GenerateToken(user, role.Name);

        _logger.LogInformation("Login succeeded for {Email} as {Role}", request.Email, role.Name);

        return new LoginResponse
        {
            Token = token,
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = role.Name,
            AvatarUrl = user.AvatarUrl,
            PhoneNumber = user.PhoneNumber,
            Bio = user.Bio,
            Address = user.Address,
            Department = user.Department,
            ClassId = user.ClassId
        };
    }
}
