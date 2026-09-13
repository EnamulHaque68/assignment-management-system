using AssignmentManagement.Application.DTOs.TeacherAssignments;
using AssignmentManagement.Application.Exceptions;
using AssignmentManagement.Application.Interfaces.Repositories;
using AssignmentManagement.Application.Interfaces.Services;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.Infrastructure.Services;

public class TeacherAssignmentService : ITeacherAssignmentService
{
    private readonly ITeacherAssignmentRepository _repository;
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IClassRepository _classRepository;
    private readonly ISubjectRepository _subjectRepository;

    public TeacherAssignmentService(
        ITeacherAssignmentRepository repository,
        IUserRepository userRepository,
        IRoleRepository roleRepository,
        IClassRepository classRepository,
        ISubjectRepository subjectRepository)
    {
        _repository = repository;
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _classRepository = classRepository;
        _subjectRepository = subjectRepository;
    }

    public async Task<List<TeacherAssignmentResponse>> GetAllAsync()
    {
        var items = await _repository.GetAllAsync();
        var result = new List<TeacherAssignmentResponse>();

        foreach (var item in items)
        {
            var teacher = await _userRepository.GetByIdAsync(item.TeacherId);
            var cls = await _classRepository.GetByIdAsync(item.ClassId);
            var subject = await _subjectRepository.GetByIdAsync(item.SubjectId);

            result.Add(new TeacherAssignmentResponse
            {
                Id = item.Id,
                TeacherId = item.TeacherId,
                TeacherName = teacher?.FullName ?? "Unknown",
                ClassId = item.ClassId,
                ClassName = cls?.Name ?? "Unknown",
                SubjectId = item.SubjectId,
                SubjectName = subject?.Name ?? "Unknown",
                CreatedAt = item.CreatedAt
            });
        }

        return result;
    }

    public async Task<TeacherAssignmentResponse> CreateAsync(CreateTeacherAssignmentRequest request)
    {
        var teacher = await _userRepository.GetByIdAsync(request.TeacherId)
            ?? throw new NotFoundException("Teacher not found.");

        var role = await _roleRepository.GetByIdAsync(teacher.RoleId);
        if (role?.Name != RoleName.Teacher)
            throw new AppException("Selected user is not a Teacher.");

        var cls = await _classRepository.GetByIdAsync(request.ClassId)
            ?? throw new NotFoundException("Class not found.");
        var subject = await _subjectRepository.GetByIdAsync(request.SubjectId)
            ?? throw new NotFoundException("Subject not found.");

        if (await _repository.ExistsAsync(request.TeacherId, request.ClassId, request.SubjectId))
            throw new ConflictException("This teacher is already assigned to this class and subject.");

        var entity = new TeacherAssignment
        {
            TeacherId = request.TeacherId,
            ClassId = request.ClassId,
            SubjectId = request.SubjectId,
            CreatedAt = DateTime.UtcNow
        };
        await _repository.CreateAsync(entity);

        return new TeacherAssignmentResponse
        {
            Id = entity.Id,
            TeacherId = teacher.Id,
            TeacherName = teacher.FullName,
            ClassId = cls.Id,
            ClassName = cls.Name,
            SubjectId = subject.Id,
            SubjectName = subject.Name,
            CreatedAt = entity.CreatedAt
        };
    }

    public async Task DeleteAsync(string id)
    {
        _ = await _repository.GetByIdAsync(id) ?? throw new NotFoundException("Teacher assignment not found.");
        await _repository.DeleteAsync(id);
    }
}
