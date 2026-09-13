using AssignmentManagement.Application.DTOs.Classes;
using AssignmentManagement.Application.Exceptions;
using AssignmentManagement.Application.Interfaces.Repositories;
using AssignmentManagement.Application.Interfaces.Services;
using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Infrastructure.Services;

public class ClassService : IClassService
{
    private readonly IClassRepository _repository;

    public ClassService(IClassRepository repository) => _repository = repository;

    public async Task<List<ClassResponse>> GetAllAsync() =>
        (await _repository.GetAllAsync()).Select(Map).ToList();

    public async Task<ClassResponse> GetByIdAsync(string id)
    {
        var entity = await _repository.GetByIdAsync(id) ?? throw new NotFoundException("Class not found.");
        return Map(entity);
    }

    public async Task<ClassResponse> CreateAsync(UpsertClassRequest request)
    {
        if (await _repository.CodeExistsAsync(request.Code))
            throw new ConflictException("A class with this code already exists.");

        var entity = new Class
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

    public async Task<ClassResponse> UpdateAsync(string id, UpsertClassRequest request)
    {
        var entity = await _repository.GetByIdAsync(id) ?? throw new NotFoundException("Class not found.");
        entity.Name = request.Name;
        entity.Code = request.Code;
        entity.Description = request.Description;
        entity.IsActive = request.IsActive;
        await _repository.UpdateAsync(entity);
        return Map(entity);
    }

    public async Task DeleteAsync(string id)
    {
        _ = await _repository.GetByIdAsync(id) ?? throw new NotFoundException("Class not found.");
        await _repository.DeleteAsync(id);
    }

    private static ClassResponse Map(Class c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Code = c.Code,
        Description = c.Description,
        IsActive = c.IsActive,
        CreatedAt = c.CreatedAt
    };
}
