using AssignmentManagement.Application.DTOs.Submissions;
using AssignmentManagement.Application.Exceptions;
using AssignmentManagement.Application.Interfaces.Repositories;
using AssignmentManagement.Application.Interfaces.Services;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;

namespace AssignmentManagement.Infrastructure.Services;

public class SubmissionService : ISubmissionService
{
    private readonly ISubmissionRepository _submissionRepository;
    private readonly IAssignmentRepository _assignmentRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<SubmissionService> _logger;

    public SubmissionService(
        ISubmissionRepository submissionRepository,
        IAssignmentRepository assignmentRepository,
        IUserRepository userRepository,
        ILogger<SubmissionService> logger)
    {
        _submissionRepository = submissionRepository;
        _assignmentRepository = assignmentRepository;
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<SubmissionResponse> CreateAsync(CreateSubmissionRequest request, string studentId)
    {
        var assignment = await _assignmentRepository.GetByIdAsync(request.AssignmentId)
            ?? throw new NotFoundException("Assignment not found.");

        var student = await _userRepository.GetByIdAsync(studentId)
            ?? throw new NotFoundException("Student not found.");

        // RULE 10: assignment must be Published.
        if (assignment.Status != AssignmentStatus.Published)
            throw new AppException("You cannot submit to an assignment that has not been published.");

        // RULE 2: student can only submit for their own class's assignments.
        if (assignment.ClassId != student.ClassId)
            throw new ForbiddenException("You do not have access to this assignment.");

        // RULE 3: cannot submit after deadline.
        if (DateTime.UtcNow > assignment.Deadline)
            throw new AppException("You cannot submit this assignment because the deadline has passed.");

        // RULE 11: one submission per student per assignment (also enforced by unique index).
        var existing = await _submissionRepository.GetByAssignmentAndStudentAsync(request.AssignmentId, studentId);
        if (existing is not null)
            throw new ConflictException("You have already submitted this assignment. Use update instead.");

        var submission = new Submission
        {
            AssignmentId = request.AssignmentId,
            StudentId = studentId,
            Answer = request.Answer,
            SubmittedAt = DateTime.UtcNow,
            UpdatedAt = null,
            Marks = null,
            Feedback = null,
            Status = SubmissionStatus.Submitted
        };

        try
        {
            await _submissionRepository.CreateAsync(submission);
        }
        catch (MongoWriteException ex) when (ex.WriteError?.Category == ServerErrorCategory.DuplicateKey)
        {
            // Safety net in case of a race condition - the unique index is the real guard.
            throw new ConflictException("You have already submitted this assignment. Use update instead.");
        }

        _logger.LogInformation("Student {StudentId} submitted assignment {AssignmentId}", studentId, request.AssignmentId);

        return await MapAsync(submission, assignment);
    }

    public async Task<SubmissionResponse> UpdateAsync(string id, UpdateSubmissionRequest request, string studentId)
    {
        var submission = await _submissionRepository.GetByIdAsync(id)
            ?? throw new NotFoundException("Submission not found.");

        // RULE 5 / RULE 6: cannot access or modify another student's submission.
        if (submission.StudentId != studentId)
            throw new ForbiddenException("You cannot modify another student's submission.");

        var assignment = await _assignmentRepository.GetByIdAsync(submission.AssignmentId)
            ?? throw new NotFoundException("Assignment not found.");

        // RULE 4: can only update before deadline.
        if (DateTime.UtcNow > assignment.Deadline)
            throw new AppException("You cannot update this submission because the deadline has passed.");

        submission.Answer = request.Answer;
        submission.UpdatedAt = DateTime.UtcNow;
        await _submissionRepository.UpdateAsync(submission);

        _logger.LogInformation("Student {StudentId} updated submission {SubmissionId}", studentId, id);

        return await MapAsync(submission, assignment);
    }

    public async Task<List<SubmissionResponse>> GetMyAsync(string studentId)
    {
        var submissions = await _submissionRepository.GetByStudentIdAsync(studentId);
        var result = new List<SubmissionResponse>();

        foreach (var s in submissions)
        {
            var assignment = await _assignmentRepository.GetByIdAsync(s.AssignmentId);
            if (assignment is not null)
                result.Add(await MapAsync(s, assignment));
        }

        return result;
    }

    public async Task<List<SubmissionResponse>> GetByAssignmentAsync(string assignmentId, string teacherId)
    {
        var assignment = await _assignmentRepository.GetByIdAsync(assignmentId)
            ?? throw new NotFoundException("Assignment not found.");

        // RULE 7: teacher can only view submissions of assignments they own.
        if (assignment.TeacherId != teacherId)
            throw new ForbiddenException("You are not authorized to view these submissions.");

        var submissions = await _submissionRepository.GetByAssignmentIdAsync(assignmentId);
        var result = new List<SubmissionResponse>();
        foreach (var s in submissions)
            result.Add(await MapAsync(s, assignment));

        return result;
    }

    public async Task<SubmissionResponse> ReviewAsync(string id, ReviewSubmissionRequest request, string teacherId)
    {
        var submission = await _submissionRepository.GetByIdAsync(id)
            ?? throw new NotFoundException("Submission not found.");

        var assignment = await _assignmentRepository.GetByIdAsync(submission.AssignmentId)
            ?? throw new NotFoundException("Assignment not found.");

        // RULE 7 / TEST 14: teacher can review only submissions of assignments they are authorized for.
        if (assignment.TeacherId != teacherId)
            throw new ForbiddenException("You are not authorized to review this submission.");

        // RULE 8 / TEST 15: marks cannot exceed maximum marks.
        if (request.Marks < 0 || request.Marks > assignment.MaximumMarks)
            throw new AppException($"Marks must be between 0 and {assignment.MaximumMarks}.");

        submission.Marks = request.Marks;
        submission.Feedback = request.Feedback;
        submission.Status = request.Status?.ToLower() switch
        {
            "rejected" => SubmissionStatus.Rejected,
            _ => SubmissionStatus.Reviewed
        };
        submission.UpdatedAt = DateTime.UtcNow;

        await _submissionRepository.UpdateAsync(submission);
        _logger.LogInformation("Teacher {TeacherId} reviewed submission {SubmissionId}", teacherId, id);

        return await MapAsync(submission, assignment);
    }

    private async Task<SubmissionResponse> MapAsync(Submission s, Domain.Entities.Assignment assignment)
    {
        var student = await _userRepository.GetByIdAsync(s.StudentId);

        return new SubmissionResponse
        {
            Id = s.Id,
            AssignmentId = s.AssignmentId,
            AssignmentTitle = assignment.Title,
            StudentId = s.StudentId,
            StudentName = student?.FullName ?? "Unknown",
            Answer = s.Answer,
            SubmittedAt = s.SubmittedAt,
            UpdatedAt = s.UpdatedAt,
            Marks = s.Marks,
            MaximumMarks = assignment.MaximumMarks,
            Feedback = s.Feedback,
            Status = s.Status.ToString()
        };
    }
}
