using AssignmentManagement.Application.DTOs.Subjects;
using AssignmentManagement.Application.Exceptions;
using AssignmentManagement.Application.Interfaces.Repositories;
using AssignmentManagement.Application.Interfaces.Services;
using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Infrastructure.Services;

public class SubjectService : ISubjectService
{
    private readonly ISubjectRepository _repository;

    public SubjectService(ISubjectRepository repository) => _repository = repository;

    public async Task<List<SubjectResponse>> GetAllAsync() =>
        (await _repository.GetAllAsync()).Select(Map).ToList();

    public async Task<SubjectResponse> GetByIdAsync(string id)
    {
        var entity = await _repository.GetByIdAsync(id) ?? throw new NotFoundException("Subject not found.");
        return Map(entity);
    }

    public async Task<SubjectResponse> CreateAsync(UpsertSubjectRequest request)
    {
        if (await _repository.CodeExistsAsync(request.Code))
            throw new ConflictException("A subject with this code already exists.");

        var entity = new Subject
        {
            Name = request.Name,
            Code = request.Code,
            Description = request.Description,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };
        await _repository.CreateAsync(entity);
        return Map(entity);
    }

    public async Task<SubjectResponse> UpdateAsync(string id, UpsertSubjectRequest request)
    {
        var entity = await _repository.GetByIdAsync(id) ?? throw new NotFoundException("Subject not found.");
        entity.Name = request.Name;
        entity.Code = request.Code;
        entity.Description = request.Description;
        entity.IsActive = request.IsActive;
        await _repository.UpdateAsync(entity);
        return Map(entity);
    }

    public async Task DeleteAsync(string id)
    {
        _ = await _repository.GetByIdAsync(id) ?? throw new NotFoundException("Subject not found.");
        await _repository.DeleteAsync(id);
    }

    private static SubjectResponse Map(Subject s) => new()
    {
        Id = s.Id,
        Name = s.Name,
        Code = s.Code,
        Description = s.Description,
        IsActive = s.IsActive,
        CreatedAt = s.CreatedAt
    };
}
