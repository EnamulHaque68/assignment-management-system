using AssignmentManagement.Application.DTOs.Users;
using AssignmentManagement.Application.Exceptions;
using AssignmentManagement.Application.Interfaces.Repositories;
using AssignmentManagement.Application.Interfaces.Services;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace AssignmentManagement.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ILogger<UserService> _logger;

    public UserService(
        IUserRepository userRepository,
        IRoleRepository roleRepository,
        IPasswordHasher passwordHasher,
        ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _passwordHasher = passwordHasher;
        _logger = logger;
    }

    public async Task<List<UserResponse>> GetAllAsync()
    {
        var users = await _userRepository.GetAllAsync();
        var roles = await _roleRepository.GetAllAsync();
        var roleMap = roles.ToDictionary(r => r.Id, r => r.Name);

        return users.Select(u => Map(u, roleMap.GetValueOrDefault(u.RoleId, "Unknown"))).ToList();
    }

    public async Task<UserResponse> GetByIdAsync(string id)
    {
        var user = await _userRepository.GetByIdAsync(id) ?? throw new NotFoundException("User not found.");
        var role = await _roleRepository.GetByIdAsync(user.RoleId);
        return Map(user, role?.Name ?? "Unknown");
    }

    public async Task<UserResponse> CreateAsync(CreateUserRequest request)
    {
        if (await _userRepository.EmailExistsAsync(request.Email))
            throw new ConflictException("A user with this email already exists.");

        var role = await _roleRepository.GetByNameAsync(request.Role)
            ?? throw new AppException($"Role \"{request.Role}\" does not exist.");

        if (role.Name == RoleName.Student && string.IsNullOrWhiteSpace(request.ClassId))
            throw new AppException("ClassId is required for a Student.");

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = _passwordHasher.Hash(request.Password),
            RoleId = role.Id,
            ClassId = role.Name == RoleName.Student ? request.ClassId : null,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.CreateAsync(user);
        _logger.LogInformation("Admin created user {Email} with role {Role}", user.Email, role.Name);

        return Map(user, role.Name);
    }

    public async Task<BatchCreateUsersResult> BatchCreateAsync(BatchCreateUsersRequest request)
    {
        var result = new BatchCreateUsersResult();

        foreach (var userReq in request.Users)
        {
            try
            {
                var created = await CreateAsync(userReq);
                result.CreatedUsers.Add(created);
                result.CreatedCount++;
            }
            catch (Exception ex)
            {
                result.Errors.Add($"Failed for '{userReq.Email}': {ex.Message}");
            }
        }

        return result;
    }

    public async Task<UserResponse> UpdateAsync(string id, UpdateUserRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id) ?? throw new NotFoundException("User not found.");
        var role = await _roleRepository.GetByIdAsync(user.RoleId);

        user.FullName = request.FullName;
        user.IsActive = request.IsActive;
        if (role?.Name == RoleName.Student)
            user.ClassId = request.ClassId;

        if (request.AvatarUrl != null) user.AvatarUrl = request.AvatarUrl;
        if (request.PhoneNumber != null) user.PhoneNumber = request.PhoneNumber;
        if (request.Bio != null) user.Bio = request.Bio;
        if (request.Address != null) user.Address = request.Address;
        if (request.Department != null) user.Department = request.Department;

        if (!string.IsNullOrWhiteSpace(request.Password))
            user.PasswordHash = _passwordHasher.Hash(request.Password);

        await _userRepository.UpdateAsync(user);
        _logger.LogInformation("Admin updated user {Email}", user.Email);

        return Map(user, role?.Name ?? "Unknown");
    }

    public async Task DeleteAsync(string id)
    {
        var user = await _userRepository.GetByIdAsync(id) ?? throw new NotFoundException("User not found.");
        await _userRepository.DeleteAsync(id);
        _logger.LogInformation("Admin deleted user {Email}", user.Email);
    }

    private static UserResponse Map(User u, string roleName) => new()
    {
        Id = u.Id,
        FullName = u.FullName,
        Email = u.Email,
        Role = roleName,
        ClassId = u.ClassId,
        IsActive = u.IsActive,
        CreatedAt = u.CreatedAt,
        AvatarUrl = u.AvatarUrl,
        PhoneNumber = u.PhoneNumber,
        Bio = u.Bio,
        Address = u.Address,
        Department = u.Department
    };
}
