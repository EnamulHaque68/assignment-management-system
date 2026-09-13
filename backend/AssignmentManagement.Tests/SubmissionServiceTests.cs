using AssignmentManagement.Application.DTOs.Submissions;
using AssignmentManagement.Application.Exceptions;
using AssignmentManagement.Application.Interfaces.Repositories;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using AssignmentManagement.Infrastructure.Services;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using DomainAssignment = AssignmentManagement.Domain.Entities.Assignment;

namespace AssignmentManagement.Tests;

public class SubmissionServiceTests
{
    private readonly Mock<ISubmissionRepository> _submissionRepo = new();
    private readonly Mock<IAssignmentRepository> _assignmentRepo = new();
    private readonly Mock<IUserRepository> _userRepo = new();
    private readonly SubmissionService _sut;

    public SubmissionServiceTests()
    {
        _sut = new SubmissionService(
            _submissionRepo.Object,
            _assignmentRepo.Object,
            _userRepo.Object,
            Mock.Of<ILogger<SubmissionService>>());
    }

    private static DomainAssignment PublishedAssignment(DateTime deadline, int maxMarks = 20) => new()
    {
        Id = "a1",
        ClassId = "class1",
        TeacherId = "teacher1",
        Status = AssignmentStatus.Published,
        Deadline = deadline,
        MaximumMarks = maxMarks,
        Title = "REST API Development"
    };

    // TEST 9: Student can submit before deadline.
    [Fact]
    public async Task Create_BeforeDeadline_Succeeds()
    {
        var assignment = PublishedAssignment(DateTime.UtcNow.AddDays(1));
        _assignmentRepo.Setup(r => r.GetByIdAsync("a1")).ReturnsAsync(assignment);
        _userRepo.Setup(r => r.GetByIdAsync("student1")).ReturnsAsync(new User { Id = "student1", ClassId = "class1", FullName = "S" });
        _submissionRepo.Setup(r => r.GetByAssignmentAndStudentAsync("a1", "student1")).ReturnsAsync((Submission?)null);

        var result = await _sut.CreateAsync(new CreateSubmissionRequest { AssignmentId = "a1", Answer = "My answer" }, "student1");

        Assert.Equal("Submitted", result.Status);
    }

    // TEST 10: Student cannot submit after deadline.
    [Fact]
    public async Task Create_AfterDeadline_ThrowsAppException()
    {
        var assignment = PublishedAssignment(DateTime.UtcNow.AddDays(-1));
        _assignmentRepo.Setup(r => r.GetByIdAsync("a1")).ReturnsAsync(assignment);
        _userRepo.Setup(r => r.GetByIdAsync("student1")).ReturnsAsync(new User { Id = "student1", ClassId = "class1" });

        await Assert.ThrowsAsync<AppException>(
            () => _sut.CreateAsync(new CreateSubmissionRequest { AssignmentId = "a1", Answer = "Too late" }, "student1"));
    }

    // TEST 16: Duplicate submission is rejected.
    [Fact]
    public async Task Create_AlreadySubmitted_ThrowsConflict()
    {
        var assignment = PublishedAssignment(DateTime.UtcNow.AddDays(1));
        _assignmentRepo.Setup(r => r.GetByIdAsync("a1")).ReturnsAsync(assignment);
        _userRepo.Setup(r => r.GetByIdAsync("student1")).ReturnsAsync(new User { Id = "student1", ClassId = "class1" });
        _submissionRepo.Setup(r => r.GetByAssignmentAndStudentAsync("a1", "student1"))
            .ReturnsAsync(new Submission { Id = "s1", AssignmentId = "a1", StudentId = "student1" });

        await Assert.ThrowsAsync<ConflictException>(
            () => _sut.CreateAsync(new CreateSubmissionRequest { AssignmentId = "a1", Answer = "Again" }, "student1"));
    }

