using AssignmentManagement.Application.DTOs.Assignments;
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

public class AssignmentServiceTests
{
    private readonly Mock<IAssignmentRepository> _assignmentRepo = new();
    private readonly Mock<ITeacherAssignmentRepository> _teacherAssignmentRepo = new();
    private readonly Mock<ISubmissionRepository> _submissionRepo = new();
    private readonly Mock<IClassRepository> _classRepo = new();
    private readonly Mock<ISubjectRepository> _subjectRepo = new();
    private readonly Mock<IUserRepository> _userRepo = new();
    private readonly AssignmentService _sut;

    public AssignmentServiceTests()
    {
        _classRepo.Setup(r => r.GetByIdAsync(It.IsAny<string>())).ReturnsAsync(new Class { Id = "class1", Name = "CSE-6" });
        _subjectRepo.Setup(r => r.GetByIdAsync(It.IsAny<string>())).ReturnsAsync(new Subject { Id = "subj1", Name = "Web Engineering" });
        _userRepo.Setup(r => r.GetByIdAsync(It.IsAny<string>())).ReturnsAsync(new User { Id = "teacher1", FullName = "Teacher" });

        _sut = new AssignmentService(
            _assignmentRepo.Object,
            _teacherAssignmentRepo.Object,
            _submissionRepo.Object,
            _classRepo.Object,
            _subjectRepo.Object,
            _userRepo.Object,
            Mock.Of<ILogger<AssignmentService>>());
    }

    // TEST 4: Teacher can create assignment when assigned.
    [Fact]
    public async Task Create_TeacherAssignedToClassSubject_Succeeds()
    {
        _teacherAssignmentRepo.Setup(r => r.GetByTeacherIdAsync("teacher1"))
            .ReturnsAsync(new List<TeacherAssignment>
            {
                new() { TeacherId = "teacher1", ClassId = "class1", SubjectId = "subj1" }
            });

        var request = new CreateAssignmentRequest
        {
            Title = "REST API",
            Description = "Build one",
            ClassId = "class1",
            SubjectId = "subj1",
            Deadline = DateTime.UtcNow.AddDays(3),
            MaximumMarks = 20
        };

        var result = await _sut.CreateAsync(request, "teacher1");

        Assert.Equal("REST API", result.Title);
        Assert.Equal("Draft", result.Status);
        _assignmentRepo.Verify(r => r.CreateAsync(It.IsAny<DomainAssignment>()), Times.Once);
    }

    // TEST 5: Teacher cannot create assignment for an unassigned class/subject.
    [Fact]
    public async Task Create_TeacherNotAssigned_ThrowsForbidden()
    {
        _teacherAssignmentRepo.Setup(r => r.GetByTeacherIdAsync("teacher1"))
            .ReturnsAsync(new List<TeacherAssignment>());

        var request = new CreateAssignmentRequest
        {
            Title = "REST API",
            Description = "Build one",
            ClassId = "class1",
            SubjectId = "subj1",
            Deadline = DateTime.UtcNow.AddDays(3),
            MaximumMarks = 20
        };

        await Assert.ThrowsAsync<ForbiddenException>(() => _sut.CreateAsync(request, "teacher1"));
    }

    // TEST 6: Draft assignment is hidden from student.
    [Fact]
    public async Task GetById_DraftAssignment_HiddenFromStudent()
    {
        var assignment = new DomainAssignment
        {
            Id = "a1",
            ClassId = "class1",
            Status = AssignmentStatus.Draft
        };
        _assignmentRepo.Setup(r => r.GetByIdAsync("a1")).ReturnsAsync(assignment);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _sut.GetByIdAsync("a1", "student1", RoleName.Student, "class1"));
    }

    // TEST 7: Published assignment is visible to correct class.
    [Fact]
    public async Task GetById_PublishedSameClass_Succeeds()
    {
        var assignment = new DomainAssignment
        {
            Id = "a1",
            ClassId = "class1",
            Status = AssignmentStatus.Published
        };
        _assignmentRepo.Setup(r => r.GetByIdAsync("a1")).ReturnsAsync(assignment);

        var result = await _sut.GetByIdAsync("a1", "student1", RoleName.Student, "class1");

        Assert.Equal("a1", result.Id);
    }

    // TEST 8: Student from another class cannot access assignment.
    [Fact]
    public async Task GetById_PublishedDifferentClass_ThrowsForbidden()
    {
        var assignment = new DomainAssignment
        {
            Id = "a1",
            ClassId = "class1",
            Status = AssignmentStatus.Published
        };
        _assignmentRepo.Setup(r => r.GetByIdAsync("a1")).ReturnsAsync(assignment);

        await Assert.ThrowsAsync<ForbiddenException>(
            () => _sut.GetByIdAsync("a1", "student1", RoleName.Student, "class2"));
    }
}
