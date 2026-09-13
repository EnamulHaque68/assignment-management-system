using AssignmentManagement.Application.DTOs.Auth;
using AssignmentManagement.Application.Exceptions;
using AssignmentManagement.Application.Interfaces.Repositories;
using AssignmentManagement.Application.Interfaces.Services;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using AssignmentManagement.Infrastructure.Services;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace AssignmentManagement.Tests;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepo = new();
    private readonly Mock<IRoleRepository> _roleRepo = new();
    private readonly Mock<IPasswordHasher> _hasher = new();
    private readonly Mock<IJwtTokenGenerator> _jwt = new();
    private readonly AuthService _sut;

    public AuthServiceTests()
    {
        _sut = new AuthService(
            _userRepo.Object,
            _roleRepo.Object,
            _hasher.Object,
            _jwt.Object,
            Mock.Of<ILogger<AuthService>>());
    }

    // TEST 1: Invalid login rejected (unknown email).
    [Fact]
    public async Task Login_UnknownEmail_ThrowsUnauthorized()
    {
        _userRepo.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((User?)null);

        var request = new LoginRequest { Email = "nobody@x.com", Password = "whatever" };

        await Assert.ThrowsAsync<UnauthorizedAppException>(() => _sut.LoginAsync(request));
    }

    // TEST 1 (variant): wrong password rejected.
    [Fact]
    public async Task Login_WrongPassword_ThrowsUnauthorized()
    {
        var user = new User { Email = "a@a.com", PasswordHash = "hash", IsActive = true, RoleId = "role1" };
        _userRepo.Setup(r => r.GetByEmailAsync("a@a.com")).ReturnsAsync(user);
        _hasher.Setup(h => h.Verify("wrong", "hash")).Returns(false);

        var request = new LoginRequest { Email = "a@a.com", Password = "wrong" };

        await Assert.ThrowsAsync<UnauthorizedAppException>(() => _sut.LoginAsync(request));
    }

    // TEST 2: Inactive user cannot login.
    [Fact]
    public async Task Login_InactiveUser_ThrowsUnauthorized()
    {
        var user = new User { Email = "a@a.com", PasswordHash = "hash", IsActive = false, RoleId = "role1" };
        _userRepo.Setup(r => r.GetByEmailAsync("a@a.com")).ReturnsAsync(user);

        var request = new LoginRequest { Email = "a@a.com", Password = "Admin@123" };

        await Assert.ThrowsAsync<UnauthorizedAppException>(() => _sut.LoginAsync(request));
    }

    [Fact]
    public async Task Login_ValidActiveUser_ReturnsToken()
    {
        var user = new User { Id = "u1", Email = "a@a.com", PasswordHash = "hash", IsActive = true, RoleId = "role1", FullName = "A" };
        var role = new Role { Id = "role1", Name = RoleName.Admin };

        _userRepo.Setup(r => r.GetByEmailAsync("a@a.com")).ReturnsAsync(user);
        _hasher.Setup(h => h.Verify("Admin@123", "hash")).Returns(true);
        _roleRepo.Setup(r => r.GetByIdAsync("role1")).ReturnsAsync(role);
        _jwt.Setup(j => j.GenerateToken(user, RoleName.Admin)).Returns("fake-jwt-token");

        var result = await _sut.LoginAsync(new LoginRequest { Email = "a@a.com", Password = "Admin@123" });

        Assert.Equal("fake-jwt-token", result.Token);
        Assert.Equal(RoleName.Admin, result.Role);
    }
}
