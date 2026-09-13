using AssignmentManagement.Application.DTOs.Users;
using AssignmentManagement.Application.Exceptions;
using AssignmentManagement.Application.Interfaces.Repositories;
using AssignmentManagement.Application.Interfaces.Services;
using AssignmentManagement.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace AssignmentManagement.Infrastructure.Services;

public class ProfileService : IProfileService
{
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IClassRepository _classRepository;
    private readonly ISubjectRepository _subjectRepository;
    private readonly ITeacherAssignmentRepository _teacherAssignmentRepository;
    private readonly IAssignmentRepository _assignmentRepository;
    private readonly ISubmissionRepository _submissionRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ILogger<ProfileService> _logger;

    public ProfileService(
        IUserRepository userRepository,
        IRoleRepository roleRepository,
        IClassRepository classRepository,
        ISubjectRepository subjectRepository,
        ITeacherAssignmentRepository teacherAssignmentRepository,
        IAssignmentRepository assignmentRepository,
        ISubmissionRepository submissionRepository,
        IPasswordHasher passwordHasher,
        ILogger<ProfileService> logger)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _classRepository = classRepository;
        _subjectRepository = subjectRepository;
        _teacherAssignmentRepository = teacherAssignmentRepository;
        _assignmentRepository = assignmentRepository;
        _submissionRepository = submissionRepository;
        _passwordHasher = passwordHasher;
        _logger = logger;
    }

    public async Task<UserProfileResponse> GetProfileAsync(string userId)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new NotFoundException("User not found.");

        var role = await _roleRepository.GetByIdAsync(user.RoleId);
        var roleName = role?.Name ?? "Unknown";

        var response = new UserProfileResponse
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = roleName,
            ClassId = user.ClassId,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            AvatarUrl = user.AvatarUrl,
            PhoneNumber = user.PhoneNumber,
            Bio = user.Bio,
            Address = user.Address,
            Department = user.Department
        };

        if (!string.IsNullOrEmpty(user.ClassId))
        {
            var cls = await _classRepository.GetByIdAsync(user.ClassId);
            response.ClassName = cls?.Name;
        }

        if (roleName == RoleName.Student)
        {
            var mySubmissions = await _submissionRepository.GetByStudentIdAsync(userId);
            response.CompletedSubmissions = mySubmissions.Count;

            var graded = mySubmissions.Where(s => s.Status == SubmissionStatus.Reviewed && s.Marks.HasValue).ToList();
            if (graded.Any())
            {
                response.AverageScore = Math.Round(graded.Average(s => s.Marks!.Value), 1);
            }

            if (!string.IsNullOrEmpty(user.ClassId))
            {
                var publishedAssignments = await _assignmentRepository.GetPublishedByClassIdAsync(user.ClassId);
                response.TotalAssignments = publishedAssignments.Count;
                var submittedAssignmentIds = mySubmissions.Select(s => s.AssignmentId).ToHashSet();
                response.PendingSubmissions = publishedAssignments.Count(a => !submittedAssignmentIds.Contains(a.Id));
            }
        }
        else if (roleName == RoleName.Teacher)
        {
            var myAssignments = await _assignmentRepository.GetByTeacherIdAsync(userId);
            response.TotalAssignments = myAssignments.Count;

            var teacherAllocations = await _teacherAssignmentRepository.GetByTeacherIdAsync(userId);
            response.AssignedClassesCount = teacherAllocations.Select(a => a.ClassId).Distinct().Count();
            response.AssignedSubjectsCount = teacherAllocations.Select(a => a.SubjectId).Distinct().Count();

            var classNames = new List<string>();
            var subjectNames = new List<string>();
            foreach (var alloc in teacherAllocations)
            {
                var cls = await _classRepository.GetByIdAsync(alloc.ClassId);
                if (cls != null && !classNames.Contains(cls.Name)) classNames.Add(cls.Name);

                var subj = await _subjectRepository.GetByIdAsync(alloc.SubjectId);
                if (subj != null && !subjectNames.Contains(subj.Name)) subjectNames.Add(subj.Name);
            }
            response.AssignedClassNames = classNames;
            response.AssignedSubjectNames = subjectNames;

            int pendingReviews = 0;
            foreach (var a in myAssignments)
            {
                var subs = await _submissionRepository.GetByAssignmentIdAsync(a.Id);
                pendingReviews += subs.Count(s => s.Status == SubmissionStatus.Submitted);
            }
            response.PendingSubmissions = pendingReviews;
        }
        else if (roleName == RoleName.Admin)
        {
            var allUsers = await _userRepository.GetAllAsync();
            response.TotalStudentsCount = allUsers.Count;
            var allClasses = await _classRepository.GetAllAsync();
            response.AssignedClassesCount = allClasses.Count;
            var allSubjects = await _subjectRepository.GetAllAsync();
            response.AssignedSubjectsCount = allSubjects.Count;
        }

        return response;
    }

    public async Task<UserProfileResponse> UpdateProfileAsync(string userId, UpdateProfileRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new NotFoundException("User not found.");

        user.FullName = request.FullName.Trim();
        user.AvatarUrl = request.AvatarUrl;
        user.PhoneNumber = request.PhoneNumber;
        user.Bio = request.Bio;
        user.Address = request.Address;
        user.Department = request.Department;

        await _userRepository.UpdateAsync(user);
        _logger.LogInformation("User {UserId} updated their profile", userId);

        return await GetProfileAsync(userId);
    }

    public async Task ChangePasswordAsync(string userId, ChangePasswordRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new NotFoundException("User not found.");

        if (!_passwordHasher.Verify(request.CurrentPassword, user.PasswordHash))
        {
            throw new UnauthorizedAppException("Current password is incorrect.");
        }

        user.PasswordHash = _passwordHasher.Hash(request.NewPassword);
        await _userRepository.UpdateAsync(user);
        _logger.LogInformation("User {UserId} changed their password", userId);
    }
}
