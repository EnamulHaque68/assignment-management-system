using AssignmentManagement.Application.Interfaces.Repositories;
using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Infrastructure.Data;
using MongoDB.Driver;

namespace AssignmentManagement.Infrastructure.Repositories;

public class TeacherAssignmentRepository : ITeacherAssignmentRepository
{
    private readonly MongoDbContext _context;

    public TeacherAssignmentRepository(MongoDbContext context) => _context = context;

    public async Task<TeacherAssignment?> GetByIdAsync(string id) =>
        await _context.TeacherAssignments.Find(t => t.Id == id).FirstOrDefaultAsync();

    public async Task<List<TeacherAssignment>> GetAllAsync() =>
        await _context.TeacherAssignments.Find(_ => true).SortByDescending(t => t.CreatedAt).ToListAsync();

    public async Task<List<TeacherAssignment>> GetByTeacherIdAsync(string teacherId) =>
        await _context.TeacherAssignments.Find(t => t.TeacherId == teacherId).ToListAsync();

    public async Task<bool> ExistsAsync(string teacherId, string classId, string subjectId) =>
        await _context.TeacherAssignments
            .Find(t => t.TeacherId == teacherId && t.ClassId == classId && t.SubjectId == subjectId)
            .AnyAsync();

    public async Task<TeacherAssignment> CreateAsync(TeacherAssignment entity)
    {
        await _context.TeacherAssignments.InsertOneAsync(entity);
        return entity;
    }

    public async Task DeleteAsync(string id) =>
        await _context.TeacherAssignments.DeleteOneAsync(t => t.Id == id);
}
