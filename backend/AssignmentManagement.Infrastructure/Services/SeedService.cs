using AssignmentManagement.Application.Interfaces.Repositories;
using AssignmentManagement.Application.Interfaces.Services;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace AssignmentManagement.Infrastructure.Services;

public class SeedService : ISeedService
{
    private readonly IRoleRepository _roleRepository;
    private readonly IUserRepository _userRepository;
    private readonly IClassRepository _classRepository;
    private readonly ISubjectRepository _subjectRepository;
    private readonly ITeacherAssignmentRepository _teacherAssignmentRepository;
    private readonly IAssignmentRepository _assignmentRepository;
    private readonly ISubmissionRepository _submissionRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ILogger<SeedService> _logger;

    public SeedService(
        IRoleRepository roleRepository,
        IUserRepository userRepository,
        IClassRepository classRepository,
        ISubjectRepository subjectRepository,
        ITeacherAssignmentRepository teacherAssignmentRepository,
        IAssignmentRepository assignmentRepository,
        ISubmissionRepository submissionRepository,
        IPasswordHasher passwordHasher,
        ILogger<SeedService> logger)
    {
        _roleRepository = roleRepository;
        _userRepository = userRepository;
        _classRepository = classRepository;
        _subjectRepository = subjectRepository;
        _teacherAssignmentRepository = teacherAssignmentRepository;
        _assignmentRepository = assignmentRepository;
        _submissionRepository = submissionRepository;
        _passwordHasher = passwordHasher;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        _logger.LogInformation("Ensuring MongoDB indexes...");
        await _userRepository.EnsureIndexesAsync();
        await _assignmentRepository.EnsureIndexesAsync();
        await _submissionRepository.EnsureIndexesAsync();

        _logger.LogInformation("Seeding roles...");
        var adminRole = await GetOrCreateRoleAsync(RoleName.Admin);
        var teacherRole = await GetOrCreateRoleAsync(RoleName.Teacher);
        var studentRole = await GetOrCreateRoleAsync(RoleName.Student);

        _logger.LogInformation("Seeding class and subject...");
        var cse6 = await GetOrCreateClassAsync("CSE-6", "CSE-6");
        var cse7 = await GetOrCreateClassAsync("CSE-7", "CSE-7");
        var webEng = await GetOrCreateSubjectAsync("Web Engineering", "WEB-ENG");
        var dbSys = await GetOrCreateSubjectAsync("Database Systems", "DB-SYS");

        _logger.LogInformation("Seeding demo users...");
        var admin = await GetOrCreateUserAsync(
            "System Administrator",
            "admin@assignment.local",
            "Admin@123",
            adminRole.Id,
            null,
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
            "+1 (555) 123-4567",
            "Central System Administrator overseeing educational platform security, user roles, and infrastructure.",
            "Chicago, IL",
            "Academic Operations"
        );

        var teacher1 = await GetOrCreateUserAsync(
            "Prof. Robert Davis",
            "teacher@assignment.local",
            "Teacher@123",
            teacherRole.Id,
            null,
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
            "+1 (555) 456-7890",
            "Associate Professor in Software Engineering & Distributed Systems.",
            "Boston, MA",
            "Department of Computer Science"
        );

        var teacher2 = await GetOrCreateUserAsync(
            "Dr. Elena Rostova",
            "teacher2@assignment.local",
            "Teacher@123",
            teacherRole.Id,
            null,
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
            "+1 (555) 567-8901",
            "Assistant Professor specializing in Database Architecture and Information Security.",
            "New York, NY",
            "Department of Information Systems"
        );

        var student1 = await GetOrCreateUserAsync(
            "Alex Morgan",
            "student@assignment.local",
            "Student@123",
            studentRole.Id,
            cse6.Id,
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
            "+1 (555) 234-5678",
            "Final year Computer Science student specializing in cloud-native applications.",
            "San Francisco, CA",
            "Computer Science"
        );

        var student2 = await GetOrCreateUserAsync(
            "Sarah Connor",
            "student2@assignment.local",
            "Student@123",
            studentRole.Id,
            cse6.Id,
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
            "+1 (555) 876-5432",
            "Passionate about full-stack engineering and distributed databases.",
            "Austin, TX",
            "Computer Science"
        );

        var student3 = await GetOrCreateUserAsync(
            "David Chen",
            "student3@assignment.local",
            "Student@123",
            studentRole.Id,
            cse6.Id,
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
            "+1 (555) 345-6789",
            "Tech enthusiast, open-source contributor and competitive programmer.",
            "Seattle, WA",
            "Computer Science"
        );

        _logger.LogInformation("Seeding teacher assignments...");
        if (!await _teacherAssignmentRepository.ExistsAsync(teacher1.Id, cse6.Id, webEng.Id))
        {
            await _teacherAssignmentRepository.CreateAsync(new TeacherAssignment
            {
                TeacherId = teacher1.Id,
                ClassId = cse6.Id,
                SubjectId = webEng.Id,
                CreatedAt = DateTime.UtcNow
            });
        }

        if (!await _teacherAssignmentRepository.ExistsAsync(teacher2.Id, cse6.Id, dbSys.Id))
        {
            await _teacherAssignmentRepository.CreateAsync(new TeacherAssignment
            {
                TeacherId = teacher2.Id,
                ClassId = cse6.Id,
                SubjectId = dbSys.Id,
                CreatedAt = DateTime.UtcNow
            });
        }

        _logger.LogInformation("Seeding sample assignment...");
        var existingAssignments = await _assignmentRepository.GetByTeacherIdAsync(teacher1.Id);
        if (!existingAssignments.Any(a => a.Title == "REST API Development"))
        {
            await _assignmentRepository.CreateAsync(new Assignment
            {
                Title = "REST API Development",
                Description = "Build a REST API using ASP.NET Core.",
                ClassId = cse6.Id,
                SubjectId = webEng.Id,
                TeacherId = teacher1.Id,
                Deadline = DateTime.UtcNow.AddDays(7),
                MaximumMarks = 20,
                Status = AssignmentStatus.Published,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }

        _logger.LogInformation("Seed complete with multiple teachers and students!");
    }

    private async Task<Role> GetOrCreateRoleAsync(string name)
    {
        var existing = await _roleRepository.GetByNameAsync(name);
        if (existing is not null) return existing;
        return await _roleRepository.CreateAsync(new Role { Name = name });
    }

    private async Task<Class> GetOrCreateClassAsync(string name, string code)
    {
        var all = await _classRepository.GetAllAsync();
        var existing = all.FirstOrDefault(c => c.Code == code);
        if (existing is not null) return existing;

        return await _classRepository.CreateAsync(new Class
        {
            Name = name,
            Code = code,
            Description = "Seeded demo class",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        });
    }

    private async Task<Subject> GetOrCreateSubjectAsync(string name, string code)
    {
        var all = await _subjectRepository.GetAllAsync();
        var existing = all.FirstOrDefault(s => s.Code == code);
        if (existing is not null) return existing;

        return await _subjectRepository.CreateAsync(new Subject
        {
            Name = name,
            Code = code,
            Description = "Seeded demo subject",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        });
    }

    private async Task<User> GetOrCreateUserAsync(
        string fullName,
        string email,
        string password,
        string roleId,
        string? classId,
        string? avatarUrl = null,
        string? phoneNumber = null,
        string? bio = null,
        string? address = null,
        string? department = null)
    {
        var existing = await _userRepository.GetByEmailAsync(email);
        if (existing is not null)
        {
            // Update profile fields if not set
            bool changed = false;
            if (string.IsNullOrEmpty(existing.AvatarUrl) && avatarUrl != null) { existing.AvatarUrl = avatarUrl; changed = true; }
            if (string.IsNullOrEmpty(existing.PhoneNumber) && phoneNumber != null) { existing.PhoneNumber = phoneNumber; changed = true; }
            if (string.IsNullOrEmpty(existing.Bio) && bio != null) { existing.Bio = bio; changed = true; }
            if (string.IsNullOrEmpty(existing.Address) && address != null) { existing.Address = address; changed = true; }
            if (string.IsNullOrEmpty(existing.Department) && department != null) { existing.Department = department; changed = true; }
            if (changed)
            {
                await _userRepository.UpdateAsync(existing);
            }
            return existing;
        }

        return await _userRepository.CreateAsync(new User
        {
            FullName = fullName,
            Email = email,
            PasswordHash = _passwordHasher.Hash(password),
            RoleId = roleId,
            ClassId = classId,
            AvatarUrl = avatarUrl,
            PhoneNumber = phoneNumber,
            Bio = bio,
            Address = address,
            Department = department,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        });
    }
}
