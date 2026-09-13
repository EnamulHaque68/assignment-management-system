using AssignmentManagement.Application.DTOs.Assignments;
using AssignmentManagement.Application.Exceptions;
using AssignmentManagement.Application.Interfaces.Repositories;
using AssignmentManagement.Application.Interfaces.Services;
using AssignmentManagement.Domain.Enums;
using Microsoft.Extensions.Logging;
using DomainAssignment = AssignmentManagement.Domain.Entities.Assignment;

namespace AssignmentManagement.Infrastructure.Services;

public class AssignmentService : IAssignmentService
{
    private readonly IAssignmentRepository _assignmentRepository;
    private readonly ITeacherAssignmentRepository _teacherAssignmentRepository;
    private readonly ISubmissionRepository _submissionRepository;
    private readonly IClassRepository _classRepository;
    private readonly ISubjectRepository _subjectRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<AssignmentService> _logger;

    public AssignmentService(
        IAssignmentRepository assignmentRepository,
        ITeacherAssignmentRepository teacherAssignmentRepository,
        ISubmissionRepository submissionRepository,
        IClassRepository classRepository,
        ISubjectRepository subjectRepository,
        IUserRepository userRepository,
        ILogger<AssignmentService> logger)
    {
        _assignmentRepository = assignmentRepository;
        _teacherAssignmentRepository = teacherAssignmentRepository;
        _submissionRepository = submissionRepository;
        _classRepository = classRepository;
        _subjectRepository = subjectRepository;
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<List<AssignmentResponse>> GetForCallerAsync(string callerId, string callerRole, string? callerClassId)
    {
        List<DomainAssignment> assignments;

        if (callerRole == RoleName.Admin)
        {
            assignments = await _assignmentRepository.GetAllAsync();
        }
        else if (callerRole == RoleName.Teacher)
        {
            assignments = await _assignmentRepository.GetByTeacherIdAsync(callerId);
        }
        else // Student - RULE 1 + RULE 2: only Published assignments for own class.
        {
            if (string.IsNullOrWhiteSpace(callerClassId))
                return new List<AssignmentResponse>();

            assignments = await _assignmentRepository.GetPublishedByClassIdAsync(callerClassId);
        }

        var result = new List<AssignmentResponse>();
        foreach (var a in assignments)
            result.Add(await MapAsync(a, callerRole == RoleName.Student ? callerId : null));

        return result;
    }

    public async Task<AssignmentResponse> GetByIdAsync(string id, string callerId, string callerRole, string? callerClassId)
    {
        var assignment = await _assignmentRepository.GetByIdAsync(id)
            ?? throw new NotFoundException("Assignment not found.");

        if (callerRole == RoleName.Student)
        {
            // RULE 1: Draft is hidden from students.
            if (assignment.Status != AssignmentStatus.Published)
                throw new NotFoundException("Assignment not found.");

            // RULE 2 / TEST 8: student from another class cannot access it.
            if (assignment.ClassId != callerClassId)
                throw new ForbiddenException("You do not have access to this assignment.");
        }
        else if (callerRole == RoleName.Teacher && assignment.TeacherId != callerId)
        {
            throw new ForbiddenException("You do not have access to this assignment.");
        }

        return await MapAsync(assignment, callerRole == RoleName.Student ? callerId : null);
    }

    public async Task<AssignmentResponse> CreateAsync(CreateAssignmentRequest request, string teacherId)
    {
        await EnsureTeacherIsAssignedAsync(teacherId, request.ClassId, request.SubjectId);

        var assignment = new DomainAssignment
        {
            Title = request.Title,
            Description = request.Description,
            ClassId = request.ClassId,
            SubjectId = request.SubjectId,
            TeacherId = teacherId,
            Deadline = request.Deadline,
            MaximumMarks = request.MaximumMarks,
            Status = request.PublishNow ? AssignmentStatus.Published : AssignmentStatus.Draft,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _assignmentRepository.CreateAsync(assignment);
        _logger.LogInformation("Teacher {TeacherId} created assignment {Title} ({Status})",
            teacherId, assignment.Title, assignment.Status);

        return await MapAsync(assignment, null);
    }

    public async Task<AssignmentResponse> UpdateAsync(string id, UpdateAssignmentRequest request, string teacherId)
    {
        var assignment = await _assignmentRepository.GetByIdAsync(id)
            ?? throw new NotFoundException("Assignment not found.");

        if (assignment.TeacherId != teacherId)
            throw new ForbiddenException("You can only edit your own assignments.");

        await EnsureTeacherIsAssignedAsync(teacherId, request.ClassId, request.SubjectId);

        assignment.Title = request.Title;
        assignment.Description = request.Description;
        assignment.ClassId = request.ClassId;
        assignment.SubjectId = request.SubjectId;
        assignment.Deadline = request.Deadline;
        assignment.MaximumMarks = request.MaximumMarks;
        assignment.UpdatedAt = DateTime.UtcNow;

        await _assignmentRepository.UpdateAsync(assignment);
        return await MapAsync(assignment, null);
    }

    public async Task DeleteAsync(string id, string teacherId)
    {
        var assignment = await _assignmentRepository.GetByIdAsync(id)
            ?? throw new NotFoundException("Assignment not found.");

        if (assignment.TeacherId != teacherId)
            throw new ForbiddenException("You can only delete your own assignments.");

        await _assignmentRepository.DeleteAsync(id);
    }

    public async Task<AssignmentResponse> SetStatusAsync(string id, string teacherId, bool publish)
    {
        var assignment = await _assignmentRepository.GetByIdAsync(id)
            ?? throw new NotFoundException("Assignment not found.");

        if (assignment.TeacherId != teacherId)
            throw new ForbiddenException("You can only change status of your own assignments.");

        assignment.Status = publish ? AssignmentStatus.Published : AssignmentStatus.Draft;
        assignment.UpdatedAt = DateTime.UtcNow;
        await _assignmentRepository.UpdateAsync(assignment);

        return await MapAsync(assignment, null);
    }

    /// RULE 9: teacher may only create/update assignments for a class+subject they are assigned to.
    private async Task EnsureTeacherIsAssignedAsync(string teacherId, string classId, string subjectId)
    {
        var assignments = await _teacherAssignmentRepository.GetByTeacherIdAsync(teacherId);
        var isAssigned = assignments.Any(a => a.ClassId == classId && a.SubjectId == subjectId);

        if (!isAssigned)
            throw new ForbiddenException("You are not assigned to teach this class/subject combination.");
    }

    private async Task<AssignmentResponse> MapAsync(DomainAssignment a, string? forStudentId)
    {
        var cls = await _classRepository.GetByIdAsync(a.ClassId);
        var subject = await _subjectRepository.GetByIdAsync(a.SubjectId);
        var teacher = await _userRepository.GetByIdAsync(a.TeacherId);

        var response = new AssignmentResponse
        {
            Id = a.Id,
            Title = a.Title,
            Description = a.Description,
            ClassId = a.ClassId,
            ClassName = cls?.Name ?? "Unknown",
            SubjectId = a.SubjectId,
            SubjectName = subject?.Name ?? "Unknown",
            TeacherId = a.TeacherId,
            TeacherName = teacher?.FullName ?? "Unknown",
            Deadline = a.Deadline,
            MaximumMarks = a.MaximumMarks,
            Status = a.Status.ToString(),
            CreatedAt = a.CreatedAt,
            UpdatedAt = a.UpdatedAt
        };

        if (!string.IsNullOrWhiteSpace(forStudentId))
        {
            var submission = await _submissionRepository.GetByAssignmentAndStudentAsync(a.Id, forStudentId);
            if (submission is not null)
            {
                response.MySubmissionStatus = submission.Status.ToString();
                response.MySubmissionMarks = submission.Marks;
            }
        }

        return response;
    }
}