    // TEST 11: Student can update own submission before deadline.
    [Fact]
    public async Task Update_OwnSubmissionBeforeDeadline_Succeeds()
    {
        var submission = new Submission { Id = "s1", AssignmentId = "a1", StudentId = "student1", Answer = "old" };
        var assignment = PublishedAssignment(DateTime.UtcNow.AddDays(1));

        _submissionRepo.Setup(r => r.GetByIdAsync("s1")).ReturnsAsync(submission);
        _assignmentRepo.Setup(r => r.GetByIdAsync("a1")).ReturnsAsync(assignment);
        _userRepo.Setup(r => r.GetByIdAsync("student1")).ReturnsAsync(new User { Id = "student1", FullName = "S" });

        var result = await _sut.UpdateAsync("s1", new UpdateSubmissionRequest { Answer = "new answer" }, "student1");

        Assert.Equal("new answer", result.Answer);
    }

    // TEST 12: Student cannot update another student's submission.
    [Fact]
    public async Task Update_AnotherStudentsSubmission_ThrowsForbidden()
    {
        var submission = new Submission { Id = "s1", AssignmentId = "a1", StudentId = "student1", Answer = "old" };
        _submissionRepo.Setup(r => r.GetByIdAsync("s1")).ReturnsAsync(submission);

        await Assert.ThrowsAsync<ForbiddenException>(
            () => _sut.UpdateAsync("s1", new UpdateSubmissionRequest { Answer = "hacked" }, "student2"));
    }

    // TEST 13: Teacher can review authorized submission.
    [Fact]
    public async Task Review_AuthorizedTeacher_Succeeds()
    {
        var submission = new Submission { Id = "s1", AssignmentId = "a1", StudentId = "student1" };
        var assignment = PublishedAssignment(DateTime.UtcNow.AddDays(1));

        _submissionRepo.Setup(r => r.GetByIdAsync("s1")).ReturnsAsync(submission);
        _assignmentRepo.Setup(r => r.GetByIdAsync("a1")).ReturnsAsync(assignment);
        _userRepo.Setup(r => r.GetByIdAsync("student1")).ReturnsAsync(new User { Id = "student1", FullName = "S" });

        var result = await _sut.ReviewAsync("s1", new ReviewSubmissionRequest { Marks = 18, Feedback = "Good" }, "teacher1");

        Assert.Equal(18, result.Marks);
        Assert.Equal("Reviewed", result.Status);
    }

    // TEST 14: Teacher cannot review unauthorized assignment.
    [Fact]
    public async Task Review_UnauthorizedTeacher_ThrowsForbidden()
    {
        var submission = new Submission { Id = "s1", AssignmentId = "a1", StudentId = "student1" };
        var assignment = PublishedAssignment(DateTime.UtcNow.AddDays(1));

        _submissionRepo.Setup(r => r.GetByIdAsync("s1")).ReturnsAsync(submission);
        _assignmentRepo.Setup(r => r.GetByIdAsync("a1")).ReturnsAsync(assignment);

        await Assert.ThrowsAsync<ForbiddenException>(
            () => _sut.ReviewAsync("s1", new ReviewSubmissionRequest { Marks = 18 }, "someone-else"));
    }

    // TEST 15: Marks greater than maximum marks are rejected.
    [Fact]
    public async Task Review_MarksExceedMaximum_ThrowsAppException()
    {
        var submission = new Submission { Id = "s1", AssignmentId = "a1", StudentId = "student1" };
        var assignment = PublishedAssignment(DateTime.UtcNow.AddDays(1), maxMarks: 20);

        _submissionRepo.Setup(r => r.GetByIdAsync("s1")).ReturnsAsync(submission);
        _assignmentRepo.Setup(r => r.GetByIdAsync("a1")).ReturnsAsync(assignment);

        await Assert.ThrowsAsync<AppException>(
            () => _sut.ReviewAsync("s1", new ReviewSubmissionRequest { Marks = 21 }, "teacher1"));
    }
}
